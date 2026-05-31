"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { CheckCircle, XCircle, School, Clock, Loader2 } from "lucide-react";

interface ISchool {
  _id: string;
  schoolName: string;
  schoolCode: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [pendingSchools, setPendingSchools] = useState<ISchool[]>([]);
  const [approvedSchools, setApprovedSchools] = useState<ISchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSchools = async () => {
    try {
      const [p, a] = await Promise.all([
        axios.get("/api/admin/schools?status=pending"),
        axios.get("/api/admin/schools?status=approved"),
      ]);
      setPendingSchools(p.data.schools);
      setApprovedSchools(a.data.schools);
    } catch {
      toast.error("Failed to fetch schools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchools(); }, []);

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
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">

        <h1 className="text-2xl font-bold mb-8">Master Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: "Pending Approval", count: pendingSchools.length, icon: <Clock size={22} />, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
            { label: "Approved Schools", count: approvedSchools.length, icon: <School size={22} />, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
          ].map((stat) => (
            <div key={stat.label} className={`border rounded-2xl p-6 flex items-center gap-4 ${stat.bg}`}>
              <div className={stat.color}>{stat.icon}</div>
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "approved"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl font-medium text-sm transition ${
                tab === t
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500"
              }`}
            >
              {t === "pending" ? `Pending (${pendingSchools.length})` : `Approved (${approvedSchools.length})`}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-400" size={32} />
          </div>
        ) : schools.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No {tab} schools found.</div>
        ) : (
          <div className="grid gap-4">
            {schools.map((school) => (
              <div key={school._id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{school.schoolName}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Code: <span className="font-mono text-blue-400">{school.schoolCode}</span>
                    </p>
                    <p className="text-sm text-slate-400">{school.email}</p>
                    <p className="text-sm text-slate-400">{school.phone}</p>
                    <p className="text-sm text-slate-400">{school.address}</p>
                    <p className="text-xs text-slate-600 mt-2">
                      {new Date(school.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  {tab === "pending" ? (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(school._id, "approve")}
                        disabled={actionLoading === school._id}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
                      >
                        {actionLoading === school._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(school._id, "reject")}
                        disabled={actionLoading === school._id}
                        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium shrink-0">
                      <CheckCircle size={16} /> Approved
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