// app/(dashboard)/admin/page.tsx

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { CheckCircle, XCircle, School, Clock } from "lucide-react";

interface School {
  _id: string;
  schoolName: string;
  schoolCode: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [pendingSchools, setPendingSchools] = useState<School[]>([]);
  const [approvedSchools, setApprovedSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSchools = async () => {
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get("/api/admin/schools?status=pending"),
        axios.get("/api/admin/schools?status=approved"),
      ]);
      setPendingSchools(pendingRes.data.schools);
      setApprovedSchools(approvedRes.data.schools);
    } catch {
      toast.error("Failed to fetch schools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const res = await axios.put(`/api/admin/schools/${id}`, { action });
      toast.success(res.data.message);
      fetchSchools();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const schools = tab === "pending" ? pendingSchools : approvedSchools;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-3xl font-bold text-gray-800">
                {pendingSchools.length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <School className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved Schools</p>
              <p className="text-3xl font-bold text-gray-800">
                {approvedSchools.length}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "approved"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
                tab === t
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t === "pending" ? "Pending" : "Approved"} (
              {t === "pending" ? pendingSchools.length : approvedSchools.length}
              )
            </button>
          ))}
        </div>

        {/* School Cards */}
        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading...</p>
        ) : schools.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No {tab} schools found.
          </div>
        ) : (
          <div className="grid gap-4">
            {schools.map((school) => (
              <div
                key={school._id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {school.schoolName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Code:{" "}
                      <span className="font-mono font-medium text-blue-600">
                        {school.schoolCode}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">{school.email}</p>
                    <p className="text-sm text-gray-500">{school.phone}</p>
                    <p className="text-sm text-gray-500">{school.address}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Registered:{" "}
                      {new Date(school.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  {tab === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleAction(school._id, "approve")}
                        disabled={actionLoading === school._id}
                        className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition disabled:opacity-50"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(school._id, "reject")}
                        disabled={actionLoading === school._id}
                        className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  )}

                  {tab === "approved" && (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle size={16} />
                      Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}