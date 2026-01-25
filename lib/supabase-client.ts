import { createClient } from '@supabase/supabase-js'
import { Schedule, CategoryColor, UserRule, FocusTimePreference } from '@/app/types/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// DB types
export interface DBUser {
    id: string
    email: string
    name: string | null
    profile_image: string | null
    plan: 'free' | 'premium'
    daily_request_count: number
    last_request_date: string
    created_at: string
    updated_at: string
}

export interface DBUserPreferences {
    id: string
    user_id: string
    preferences: UserPreferencesData
    created_at: string
    updated_at: string
}

export interface UserPreferencesData {
    workingHours?: Schedule
    personalHours?: Schedule
    meetingHours?: Schedule
    categoryColors?: CategoryColor[]
    rules?: UserRule[]
    preferredMeetingDuration?: number
    bufferTimeBetweenMeetings?: number
    focusTimePreferences?: FocusTimePreference
}

export type { Schedule, CategoryColor, UserRule, FocusTimePreference }
