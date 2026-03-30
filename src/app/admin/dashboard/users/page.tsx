import { auth } from "@/auth";
import { getUsers } from "@/actions/users";
import { redirect } from "next/navigation";
import { UserList } from "@/components/admin/UserList";
import { canManageUsers } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const session = await auth();

    if (!session?.user || !canManageUsers(session.user.role as string)) {
        redirect("/admin/dashboard");
    }

    const users = await getUsers();
    const typedUsers = users as { id: string; name: string | null; email: string; role: string; organizationName: string | null; createdAt: Date }[];

    return <UserList users={typedUsers} currentUser={session.user as { id: string; role: string }} />;
}
