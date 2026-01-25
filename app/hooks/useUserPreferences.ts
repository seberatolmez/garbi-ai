'use client'

import useSWR from 'swr'
import { useCallback, useRef, useEffect } from 'react'
import { UserPreferencesData } from '@/lib/supabase-client'

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch preferences')
    return res.json()
})

const DEBOUNCE_MS = 1000 // Debounce saves by 1 second

export function useUserPreferences() {
    const { data, error, isLoading, mutate } = useSWR<UserPreferencesData>(
        '/api/user-preferences',
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 5000
        }
    )

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const pendingPrefsRef = useRef<UserPreferencesData | null>(null)

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [])

    /**
     * Save preferences with debouncing
     * Multiple rapid calls will only trigger one save after debounce period
     */
    const savePreferences = useCallback(async (prefs: UserPreferencesData) => {
        // Store the latest preferences
        pendingPrefsRef.current = prefs

        // Optimistic update
        mutate(prefs, false)

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        // Set new debounced save
        saveTimeoutRef.current = setTimeout(async () => {
            const prefsToSave = pendingPrefsRef.current
            if (!prefsToSave) return

            try {
                const response = await fetch('/api/user-preferences', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(prefsToSave)
                })

                if (!response.ok) {
                    throw new Error('Failed to save preferences')
                }

                // Revalidate to ensure sync
                mutate()
            } catch (err) {
                console.error('Error saving preferences:', err)
                // Revalidate to restore server state
                mutate()
            }
        }, DEBOUNCE_MS)
    }, [mutate])

    /**
     * Update a single preference field
     */
    const updatePreference = useCallback(<K extends keyof UserPreferencesData>(
        key: K,
        value: UserPreferencesData[K]
    ) => {
        const updatedPrefs = {
            ...data,
            [key]: value
        } as UserPreferencesData

        savePreferences(updatedPrefs)
    }, [data, savePreferences])

    /**
     * Force immediate save (bypasses debounce)
     */
    const saveImmediately = useCallback(async (prefs?: UserPreferencesData) => {
        const prefsToSave = prefs || pendingPrefsRef.current || data
        if (!prefsToSave) return

        // Clear any pending debounced save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
            saveTimeoutRef.current = null
        }

        try {
            const response = await fetch('/api/user-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prefsToSave)
            })

            if (!response.ok) {
                throw new Error('Failed to save preferences')
            }

            mutate()
        } catch (err) {
            console.error('Error saving preferences:', err)
            throw err
        }
    }, [data, mutate])

    return {
        preferences: data,
        isLoading,
        error,
        savePreferences,
        updatePreference,
        saveImmediately,
        refetch: mutate
    }
}
