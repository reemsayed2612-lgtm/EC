export interface UserProfile {
  level: string | null;
  plan: string[];
  feedback: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

export const storage = {
  getProfile: (): UserProfile => {
    const data = localStorage.getItem("echo_profile");
    if (data) return JSON.parse(data);
    return { level: null, plan: [], feedback: null };
  },
  setProfile: (profile: UserProfile) => {
    localStorage.setItem("echo_profile", JSON.stringify(profile));
  },
  getChatHistory: (): ChatMessage[] => {
    const data = localStorage.getItem("echo_chat_history");
    if (data) return JSON.parse(data);
    return [];
  },
  saveChatMessage: (message: ChatMessage) => {
    const history = storage.getChatHistory();
    history.push(message);
    localStorage.setItem("echo_chat_history", JSON.stringify(history));
  },
  clearChatHistory: () => {
    localStorage.removeItem("echo_chat_history");
  },
  clearAll: () => {
    localStorage.removeItem("echo_profile");
    localStorage.removeItem("echo_chat_history");
  }
};
