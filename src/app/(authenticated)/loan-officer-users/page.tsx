import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { loanOfficerQuery } from "@/lib/loan-officer-db";

interface LoanOfficerUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

export default async function LoanOfficerUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let users: LoanOfficerUser[] = [];
  let error: string | null = null;

  try {
    users = await loanOfficerQuery<LoanOfficerUser>(
      'SELECT id, email, name, role, "createdAt" FROM users ORDER BY "createdAt" DESC',
    );
  } catch (e) {
    error = "Could not connect to the Loan Officer database. Ensure LOAN_OFFICER_DATABASE_URL is configured.";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Loan Officer Users</h1>
      <p className="mt-2 text-muted-foreground">
        Users registered in the Loan Officer portal.
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
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No loan officer users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{user.name ?? "—"}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {user.role}
                      </span>
                    </td>
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
