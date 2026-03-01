import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-950 p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-gray-400">
            Welcome back, {session.user?.name ?? session.user?.email}
          </p>
        </div>

        {/* Placeholder stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">Active Flows</p>
            <p className="mt-2 text-3xl font-bold text-white">0</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">Total Saves</p>
            <p className="mt-2 text-3xl font-bold text-white">0</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">Cancels Prevented</p>
            <p className="mt-2 text-3xl font-bold text-brand-400">0%</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-gray-700 bg-gray-900/50 p-12 text-center">
          <p className="text-gray-400">
            No cancel flows yet. Create your first flow to get started.
          </p>
          <button className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors">
            Create Flow
          </button>
        </div>
      </div>
    </main>
  );
}
