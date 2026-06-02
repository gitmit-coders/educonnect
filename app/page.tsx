import Link from "next/link";
import { GraduationCap, BookOpen, Users, Bot, ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-800/50 px-6 py-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">EduConnect</span>
          </div>
          <Link href="/login"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-blue-500/20">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background image — school */}
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900" />

        {/* Animated blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm px-4 py-2 rounded-full mb-8">
            <Bot size={14} />
            AI-Powered School Management Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Smart Learning for
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Modern Schools
            </span>
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
            Connect teachers, students, and administrators in one platform.
            Share notes, assignments, and get AI-powered doubt solving.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30">
              🏫 Register Your School <ArrowRight size={20} />
            </Link>
            <Link href="/student-register"
              className="border border-slate-600 hover:border-green-500 hover:bg-green-500/5 text-slate-300 hover:text-white px-8 py-4 rounded-2xl font-semibold text-lg transition flex items-center justify-center gap-2">
              🎒 Join as Student
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            {[
              { num: "100+", label: "Schools" },
              { num: "10K+", label: "Students" },
              { num: "AI", label: "Powered" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {stat.num}
                </p>
                <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24">
        {/* Background image — students in class */}
        <div className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80')` }} />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything your school needs</h2>
            <p className="text-slate-400 text-lg">One platform for everyone</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🏫",
                color: "from-purple-600/20 to-purple-600/5 border-purple-500/20",
                glow: "bg-purple-500/10",
                title: "Multi-School",
                desc: "Manage multiple schools from one master admin panel",
              },
              {
                icon: "📚",
                color: "from-blue-600/20 to-blue-600/5 border-blue-500/20",
                glow: "bg-blue-500/10",
                title: "Smart Content",
                desc: "Upload notes, assignments, PYQs and announcements",
              },
              {
                icon: "👥",
                color: "from-green-600/20 to-green-600/5 border-green-500/20",
                glow: "bg-green-500/10",
                title: "Role-Based",
                desc: "Separate dashboards for admins, teachers and students",
              },
              {
                icon: "🤖",
                color: "from-orange-600/20 to-orange-600/5 border-orange-500/20",
                glow: "bg-orange-500/10",
                title: "AI Chatbot",
                desc: "Students get instant doubt solving powered by AI",
              },
            ].map((f) => (
              <div key={f.title}
                className={`bg-gradient-to-b ${f.color} border rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-default`}>
                <div className={`w-12 h-12 ${f.glow} rounded-xl flex items-center justify-center mb-4 text-2xl`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 border-t border-slate-800">
        {/* Background — playground */}
        <div className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=1920&q=80')` }} />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-slate-400 text-lg">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                emoji: "🏫",
                title: "Register Your School",
                desc: "School admin registers with details. Master admin reviews and approves within 24 hours.",
                color: "text-blue-400",
                border: "border-blue-500/20",
                bg: "bg-blue-500/5",
              },
              {
                step: "02",
                emoji: "👩‍🏫",
                title: "Add Teachers & Students",
                desc: "School admin adds teachers directly. Students join using the unique school code.",
                color: "text-green-400",
                border: "border-green-500/20",
                bg: "bg-green-500/5",
              },
              {
                step: "03",
                emoji: "🤖",
                title: "Start Learning with AI",
                desc: "Teachers upload content. Students access notes and use AI chatbot for instant doubt solving.",
                color: "text-purple-400",
                border: "border-purple-500/20",
                bg: "bg-purple-500/5",
              },
            ].map((item) => (
              <div key={item.step}
                className={`${item.bg} border ${item.border} rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300`}>
                <div className={`text-6xl font-bold ${item.color} mb-4 opacity-30`}>{item.step}</div>
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920&q=80')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-3xl p-12 backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-4">
              Ready to transform your school? 🚀
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Join EduConnect today and bring your school into the digital age.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-semibold transition shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link href="/student-register"
                className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-4 rounded-2xl font-semibold transition">
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
            <span className="font-semibold text-white">EduConnect</span>
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