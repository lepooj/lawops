import { redirect } from "next/navigation";
import { verifyAdminSession, setAdminSession } from "@/server/lib/admin-auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const alreadyAuthed = await verifyAdminSession();
  if (alreadyAuthed) redirect("/admin/audit");

  const params = await searchParams;
  const error = params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Admin</h1>
          <p className="mt-2 text-sm text-zinc-500">Login audit monitor</p>
        </div>

        <form
          action={async (formData: FormData) => {
            "use server";
            const secret = formData.get("secret") as string;
            if (!secret || secret !== process.env.ADMIN_SECRET) {
              redirect("/admin/login?error=invalid");
            }
            await setAdminSession();
            redirect("/admin/audit");
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="secret" className="block text-sm font-medium text-zinc-400">
              Admin secret
            </label>
            <input
              id="secret"
              name="secret"
              type="password"
              required
              autoFocus
              className="block w-full rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400">Invalid secret</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:outline-none"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
