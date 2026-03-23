import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Mic, Headphones, Activity } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#09090b] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-violet-500/10 p-5 rounded-3xl border border-violet-500/20">
            <Mic className="w-12 h-12 text-violet-400" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white leading-tight">
          Speak English with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">confidence</span>
          <br />
          <span className="text-4xl md:text-6xl text-zinc-500 font-medium tracking-normal">— not just knowledge.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          EchoCoach AI is your interactive speaking coach. Improve your pronunciation, fluency, and listening skills with real-time feedback and personalized plans.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/onboarding")}
          className="bg-zinc-100 hover:bg-white text-zinc-900 font-semibold py-4 px-10 rounded-full text-lg shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all flex items-center gap-3 mx-auto"
        >
          Start Speaking Now <span className="text-xl">👉</span>
        </motion.button>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="glass-panel p-8 rounded-3xl">
            <Mic className="w-8 h-8 text-blue-400 mb-5" />
            <h3 className="text-xl font-semibold mb-3 text-zinc-100">Shadowing</h3>
            <p className="text-zinc-400 leading-relaxed">Repeat after native speakers to perfect your rhythm and intonation.</p>
          </div>
          <div className="glass-panel p-8 rounded-3xl">
            <Activity className="w-8 h-8 text-violet-400 mb-5" />
            <h3 className="text-xl font-semibold mb-3 text-zinc-100">Real-time Feedback</h3>
            <p className="text-zinc-400 leading-relaxed">Get instant corrections on your pronunciation and grammar.</p>
          </div>
          <div className="glass-panel p-8 rounded-3xl">
            <Headphones className="w-8 h-8 text-emerald-400 mb-5" />
            <h3 className="text-xl font-semibold mb-3 text-zinc-100">Adaptive Learning</h3>
            <p className="text-zinc-400 leading-relaxed">The AI adjusts to your level, from A1 to C1, ensuring steady progress.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

