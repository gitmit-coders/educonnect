// components/Navbar.tsx

"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, GraduationCap } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  const roleColors: Record<string, string> = {
    "master-admin": "bg-purple-600",
    "school-admin": "bg-blue-600",
    teacher: "bg-green-600",
    student: "bg-orange-500",
  };

  const roleLabels: Record<string, string> = {
    "master-admin": "Master Admin",
    "school-admin": "School Admin",
    teacher: "Teacher",
    student: "Student",
  };

  const role = session?.user?.role ?? "";

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <GraduationCap className="text-blue-600" size={28} />
        <span className="text-xl font-bold text-gray-800">EduConnect</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {session?.user?.name}
        </span>
        <span
          className={`text-xs text-white px-3 py-1 rounded-full font-medium ${roleColors[role] ?? "bg-gray-500"}`}
        >
          {roleLabels[role] ?? role}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
}