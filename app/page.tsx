// app/page.tsx

import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  Bot,
  CheckCircle,
  ArrowRight,
  School,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold">EduConnect</span>
          </div>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-6 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm px-4 py-2 rounded-full mb-8">
            <Bot size={14} />
            AI-Powered School Management Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Smart Learning for
            <span className="text-blue-400"> Modern Schools</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
            Connect teachers, students, and administrators in one platform.
            Share notes, assignments, and get AI-powered doubt solving.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              Register Your School
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-4 rounded-2xl font-semibold text-lg transition flex items-center justify-center gap-2"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          Everything your school needs
        </h2>
        <p className="text-slate-400 text-center mb-16">
          One platform for teachers, students, and administrators
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <School size={24} />,
              color: "bg-purple-500/10 text-purple-400",
              title: "Multi-School Support",
              desc: "Manage multiple schools from a single master admin panel",
            },
            {
              icon: <BookOpen size={24} />,
              color: "bg-blue-500/10 text-blue-400",
              title: "Content Management",
              desc: "Upload notes, assignments, PYQs and announcements easily",
            },
            {
              icon: <Users size={24} />,
              color: "bg-green-500/10 text-green-400",
              title: "Role-Based Access",
              desc: "Separate dashboards for admins, teachers and students",
            },
            {
              icon: <Bot size={24} />,
              color: "bg-orange-500/10 text-orange-400",
              title: "AI Chatbot",
              desc: "Students get instant doubt solving powered by AI",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
          <p className="text-slate-400 text-center mb-16">
            Get your school up and running in minutes
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Register Your School",
                desc: "School admin registers with school details. Master admin reviews and approves.",
                color: "text-blue-400",
              },
              {
                step: "02",
                title: "Add Teachers & Students",
                desc: "School admin adds teachers directly. Students join using school code.",
                color: "text-green-400",
              },
              {
                step: "03",
                title: "Start Learning",
                desc: "Teachers upload content. Students access notes and use AI chatbot for doubts.",
                color: "text-purple-400",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`text-5xl font-bold mb-4 ${item.color}`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to transform your school?
            </h2>
            <p className="text-slate-400 mb-8">
              Join EduConnect today and bring your school into the digital age.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-2"
              >
                Register School <ArrowRight size={18} />
              </Link>
              <Link
                href="/student-register"
                className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-4 rounded-2xl font-semibold transition"
              >
                Join as Student
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-semibold">EduConnect</span>
          </div>
          <p className="text-slate-500 text-sm">© 2025 EduConnect. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/login" className="hover:text-slate-300 transition">Login</Link>
            <Link href="/register" className="hover:text-slate-300 transition">Register</Link>
            <Link href="/student-register" className="hover:text-slate-300 transition">Students</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}