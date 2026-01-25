import { supabase, DBUser } from '@/lib/supabase-client'

const DAILY_LIMITS: Record<DBUser['plan'], number> = {
    free: 20,
    premium: Infinity
}

export interface RateLimitResult {
    allowed: boolean
    remaining: number
    limit: number
    plan: DBUser['plan']
}

/**
 * Check if user can make an AI request and increment usage counter
 * @param userEmail - User's email address
 * @returns Rate limit result with allowed status and remaining requests
 */
export async function checkAndIncrementUsage(userEmail: string): Promise<RateLimitResult> {
    // Get user from database
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single()

    if (error || !user) {
        console.error('Error fetching user for rate limit:', error)
        // Default to allowing the request if we can't check
        return { allowed: true, remaining: DAILY_LIMITS.free, limit: DAILY_LIMITS.free, plan: 'free' }
    }

    const typedUser = user as DBUser
    const limit = DAILY_LIMITS[typedUser.plan]

    // Premium users have unlimited access
    if (typedUser.plan === 'premium') {
        return { allowed: true, remaining: Infinity, limit: Infinity, plan: 'premium' }
    }

    // Check if we need to reset the daily counter (new day)
    const today = new Date().toISOString().split('T')[0]
    let currentCount = typedUser.daily_request_count

    if (typedUser.last_request_date !== today) {
        // Reset counter for new day
        const { error: resetError } = await supabase
            .from('users')
            .update({
                daily_request_count: 0,
                last_request_date: today
            })
            .eq('id', typedUser.id)

        if (resetError) {
            console.error('Error resetting daily count:', resetError)
        }
        currentCount = 0
    }

    // Check if limit exceeded
    if (currentCount >= limit) {
        return {
            allowed: false,
            remaining: 0,
            limit,
            plan: typedUser.plan
        }
    }

    // Increment counter
    const { error: incrementError } = await supabase
        .from('users')
        .update({
            daily_request_count: currentCount + 1,
            last_request_date: today
        })
        .eq('id', typedUser.id)

    if (incrementError) {
        console.error('Error incrementing request count:', incrementError)
    }

    return {
        allowed: true,
        remaining: limit - currentCount - 1,
        limit,
        plan: typedUser.plan
    }
}

/**
 * Get current usage without incrementing
 * @param userEmail - User's email address
 * @returns Current usage stats
 */
export async function getCurrentUsage(userEmail: string): Promise<{
    used: number
    limit: number
    plan: DBUser['plan']
} | null> {
    const { data: user, error } = await supabase
        .from('users')
        .select('daily_request_count, plan, last_request_date')
        .eq('email', userEmail)
        .single()

    if (error || !user) {
        return null
    }

    const typedUser = user as Pick<DBUser, 'daily_request_count' | 'plan' | 'last_request_date'>
    const today = new Date().toISOString().split('T')[0]

    // If it's a new day, count is effectively 0
    const currentCount = typedUser.last_request_date === today
        ? typedUser.daily_request_count
        : 0

    return {
        used: currentCount,
        limit: DAILY_LIMITS[typedUser.plan],
        plan: typedUser.plan
    }
}
