import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserPreferencesClientPage } from './UserPreferencesClientPage';
import { getUserPreferences } from '@/lib/user-preferences';

export default async function UserPreferencesPage() {
    const session = await getServerSession(authOptions);
    const preferences = await getUserPreferences(session?.user?.email);

    return <UserPreferencesClientPage initialData={preferences} />;
}
