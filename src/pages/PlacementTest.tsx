import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Send, Bot, User } from "lucide-react";
import { processPlacementTestTurn } from "../lib/gemini";
import { storage } from "../lib/storage";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export default function PlacementTest() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hi! I'm here to evaluate your English. Let's start with a simple question: What do you enjoy doing in your free time?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: userMsg };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const aiResponse = await processPlacementTestTurn(userMsg, history);
      
      try {
        // Check if the response is JSON (meaning the test is over)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          
          storage.setProfile({
            level: result.level,
            plan: result.plan,
            feedback: result.feedback
          });

          setMessages((prev) => [...prev, { 
            id: Date.now().toString(), 
            role: "ai", 
            content: `Great job! I've determined your level is ${result.level}. I've created a personalized study plan for you. Let's go to your dashboard!` 
          }]);

          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
          return;
        }
      } catch (e) {
        // Not JSON, continue chat
      }

      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "ai", content: aiResponse }]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "ai", content: "Oops, something went wrong. Let's try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-4 h-screen">
      <div className="py-6 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-3 text-zinc-100">
          <div className="bg-violet-500/20 p-2 rounded-xl">
            <Bot className="text-violet-400" size={24} />
          </div>
          Placement Test
        </h2>
        <span className="text-sm font-medium text-zinc-500 bg-zinc-800/50 px-3 py-1 rounded-full">
          Evaluation Mode
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
              className={`max-w-[80%] rounded-3xl p-5 ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-br-sm"
                  : "glass-panel text-zinc-200 rounded-bl-sm"
              }`}
            >
              <div className="flex items-center gap-2 mb-2 opacity-60 text-xs font-medium uppercase tracking-wider">
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                <span>{msg.role === "user" ? "You" : "EchoCoach"}</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
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
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 pb-8">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your answer..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-5 pl-6 pr-16 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-zinc-100 placeholder:text-zinc-600"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
          >
            <Send size={20} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

