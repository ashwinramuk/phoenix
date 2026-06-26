import { auth, signIn, signOut } from "@/auth";

// Server component: shows "Sign in with Google" or the signed-in user + sign-out.
export default async function AuthButton() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name ?? "User"}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm text-slate-200">{session.user.name}</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="text-sm px-3 py-1.5 rounded-md border border-slate-600 text-slate-200 hover:border-slate-400 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="text-sm px-4 py-1.5 rounded-md bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors"
      >
        Sign in with Google
      </button>
    </form>
  );
}
