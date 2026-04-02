import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Require an authenticated user. Returns the session user.
 * Use in server actions and server components.
 *
 * Throws redirect to /login if unauthenticated.
 */
export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user;
}
