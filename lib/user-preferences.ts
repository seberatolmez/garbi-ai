import { supabase, UserPreferencesData } from './supabase-client';

/**
 * Default user preferences - used when user has no saved preferences
 */
const DEFAULT_PREFERENCES: UserPreferencesData = {
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
};

/**
 * Server-side function to fetch user preferences
 * Used by Server Components for pre-fetching data
 */
export async function getUserPreferences(email: string | null | undefined): Promise<UserPreferencesData> {
    if (!email) {
        return DEFAULT_PREFERENCES;
    }

    try {
        // Get user ID first
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !user) {
            console.error('Error fetching user:', userError);
            return DEFAULT_PREFERENCES;
        }

        // Get preferences
        const { data: preferences, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
            console.error('Error fetching preferences:', error);
            return DEFAULT_PREFERENCES;
        }

        return preferences?.preferences || DEFAULT_PREFERENCES;
    } catch (error) {
        console.error('Error in getUserPreferences:', error);
        return DEFAULT_PREFERENCES;
    }
}

export { DEFAULT_PREFERENCES };
