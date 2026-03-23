import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ClipboardCheck, CheckCircle, XCircle, ArrowRight, Home } from "lucide-react";
import { generateDailyTest } from "../lib/gemini";
import { storage } from "../lib/storage";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function DailyTest() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTest = async () => {
      const profile = storage.getProfile();
      const level = profile.level || "B1";
      const testQuestions = await generateDailyTest(level);
      if (testQuestions && testQuestions.length > 0) {
        setQuestions(testQuestions);
      } else {
        // Fallback
        setQuestions([
          {
            question: "Choose the correct sentence:",
            options: ["She go to school.", "She goes to school.", "She going to school."],
            correctAnswer: "She goes to school.",
            explanation: "For third-person singular (he/she/it) in present simple, we add 's' or 'es' to the verb."
          }
        ]);
      }
      setIsLoading(false);
    };
    loadTest();
  }, []);

  const handleSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);
    if (selectedAnswer === questions[currentQuestionIdx].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(idx => idx + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
      // Update progress based on score
      const percentage = (score / questions.length) * 100;
      if (percentage >= 60) {
        storage.updateProgress(10);
      } else {
        storage.updateProgress(2);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-400">Generating your daily test...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto p-6 min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-3xl p-10 text-center w-full"
        >
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardCheck size={40} />
          </div>
          <h2 className="text-3xl font-bold text-zinc-100 mb-2">Test Complete!</h2>
          <p className="text-zinc-400 mb-8">You scored {score} out of {questions.length}</p>
          
          <div className="bg-zinc-900/50 rounded-2xl p-6 mb-8 border border-zinc-800">
            <p className="text-zinc-300">
              {score === questions.length 
                ? "Perfect score! You're making excellent progress. Keep it up!" 
                : "Good effort! Review your mistakes and try again tomorrow."}
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <Home size={20} /> Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-6 min-h-screen">
      <div className="flex items-center justify-between mb-8 mt-4">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
            <ClipboardCheck size={24} />
          </div>
          Daily Test
        </h1>
        <div className="text-zinc-400 font-medium">
          Question {currentQuestionIdx + 1} of {questions.length}
        </div>
      </div>

      <div className="w-full bg-zinc-900 rounded-full h-2 mb-10 border border-zinc-800">
        <div 
          className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
          style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }} 
        />
      </div>

      <motion.div
        key={currentQuestionIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col"
      >
        <h2 className="text-2xl font-medium text-zinc-100 mb-8 leading-relaxed">
          {currentQ.question}
        </h2>

        <div className="space-y-4 mb-8">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQ.correctAnswer;
            
            let buttonClass = "w-full text-left p-5 rounded-2xl border transition-all ";
            
            if (!isSubmitted) {
              buttonClass += isSelected 
                ? "bg-emerald-600/20 border-emerald-500 text-emerald-100" 
                : "bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800";
            } else {
              if (isCorrect) {
                buttonClass += "bg-emerald-900/40 border-emerald-500 text-emerald-100";
              } else if (isSelected && !isCorrect) {
                buttonClass += "bg-rose-900/40 border-rose-500 text-rose-100";
              } else {
                buttonClass += "bg-zinc-900/30 border-zinc-800/50 text-zinc-500 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                disabled={isSubmitted}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{option}</span>
                  {isSubmitted && isCorrect && <CheckCircle className="text-emerald-500" size={20} />}
                  {isSubmitted && isSelected && !isCorrect && <XCircle className="text-rose-500" size={20} />}
                </div>
              </button>
            );
          })}
        </div>

        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-5 mb-8"
          >
            <p className="text-sm text-zinc-400 uppercase tracking-wider font-semibold mb-2">Explanation</p>
            <p className="text-zinc-200">{currentQ.explanation}</p>
          </motion.div>
        )}

        <div className="mt-auto pt-6 flex justify-end">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-medium transition-colors flex items-center gap-2"
            >
              {currentQuestionIdx < questions.length - 1 ? "Next Question" : "Finish Test"}
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
