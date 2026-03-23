import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Target, Headphones, Mic, Trophy, Flame, ChevronRight, MessageSquare, ListTodo, BookOpen, ClipboardCheck } from "lucide-react";
import { storage, UserProfile } from "../lib/storage";

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({ level: "B1", plan: [], feedback: null, progress: 0, vocabulary: [] });

  useEffect(() => {
    const data = storage.getProfile();
    if (data.level) setProfile(data);
  }, []);

  const level = profile.level || "B1";
  const nextLevel = level === "A1" ? "A2" : level === "A2" ? "B1" : level === "B1" ? "B2" : level === "B2" ? "C1" : "Native";
  const progress = profile.progress || 0;

  return (
    <div className="flex-1 p-6 max-w-5xl w-full mx-auto pb-20">
      <header className="flex items-center justify-between mb-10 mt-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Welcome back!</h1>
          <p className="text-zinc-400 mt-1">Ready to improve your English today?</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-orange-500/10 text-orange-400 px-4 py-2 rounded-full font-medium border border-orange-500/20">
            <Flame size={18} />
            <span>3 Day Streak</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-xl font-bold border border-violet-400/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            {level}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Level Progress */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">Current Level</h2>
              <span className="text-violet-400 font-medium bg-violet-500/10 px-3 py-1 rounded-full">Goal: {nextLevel}</span>
            </div>
            
            <div className="flex items-end gap-4 mb-6">
              <span className="text-6xl font-bold text-white tracking-tighter">{level}</span>
              <span className="text-zinc-400 mb-2 font-medium">Intermediate</span>
            </div>

            <div className="w-full bg-zinc-900 rounded-full h-3 mb-3 border border-zinc-800">
              <div className="bg-gradient-to-r from-violet-500 to-blue-500 h-3 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-zinc-400 font-medium">{progress}% to reach {nextLevel}</p>
          </div>
        </div>

        {/* Study Plan */}
        <div className="glass-panel rounded-3xl p-8 flex flex-col">
          <h2 className="text-lg font-semibold mb-5 text-zinc-100 flex items-center gap-2">
            <ListTodo className="text-blue-400" size={20} />
            Your Study Plan
          </h2>
          
          {profile.plan && profile.plan.length > 0 ? (
            <ul className="space-y-4 flex-1">
              {profile.plan.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="text-zinc-300 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm text-center">
              Take the placement test to get a personalized plan.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-100">
            <Target className="text-violet-400" />
            Practice Modes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel rounded-3xl p-6 hover:border-violet-500/50 transition-all cursor-pointer group"
              onClick={() => navigate("/training")}
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400 mb-5 border border-violet-500/20 group-hover:bg-violet-500/30 transition-colors">
                <Mic size={24} />
              </div>
              <h3 className="font-semibold text-xl mb-2 text-zinc-100">Shadowing Practice</h3>
              <p className="text-zinc-400 mb-6 leading-relaxed text-sm">Listen to native sentences and repeat them. Get instant AI feedback on your pronunciation.</p>
              <div className="flex items-center text-violet-400 font-medium text-sm">
                Start Shadowing <ChevronRight size={18} className="ml-1" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel rounded-3xl p-6 hover:border-blue-500/50 transition-all cursor-pointer group"
              onClick={() => navigate("/conversation")}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-5 border border-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-semibold text-xl mb-2 text-zinc-100">Free Conversation</h3>
              <p className="text-zinc-400 mb-6 leading-relaxed text-sm">Talk naturally with EchoCoach using your voice. Get grammar corrections and practice fluency.</p>
              <div className="flex items-center text-blue-400 font-medium text-sm">
                Start Chatting <ChevronRight size={18} className="ml-1" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel rounded-3xl p-6 hover:border-emerald-500/50 transition-all cursor-pointer group md:col-span-2 flex items-center justify-between"
              onClick={() => navigate("/daily-test")}
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors shrink-0">
                  <ClipboardCheck size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1 text-zinc-100">Daily Test</h3>
                  <p className="text-zinc-400 text-sm">Test your knowledge and earn progress points.</p>
                </div>
              </div>
              <div className="flex items-center text-emerald-400 font-medium shrink-0">
                Take Test <ChevronRight size={18} className="ml-1" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* New Words Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-100">
            <BookOpen className="text-amber-400" />
            New Words
          </h2>
          <div className="glass-panel rounded-3xl p-6 flex flex-col h-[calc(100%-3.5rem)]">
            {profile.vocabulary && profile.vocabulary.length > 0 ? (
              <ul className="space-y-4 overflow-y-auto pr-2">
                {profile.vocabulary.map((v, idx) => (
                  <li key={idx} className="border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                    <div className="font-semibold text-zinc-200 text-lg">{v.word}</div>
                    <div className="text-zinc-500 text-sm mt-1">{v.meaning}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-600 mb-3">
                  <BookOpen size={20} />
                </div>
                <p className="text-zinc-500 text-sm">No new words yet.</p>
                <p className="text-zinc-600 text-xs mt-1">Practice shadowing to discover new vocabulary.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

