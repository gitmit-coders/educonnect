// app/unauthorized/page.tsx

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">
          Access Denied
        </h2>
        <p className="text-gray-500 mt-2">
          You do not have permission to view this page.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}