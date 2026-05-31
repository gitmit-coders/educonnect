"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, GraduationCap } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  const roleColors: Record<string, string> = {
    "master-admin": "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    "school-admin": "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    teacher: "bg-green-500/20 text-green-300 border border-green-500/30",
    student: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  };

  const roleLabels: Record<string, string> = {
    "master-admin": "Master Admin",
    "school-admin": "School Admin",
    teacher: "Teacher",
    student: "Student",
  };

  const role = session?.user?.role ?? "";

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">EduConnect</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 hidden sm:block">
            {session?.user?.name}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${roleColors[role] ?? "bg-slate-700 text-slate-300"}`}>
            {roleLabels[role] ?? role}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}