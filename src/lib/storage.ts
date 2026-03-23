export interface VocabWord {
  word: string;
  meaning: string;
}

export interface UserProfile {
  level: string | null;
  plan: string[];
  feedback: string | null;
  progress: number;
  vocabulary: VocabWord[];
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
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        progress: parsed.progress || 0,
        vocabulary: parsed.vocabulary || []
      };
    }
    return { level: null, plan: [], feedback: null, progress: 0, vocabulary: [] };
  },
  setProfile: (profile: Partial<UserProfile>) => {
    const current = storage.getProfile();
    localStorage.setItem("echo_profile", JSON.stringify({ ...current, ...profile }));
  },
  updateProgress: (amount: number) => {
    const profile = storage.getProfile();
    const newProgress = Math.min(100, profile.progress + amount);
    storage.setProfile({ progress: newProgress });
    return newProgress;
  },
  addVocabulary: (word: string, meaning: string) => {
    const profile = storage.getProfile();
    // Avoid duplicates
    if (!profile.vocabulary.find(v => v.word.toLowerCase() === word.toLowerCase())) {
      storage.setProfile({ vocabulary: [{ word, meaning }, ...profile.vocabulary] });
    }
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

