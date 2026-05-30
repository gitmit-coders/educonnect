// app/(dashboard)/student/page.tsx

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import ChatBot from "@/components/ChatBot";
import { FileText, Megaphone, ClipboardList, BookOpen } from "lucide-react";

interface Content {
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

export default function StudentDashboard() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("all");

  useEffect(() => {
    axios
      .get("/api/content")
      .then((res) => setContents(res.data.contents))
      .catch(() => toast.error("Failed to load content"))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    tab === "all"
      ? contents
      : contents.filter((c) => c.contentType === tab);

  const typeIcons: Record<string, React.ReactNode> = {
    note: <BookOpen size={18} className="text-blue-600" />,
    assignment: <ClipboardList size={18} className="text-orange-600" />,
    announcement: <Megaphone size={18} className="text-purple-600" />,
    pyq: <FileText size={18} className="text-green-600" />,
  };

  const typeColors: Record<string, string> = {
    note: "bg-blue-100 text-blue-700",
    assignment: "bg-orange-100 text-orange-700",
    announcement: "bg-purple-100 text-purple-700",
    pyq: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Study Material
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                tab === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-70">
                (
                {t.key === "all"
                  ? contents.length
                  : contents.filter((c) => c.contentType === t.key).length}
                )
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No content available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((content) => (
              <div
                key={content._id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {typeIcons[content.contentType]}
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        typeColors[content.contentType]
                      }`}
                    >
                      {content.contentType.toUpperCase()}
                    </span>
                  </div>
                  {content.subject && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      {content.subject}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {content.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-3">
                    {content.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400">
                      By {content.uploadedBy?.name ?? "Teacher"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(content.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  {content.fileUrl && (

                    <a
                    
                      href={content.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
                    >
                      Open File
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chatbot — bottom right corner mein floating */}
      <ChatBot />
    </div>
  );
}