import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Mic, Square, Volume2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { generateTrainingSentence, generateSpeech, evaluatePronunciation } from "../lib/gemini";

export default function Training() {
  const [level, setLevel] = useState("B1");
  const [sentence, setSentence] = useState("I usually wake up at 7 AM.");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; text: string; mistakes?: any[] } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const storedLevel = localStorage.getItem("userLevel");
    if (storedLevel) setLevel(storedLevel);
    loadNextSentence(storedLevel || "B1");
  }, []);

  const loadNextSentence = async (currentLevel: string, prev?: string) => {
    setFeedback(null);
    const newSentence = await generateTrainingSentence(currentLevel, prev);
    setSentence(newSentence);
  };

  const handleListen = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    const audioDataUrl = await generateSpeech(sentence);
    if (audioDataUrl) {
      const audio = new Audio(audioDataUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
    } else {
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedback(null);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Please allow microphone access to practice speaking.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Audio = base64data.split(",")[1];
        
        const result = await evaluatePronunciation(sentence, base64Audio, blob.type);
        if (result) {
          setFeedback({
            score: result.score,
            text: result.feedback,
            mistakes: result.mistakes,
          });
          if (result.score > 80) {
            setProgress((prev) => Math.min(prev + 20, 100));
          }
        } else {
          setFeedback({ score: 0, text: "Could not analyze audio. Please try again." });
        }
        setIsAnalyzing(false);
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-6 h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-lg">
            {level}
          </div>
          <span className="text-slate-400 font-medium">Training Session</span>
        </div>
        <div className="w-1/3 bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="bg-emerald-500 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          key={sentence}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-slate-100 leading-tight">
            "{sentence}"
          </h2>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center gap-6 mb-12">
          <button
            onClick={handleListen}
            disabled={isPlaying || isRecording || isAnalyzing}
            className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-indigo-400 transition-colors disabled:opacity-50"
          >
            <Volume2 size={28} />
          </button>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isPlaying || isAnalyzing}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
              isRecording
                ? "bg-rose-500 hover:bg-rose-600 animate-pulse shadow-rose-500/50"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30"
            } disabled:opacity-50`}
          >
            {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={40} />}
          </button>

          <button
            onClick={() => loadNextSentence(level, sentence)}
            disabled={isRecording || isAnalyzing}
            className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors disabled:opacity-50"
          >
            <ArrowRight size={28} />
          </button>
        </div>

        {/* Feedback Area */}
        <div className="w-full max-w-xl min-h-[120px]">
          {isAnalyzing && (
            <div className="flex items-center justify-center gap-3 text-indigo-400">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing pronunciation...</span>
            </div>
          )}

          {feedback && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border ${
                feedback.score > 80
                  ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-100"
                  : "bg-rose-900/20 border-rose-500/30 text-rose-100"
              }`}
            >
              <div className="flex items-start gap-4">
                {feedback.score > 80 ? (
                  <CheckCircle className="text-emerald-400 shrink-0 mt-1" size={24} />
                ) : (
                  <XCircle className="text-rose-400 shrink-0 mt-1" size={24} />
                )}
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    {feedback.score > 80 ? "Great pronunciation!" : "Needs a little work"}
                    <span className="ml-2 text-sm opacity-70">Score: {feedback.score}/100</span>
                  </h4>
                  <p className="opacity-90 mb-3">{feedback.text}</p>
                  
                  {feedback.mistakes && feedback.mistakes.length > 0 && (
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-sm font-medium mb-2 opacity-80">Try again with these words:</p>
                      <ul className="space-y-1">
                        {feedback.mistakes.map((m, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <span className="font-semibold text-rose-300">{m.word}</span>
                            <span className="opacity-50">→</span>
                            <span className="font-mono text-emerald-300">{m.expected_pronunciation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
