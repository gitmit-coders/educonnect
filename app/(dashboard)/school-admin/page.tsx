// app/(dashboard)/school-admin/page.tsx

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import {
  CheckCircle,
  XCircle,
  UserPlus,
  Users,
  Clock,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  isApproved: boolean;
  createdAt: string;
}

export default function SchoolAdminDashboard() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [pendingStudents, setPendingStudents] = useState<User[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<User[]>([]);
  const [tab, setTab] = useState<"teachers" | "pending" | "students">("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchData = async () => {
    try {
      const [teacherRes, pendingRes, approvedRes] = await Promise.all([
        axios.get("/api/school/teachers"),
        axios.get("/api/school/students?status=pending"),
        axios.get("/api/school/students?status=approved"),
      ]);
      setTeachers(teacherRes.data.teachers);
      setPendingStudents(pendingRes.data.students);
      setApprovedStudents(approvedRes.data.students);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStudentAction = async (
    id: string,
    action: "approve" | "reject"
  ) => {
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
      toast.success("Teacher added successfully!");
      setShowAddTeacher(false);
      setTeacherForm({ name: "", email: "", password: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add teacher");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Teachers",
              count: teachers.length,
              icon: <Users className="text-blue-600" size={24} />,
              bg: "bg-blue-100",
            },
            {
              label: "Pending Students",
              count: pendingStudents.length,
              icon: <Clock className="text-yellow-600" size={24} />,
              bg: "bg-yellow-100",
            },
            {
              label: "Approved Students",
              count: approvedStudents.length,
              icon: <CheckCircle className="text-green-600" size={24} />,
              bg: "bg-green-100",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4"
            >
              <div className={`${stat.bg} p-3 rounded-xl`}>{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(
            [
              { key: "pending", label: `Pending (${pendingStudents.length})` },
              { key: "students", label: `Students (${approvedStudents.length})` },
              { key: "teachers", label: `Teachers (${teachers.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
                tab === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Add Teacher Button */}
        {tab === "teachers" && (
          <button
            onClick={() => setShowAddTeacher(true)}
            className="flex items-center gap-2 mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <UserPlus size={16} />
            Add Teacher
          </button>
        )}

        {/* Add Teacher Modal */}
        {showAddTeacher && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Add New Teacher
              </h2>
              <form onSubmit={handleAddTeacher} className="space-y-4">
                {[
                  { key: "name", label: "Name", type: "text" },
                  { key: "email", label: "Email", type: "email" },
                  { key: "password", label: "Password", type: "password" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      required
                      value={(teacherForm as any)[field.key]}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          [field.key]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Add Teacher
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTeacher(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading...</p>
        ) : (
          <div className="grid gap-4">
            {/* Pending Students */}
            {tab === "pending" &&
              (pendingStudents.length === 0 ? (
                <p className="text-center text-gray-500 py-12">
                  No pending students.
                </p>
              ) : (
                pendingStudents.map((student) => (
                  <div
                    key={student._id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {student.name}
                      </p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(student.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleStudentAction(student._id, "approve")
                        }
                        disabled={actionLoading === student._id}
                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition disabled:opacity-50"
                      >
                        <CheckCircle size={15} />
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleStudentAction(student._id, "reject")
                        }
                        disabled={actionLoading === student._id}
                        className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition disabled:opacity-50"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ))}

            {/* Approved Students */}
            {tab === "students" &&
              (approvedStudents.length === 0 ? (
                <p className="text-center text-gray-500 py-12">
                  No approved students yet.
                </p>
              ) : (
                approvedStudents.map((student) => (
                  <div
                    key={student._id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {student.name}
                      </p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle size={15} />
                      Approved
                    </span>
                  </div>
                ))
              ))}

            {/* Teachers */}
            {tab === "teachers" &&
              (teachers.length === 0 ? (
                <p className="text-center text-gray-500 py-12">
                  No teachers added yet.
                </p>
              ) : (
                teachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {teacher.name}
                      </p>
                      <p className="text-sm text-gray-500">{teacher.email}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                      Teacher
                    </span>
                  </div>
                ))
              ))}
          </div>
        )}
      </div>
    </div>
  );
}