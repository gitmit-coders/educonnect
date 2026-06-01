"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { Plus, Trash2, Eye, EyeOff, Upload, Loader2, FileText } from "lucide-react";
import ChatBot from "@/components/ChatBot";

interface IContent {
  _id: string;
  title: string;
  description: string;
  contentType: string;
  subject: string;
  classGrade: string;
  isVisible: boolean;
  fileUrl: string | null;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  note: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  assignment: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  announcement: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  pyq: "bg-green-500/20 text-green-300 border border-green-500/30",
};

export default function TeacherDashboard() {
  const [contents, setContents] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    contentType: "note",
    subject: "",
    classGrade: "",
    isVisible: true,
    fileUrl: "",
  });

  const fetchContents = async () => {
    try {
      const res = await axios.get("/api/content");
      setContents(res.data.contents);
    } catch {
      toast.error("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    setUploading(true);
    try {
      const res = await axios.post("/api/upload", data);
      setForm((prev) => ({ ...prev, fileUrl: res.data.fileUrl }));
      toast.success("File uploaded!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("/api/content", form);
      toast.success("Content uploaded!");
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        contentType: "note",
        subject: "",
        classGrade: "",
        isVisible: true,
        fileUrl: "",
      });
      fetchContents();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content?")) return;
    try {
      await axios.delete(`/api/content/${id}`);
      toast.success("Deleted!");
      fetchContents();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await axios.put(`/api/content/${id}`, { isVisible: !current });
      toast.success(current ? "Hidden from students" : "Visible to students");
      fetchContents();
    } catch {
      toast.error("Failed");
    }
  };

  const openFile = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">My Content</h1>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              <Plus size={16} /> Add Content
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-400" size={32} />
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-20">
              <FileText size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No content uploaded yet</p>
              <p className="text-slate-600 text-sm mt-1">
                Click "Add Content" to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {contents.map((c) => (
                <div
                  key={c._id}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[c.contentType]}`}
                        >
                          {c.contentType.toUpperCase()}
                        </span>
                        {c.subject && (
                          <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">
                            {c.subject}
                          </span>
                        )}
                        {c.classGrade && (
                          <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">
                            Grade {c.classGrade}
                          </span>
                        )}
                        {!c.isVisible && (
                          <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full">
                            Hidden
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-white">{c.title}</h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {c.description}
                      </p>
                      <p className="text-xs text-slate-600 mt-2">
                        {new Date(c.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {c.fileUrl && (
                        <button
                          onClick={() => openFile(c.fileUrl!)}
                          className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-xl transition"
                        >
                          View
                        </button>
                      )}
                      <button
                        onClick={() => handleToggle(c._id, c.isVisible)}
                        className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
                        title={c.isVisible ? "Hide" : "Show"}
                      >
                        {c.isVisible ? (
                          <Eye size={16} className="text-slate-300" />
                        ) : (
                          <EyeOff size={16} className="text-slate-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-white mb-6">
                Upload New Content
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Content Type
                  </label>
                  <select
                    value={form.contentType}
                    onChange={(e) =>
                      setForm({ ...form, contentType: e.target.value })
                    }
                    className="w-full bg-slate-900/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {["note", "assignment", "announcement", "pyq"].map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {[
                  { key: "title", label: "Title", placeholder: "Content title" },
                  { key: "subject", label: "Subject", placeholder: "e.g. Mathematics" },
                  { key: "classGrade", label: "Class/Grade", placeholder: "e.g. 10A" },
                ].map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">
                      {f.label}
                    </label>
                    <input
                      type="text"
                      required={f.key === "title"}
                      value={(form as any)[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                      placeholder={f.placeholder}
                      className="w-full bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Brief description of the content"
                    className="w-full bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                  />
                </div>

                {form.contentType !== "announcement" && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">
                      Upload File
                    </label>
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-6 cursor-pointer transition"
                    >
                      <Upload size={24} className="text-slate-500 mb-2" />
                      <span className="text-sm text-slate-400">
                        {uploading
                          ? "Uploading..."
                          : form.fileUrl
                          ? "✓ File uploaded!"
                          : "Click to upload PDF or image"}
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="visible"
                    checked={form.isVisible}
                    onChange={(e) =>
                      setForm({ ...form, isVisible: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-500"
                  />
                  <label htmlFor="visible" className="text-sm text-slate-300">
                    Visible to students immediately
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Content"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-xl font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <ChatBot />
    </>
  );
}