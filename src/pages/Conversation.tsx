import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Send, Bot, User, Mic, Square, Volume2 } from "lucide-react";
import { processConversationTurn, generateSpeech } from "../lib/gemini";
import { storage, ChatMessage } from "../lib/storage";

export default function Conversation() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userLevel, setUserLevel] = useState("B1");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const profile = storage.getProfile();
    if (profile.level) setUserLevel(profile.level);

    const history = storage.getChatHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      const initialMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "ai",
        content: `Hi there! I'm EchoCoach. Let's practice your English. What's on your mind today?`,
        timestamp: Date.now()
      };
      setMessages([initialMsg]);
      storage.saveChatMessage(initialMsg);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendText = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    await processTurn(null, null, text);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Please allow microphone access to use voice chat.");
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
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      const base64Audio = base64data.split(",")[1];
      await processTurn(base64Audio, blob.type, null);
    };
  };

  const processTurn = async (audioBase64: string | null, mimeType: string | null, text: string | null) => {
    setIsLoading(true);
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text || "🎤 (Voice Message)",
      timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, userMsg]);
    storage.saveChatMessage(userMsg);

    try {
      // Format history for Gemini
      const history = messages.map(m => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const aiResponseText = await processConversationTurn(
        audioBase64,
        mimeType,
        text,
        history,
        userLevel
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiResponseText,
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, aiMsg]);
      storage.saveChatMessage(aiMsg);

      // Auto-play response
      const audioDataUrl = await generateSpeech(aiResponseText);
      if (audioDataUrl) {
        const audio = new Audio(audioDataUrl);
        audio.play();
      }

    } catch (error) {
      console.error("Error processing turn:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const playMessage = async (text: string) => {
    const audioDataUrl = await generateSpeech(text);
    if (audioDataUrl) {
      const audio = new Audio(audioDataUrl);
      audio.play();
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 h-screen">
      <div className="py-6 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-3 text-zinc-100">
          <div className="bg-blue-500/20 p-2 rounded-xl">
            <Mic className="text-blue-400" size={24} />
          </div>
          Free Conversation
        </h2>
        <span className="text-sm font-medium text-zinc-500 bg-zinc-800/50 px-3 py-1 rounded-full">
          Level: {userLevel}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-8 space-y-6">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-3xl p-5 relative group ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "glass-panel text-zinc-200 rounded-bl-sm"
              }`}
            >
              <div className="flex items-center gap-2 mb-2 opacity-60 text-xs font-medium uppercase tracking-wider">
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                <span>{msg.role === "user" ? "You" : "EchoCoach"}</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
              
              {msg.role === "ai" && (
                <button 
                  onClick={() => playMessage(msg.content)}
                  className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Volume2 size={18} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-panel text-zinc-200 rounded-3xl rounded-bl-sm p-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 pb-8 flex items-center gap-3">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
            isRecording
              ? "bg-rose-500 hover:bg-rose-600 animate-pulse shadow-rose-500/50"
              : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
          } disabled:opacity-50`}
        >
          {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={24} className={isRecording ? "" : "text-blue-400"} />}
        </button>

        <div className="relative flex-1 group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendText()}
            placeholder="Type a message or use the microphone..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-6 pr-16 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-zinc-100 placeholder:text-zinc-600"
            disabled={isLoading || isRecording}
          />
          <button
            onClick={handleSendText}
            disabled={!input.trim() || isLoading || isRecording}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            <Send size={18} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
