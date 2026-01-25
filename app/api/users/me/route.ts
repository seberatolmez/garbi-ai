import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase, DBUser } from '@/lib/supabase-client'

/**
 * GET /api/users/me
 * Get current user's profile, creating it if first login (upsert pattern)
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

        // Upsert user - creates on first login, returns existing user otherwise
        const { data: user, error } = await supabase
            .from('users')
            .upsert(
                {
                    email: session.user.email,
                    name: session.user.name || null,
                    profile_image: session.user.image || null
                },
                { onConflict: 'email' }
            )
            .select()
            .single()

        if (error) {
            console.error('Error upserting user:', error)
            return NextResponse.json(
                { error: 'Failed to get or create user' },
                { status: 500 }
            )
        }

        return NextResponse.json(user as DBUser)
    } catch (error) {
        console.error('Error in GET /api/users/me:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/users/me
 * Update current user's profile
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

        const body = await request.json()
        const { name, profile_image } = body

        const updateData: Partial<DBUser> = {}
        if (name !== undefined) updateData.name = name
        if (profile_image !== undefined) updateData.profile_image = profile_image

        const { data: user, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('email', session.user.email)
            .select()
            .single()

        if (error) {
            console.error('Error updating user:', error)
            return NextResponse.json(
                { error: 'Failed to update user' },
                { status: 500 }
            )
        }

        return NextResponse.json(user as DBUser)
    } catch (error) {
        console.error('Error in POST /api/users/me:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
