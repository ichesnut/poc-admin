import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { applicantQuery } from "@/lib/applicant-db";

interface ApplicantUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export default async function ApplicantUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let users: ApplicantUser[] = [];
  let error: string | null = null;

  try {
    users = await applicantQuery<ApplicantUser>(
      'SELECT id, email, name, "createdAt" FROM "User" ORDER BY "createdAt" DESC',
    );
  } catch (e) {
    error = "Could not connect to the Applicant database. Ensure APPLICANT_DATABASE_URL is configured.";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Applicant Users</h1>
      <p className="mt-2 text-muted-foreground">
        Users registered in the Applicant portal.
      </p>

      {error ? (
        <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No applicant users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{user.name ?? "—"}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
