import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function generateSpeech(text: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Zephyr" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/pcm;rate=24000;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
}

export async function evaluatePronunciation(
  expectedSentence: string,
  audioBase64: string,
  mimeType: string
): Promise<{ score: number; feedback: string; mistakes?: { word: string; expected_pronunciation: string }[] } | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: audioBase64, mimeType } },
            { text: `The user was supposed to say: "${expectedSentence}". Evaluate their pronunciation and fluency. Be encouraging. Score from 0 to 100. If there are specific words they mispronounced, list them with their IPA pronunciation.` },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Score from 0 to 100" },
            feedback: { type: Type.STRING, description: "Encouraging feedback message" },
            mistakes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  expected_pronunciation: { type: Type.STRING, description: "IPA format" },
                },
                required: ["word", "expected_pronunciation"],
              },
            },
          },
          required: ["score", "feedback"],
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (jsonStr) return JSON.parse(jsonStr);
    return null;
  } catch (error) {
    console.error("Error evaluating pronunciation:", error);
    return null;
  }
}

export function createPlacementTestChat() {
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are an expert English evaluator. Your goal is to determine the user's English level (A1-C1) and create a study plan.
1. Ask 3 progressive questions, one at a time, to test their vocabulary and grammar.
2. Start by saying: "Hi! I'm here to evaluate your English. Let's start with a simple question: What do you enjoy doing in your free time?"
3. After they answer the 3rd question, you MUST output ONLY a JSON object evaluating their level. Do not output any conversational text after the 3rd answer, ONLY JSON.

JSON Format:
{
  "level": "B1",
  "feedback": "You have a good grasp of basic grammar, but struggle with complex tenses.",
  "plan": ["Master present perfect tense", "Expand vocabulary related to work", "Practice listening to native speakers"]
}`,
    },
  });
}

export async function generateTrainingSentence(level: string, previousSentence?: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a single English sentence for a user at the ${level} level to practice speaking.
      ${previousSentence ? `The previous sentence was: "${previousSentence}". Generate a different one.` : ""}
      Only output the sentence, nothing else. No quotes.`,
    });
    return response.text?.trim() || "I usually wake up at 7 AM.";
  } catch (error) {
    return "I usually wake up at 7 AM.";
  }
}

export async function processConversationTurn(
  audioBase64: string | null,
  mimeType: string | null,
  text: string | null,
  history: { role: string; parts: { text: string }[] }[],
  userLevel: string
) {
  try {
    const parts: any[] = [];
    if (audioBase64 && mimeType) {
      parts.push({ inlineData: { data: audioBase64, mimeType } });
    }
    if (text) {
      parts.push({ text });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: "user", parts }
      ],
      config: {
        systemInstruction: `You are EchoCoach, a professional, friendly English speaking coach.
The user's current level is ${userLevel}.
Have a natural conversation with them.
If they make a grammar or pronunciation mistake, gently correct them in your response, then continue the conversation.
Keep your responses relatively short (1-3 sentences) so they can practice listening and replying.`,
      }
    });

    return response.text || "I didn't quite catch that. Could you repeat?";
  } catch (error) {
    console.error("Error in conversation:", error);
    return "Sorry, I'm having trouble connecting right now.";
  }
}
