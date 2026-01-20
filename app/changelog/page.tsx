import { getSession } from '@/actions/auth-actions'
import { ChangelogContent } from '@/components/changelog/changelog-content'

export const dynamic = 'force-dynamic'

export default async function ChangelogPage() {
    // Check if user is authenticated
    const session = await getSession()
    const isAuthenticated = !!session?.id

    return <ChangelogContent isAuthenticated={isAuthenticated} />
}
