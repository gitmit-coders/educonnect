"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import ChatBot from "@/components/ChatBot";
import {
  FileText, Megaphone, ClipboardList, BookOpen, Loader2, Filter,
} from "lucide-react";

interface IContent {
  _id: string;
  title: string;
  description: string;
  contentType: string;
  subject: string;
  classGrade: string;
  fileUrl: string | null;
  uploadedBy: { name: string };
  createdAt: string;
}

const tabs = [
  { key: "all", label: "All" },
  { key: "note", label: "Notes" },
  { key: "assignment", label: "Assignments" },
  { key: "announcement", label: "Announcements" },
  { key: "pyq", label: "PYQ" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const typeColors: Record<string, string> = {
  note: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  assignment: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  announcement: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  pyq: "bg-green-500/20 text-green-300 border border-green-500/30",
};

const typeIcons: Record<string, React.ReactNode> = {
  note: <BookOpen size={16} className="text-blue-400" />,
  assignment: <ClipboardList size={16} className="text-orange-400" />,
  announcement: <Megaphone size={16} className="text-purple-400" />,
  pyq: <FileText size={16} className="text-green-400" />,
};

export default function StudentDashboard() {
  const [contents, setContents] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  useEffect(() => {
    axios
      .get("/api/content")
      .then((res) => setContents(res.data.contents))
      .catch(() => toast.error("Failed to load content"))
      .finally(() => setLoading(false));
  }, []);

  // Available classes dynamically fetch karo content se
  const availableClasses = [
    "all",
    ...Array.from(
      new Set(
        contents
          .map((c) => c.classGrade)
          .filter((g) => g && g.trim() !== "")
      )
    ).sort(),
  ];

  // Tab + class dono se filter karo
  const filtered = contents.filter((c) => {
    const tabMatch = tab === "all" || c.contentType === tab;
    const classMatch = selectedClass === "all" || c.classGrade === selectedClass;
    return tabMatch && classMatch;
  });

  const openFile = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold mb-6">Study Material</h1>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">

            {/* Class dropdown */}
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
              >
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls} className="bg-slate-800">
                    {cls === "all" ? "All Classes" : `Class ${cls}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Type tabs */}
            {tabs.map((t) => {
              const count = contents.filter((c) => {
                const tabMatch = t.key === "all" || c.contentType === t.key;
                const classMatch = selectedClass === "all" || c.classGrade === selectedClass;
                return tabMatch && classMatch;
              }).length;

              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition ${
                    tab === t.key
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500"
                  }`}
                >
                  {t.label}
                  <span className="ml-1.5 opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-400" size={32} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <BookOpen size={48} className="mx-auto mb-4 text-slate-700" />
              <p>No content available for this selection.</p>
              {selectedClass !== "all" && (
                <button
                  onClick={() => setSelectedClass("all")}
                  className="mt-3 text-blue-400 text-sm hover:underline"
                >
                  Show all classes
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((c) => (
                <div
                  key={c._id}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-3 hover:border-slate-600 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {typeIcons[c.contentType]}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[c.contentType]}`}>
                        {c.contentType.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.classGrade && (
                        <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full">
                          Class {c.classGrade}
                        </span>
                      )}
                      {c.subject && (
                        <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded-full">
                          {c.subject}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">{c.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-3">
                      {c.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-700/50">
                    <div>
                      <p className="text-xs text-slate-500">
                        By {c.uploadedBy?.name ?? "Teacher"}
                      </p>
                      <p className="text-xs text-slate-600">
                        {new Date(c.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    {c.fileUrl && (
                      <button
                        onClick={() => openFile(c.fileUrl!)}
                        className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl transition"
                      >
                        Open File
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ChatBot />
    </>
  );
}