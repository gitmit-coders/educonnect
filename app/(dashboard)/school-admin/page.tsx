"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { CheckCircle, XCircle, UserPlus, Users, Clock, Loader2, Eye, EyeOff } from "lucide-react";

interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function SchoolAdminDashboard() {
  const [teachers, setTeachers] = useState<IUser[]>([]);
  const [pendingStudents, setPendingStudents] = useState<IUser[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<IUser[]>([]);
  const [tab, setTab] = useState<"pending" | "students" | "teachers">("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: "", email: "", password: "" });

  const fetchData = async () => {
    try {
      const [t, p, a] = await Promise.all([
        axios.get("/api/school/teachers"),
        axios.get("/api/school/students?status=pending"),
        axios.get("/api/school/students?status=approved"),
      ]);
      setTeachers(t.data.teachers);
      setPendingStudents(p.data.students);
      setApprovedStudents(a.data.students);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStudentAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const res = await axios.put(`/api/school/students/${id}`, { action });
      toast.success(res.data.message);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/school/teachers", teacherForm);
      toast.success("Teacher added!");
      setShowModal(false);
      setTeacherForm({ name: "", email: "", password: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed");
    }
  };

  const tabs = [
    { key: "pending" as const, label: `Pending (${pendingStudents.length})` },
    { key: "students" as const, label: `Students (${approvedStudents.length})` },
    { key: "teachers" as const, label: `Teachers (${teachers.length})` },
  ];

  const renderList = () => {
    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-400" size={32} /></div>;

    if (tab === "pending")
      return pendingStudents.length === 0 ? (
        <p className="text-center text-slate-500 py-16">No pending students.</p>
      ) : pendingStudents.map((s) => (
        <div key={s._id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">{s.name}</p>
            <p className="text-sm text-slate-400">{s.email}</p>
            <p className="text-xs text-slate-600">{new Date(s.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleStudentAction(s._id, "approve")} disabled={actionLoading === s._id}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-xl text-sm transition disabled:opacity-50">
              {actionLoading === s._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Approve
            </button>
            <button onClick={() => handleStudentAction(s._id, "reject")} disabled={actionLoading === s._id}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-sm transition disabled:opacity-50">
              <XCircle size={14} /> Reject
            </button>
          </div>
        </div>
      ));

    const list = tab === "students" ? approvedStudents : teachers;
    return list.length === 0 ? (
      <p className="text-center text-slate-500 py-16">No {tab} yet.</p>
    ) : list.map((u) => (
      <div key={u._id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-white">{u.name}</p>
          <p className="text-sm text-slate-400">{u.email}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${tab === "teachers" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-green-500/20 text-green-300 border border-green-500/30"}`}>
          {tab === "teachers" ? "Teacher" : "Student"}
        </span>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">School Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Teachers", count: teachers.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Pending Students", count: pendingStudents.length, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
            { label: "Students", count: approvedStudents.length, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
          ].map((s) => (
            <div key={s.label} className={`border rounded-2xl p-5 ${s.bg}`}>
              <p className="text-sm text-slate-400">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Add Teacher */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition ${tab === t.key ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500"}`}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === "teachers" && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <UserPlus size={16} /> Add Teacher
            </button>
          )}
        </div>

        <div className="grid gap-4">{renderList()}</div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-6">Add New Teacher</h2>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              {[
                { key: "name", label: "Name", type: "text", placeholder: "Teacher name" },
                { key: "email", label: "Email", type: "email", placeholder: "teacher@school.com" },
              ].map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">{f.label}</label>
                  <input type={f.type} required value={(teacherForm as any)[f.key]}
                    onChange={(e) => setTeacherForm({ ...teacherForm, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={teacherForm.password}
                    onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition">
                  Add Teacher
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-xl font-medium transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}