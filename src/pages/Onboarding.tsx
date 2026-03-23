import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Compass, FileCheck2, ArrowRight } from "lucide-react";
import { storage } from "../lib/storage";

export default function Onboarding() {
  const navigate = useNavigate();

  const handleManualLevel = (level: string) => {
    storage.setProfile({
      level,
      plan: [
        "Focus on daily conversation",
        "Improve vocabulary",
        "Practice pronunciation"
      ],
      feedback: "You selected your level manually. Let's start practicing!"
    });
    navigate("/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-zinc-50 tracking-tight">
          How would you like to start?
        </h1>
        <p className="text-zinc-400 text-lg">
          Choose your path to get a personalized learning experience.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Option 1: Take Test */}
        <motion.div
          whileHover={{ y: -5 }}
          className="glass-panel p-8 rounded-3xl cursor-pointer group flex flex-col h-full"
          onClick={() => navigate("/placement")}
        >
          <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center mb-6 border border-violet-500/30 group-hover:bg-violet-500/30 transition-colors">
            <Compass className="text-violet-400 w-7 h-7" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-100 mb-3">Take a Placement Test</h2>
          <p className="text-zinc-400 mb-8 flex-1">
            Have a quick, natural conversation with our AI to accurately determine your English level and get a custom study plan.
          </p>
          <div className="flex items-center text-violet-400 font-medium group-hover:text-violet-300 transition-colors">
            Start Test <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </motion.div>

        {/* Option 2: Choose Level */}
        <motion.div
          whileHover={{ y: -5 }}
          className="glass-panel p-8 rounded-3xl flex flex-col h-full"
        >
          <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
            <FileCheck2 className="text-blue-400 w-7 h-7" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-100 mb-3">I know my level</h2>
          <p className="text-zinc-400 mb-6">
            Select your current English level to jump straight into training.
          </p>
          
          <div className="grid grid-cols-3 gap-3 mt-auto">
            {["A1", "A2", "B1", "B2", "C1"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleManualLevel(lvl)}
                className="py-3 rounded-xl border border-zinc-700 hover:border-blue-500 hover:bg-blue-500/10 text-zinc-300 hover:text-blue-400 font-medium transition-all"
              >
                {lvl}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
