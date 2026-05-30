// app/(auth)/register/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    schoolName: "",
    schoolCode: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/auth/register", form);
      toast.success("Registration successful! Waiting for approval.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name", label: "Your Name", type: "text", placeholder: "Admin name" },
    { key: "email", label: "Email", type: "email", placeholder: "school@example.com" },
    { key: "password", label: "Password", type: "password", placeholder: "••••••••" },
    { key: "schoolName", label: "School Name", type: "text", placeholder: "Delhi Public School" },
    { key: "schoolCode", label: "School Code", type: "text", placeholder: "DPS001" },
    { key: "phone", label: "Phone", type: "text", placeholder: "9876543210" },
    { key: "address", label: "Address", type: "text", placeholder: "Full school address" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Register School
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
          After registration, master admin will approve your school.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                required
                value={(form as any)[field.key]}
                onChange={(e) =>
                  setForm({ ...form, [field.key]: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={field.placeholder}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register School"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already registered?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}