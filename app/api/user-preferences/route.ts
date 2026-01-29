import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { supabase, UserPreferencesData, DBUserPreferences } from '@/lib/supabase-client'

/**
 * GET /api/user-preferences
 * Fetch current user's preferences
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // First get user ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.user.email)
            .single()

        if (userError || !user) {
            console.error('Error fetching user:', userError)
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Get preferences
        const { data: preferences, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
            console.error('Error fetching preferences:', error)
            return NextResponse.json(
                { error: 'Failed to fetch preferences' },
                { status: 500 }
            )
        }

        // Return preferences or empty default
        const preferencesData: UserPreferencesData = preferences?.preferences || {
            workingHours: {},
            personalHours: {},
            meetingHours: {},
            categoryColors: [],
            rules: [],
            preferredMeetingDuration: 30,
            bufferTimeBetweenMeetings: 10,
            focusTimePreferences: {
                preferredBlocks: [{ start: "09:00", end: "12:00" }],
                minimumDuration: 60,
                maximumDuration: 120,
                chronoType: "morning",
                interruptionSensitivity: "medium"
            }
        }

        return NextResponse.json(preferencesData)
    } catch (error) {
        console.error('Error in GET /api/user-preferences:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/user-preferences
 * Create or update user preferences (upsert)
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const preferences: UserPreferencesData = await request.json()

        // First get user ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.user.email)
            .single()

        if (userError || !user) {
            console.error('Error fetching user:', userError)
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Upsert preferences
        const { data, error } = await supabase
            .from('user_preferences')
            .upsert(
                {
                    user_id: user.id,
                    preferences: preferences
                },
                { onConflict: 'user_id' }
            )
            .select()
            .single()

        if (error) {
            console.error('Error upserting preferences:', error)
            return NextResponse.json(
                { error: 'Failed to save preferences' },
                { status: 500 }
            )
        }

        return NextResponse.json((data as DBUserPreferences).preferences)
    } catch (error) {
        console.error('Error in POST /api/user-preferences:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
