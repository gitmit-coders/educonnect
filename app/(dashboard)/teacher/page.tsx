// app/(dashboard)/teacher/page.tsx

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { Plus, Trash2, Eye, EyeOff, Upload } from "lucide-react";

interface Content {
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

const contentTypes = ["note", "assignment", "announcement", "pyq"];

export default function TeacherDashboard() {
  const [contents, setContents] = useState<Content[]>([]);
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
      toast.success("Content uploaded successfully!");
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
      toast.error(err.response?.data?.error || "Failed to upload");
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

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      await axios.put(`/api/content/${id}`, { isVisible: !current });
      toast.success(current ? "Hidden from students" : "Now visible to students");
      fetchContents();
    } catch {
      toast.error("Failed to update");
    }
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Content</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Add Content
          </button>
        </div>

        {/* Add Content Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Upload New Content
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type
                  </label>
                  <select
                    value={form.contentType}
                    onChange={(e) =>
                      setForm({ ...form, contentType: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {contentTypes.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {[
                  { key: "title", label: "Title", type: "text" },
                  { key: "subject", label: "Subject", type: "text" },
                  { key: "classGrade", label: "Class/Grade", type: "text" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      required={field.key === "title"}
                      value={(form as any)[field.key]}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* File upload — announcements ke liye optional */}
                {form.contentType !== "announcement" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload File (PDF / Image)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {uploading
                            ? "Uploading..."
                            : form.fileUrl
                            ? "✓ File uploaded"
                            : "Click to upload"}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={form.isVisible}
                    onChange={(e) =>
                      setForm({ ...form, isVisible: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor="isVisible"
                    className="text-sm text-gray-700"
                  >
                    Visible to students immediately
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? "Uploading..." : "Upload Content"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content List */}
        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading...</p>
        ) : contents.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No content uploaded yet.</p>
            <p className="text-sm mt-1">
              Click "Add Content" to upload notes, assignments, or announcements.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {contents.map((content) => (
              <div
                key={content._id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          typeColors[content.contentType]
                        }`}
                      >
                        {content.contentType.toUpperCase()}
                      </span>
                      {content.subject && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                          {content.subject}
                        </span>
                      )}
                      {content.classGrade && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                          Grade {content.classGrade}
                        </span>
                      )}
                      {!content.isVisible && (
                        <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {content.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(content.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {content.fileUrl && (

                        <a
                      
                        href={content.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                      >
                        View File
                      </a>
                    )}
                    <button
                      onClick={() =>
                        handleToggleVisibility(content._id, content.isVisible)
                      }
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                      title={content.isVisible ? "Hide" : "Show"}
                    >
                      {content.isVisible ? (
                        <Eye size={16} className="text-gray-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(content._id)}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}