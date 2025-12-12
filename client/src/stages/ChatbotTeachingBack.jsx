import { usePlayer, useStage } from "@empirica/core/player/classic/react";
import React, { useState, useEffect, useRef } from "react";
import { Timer } from "../components/Timer";
import { GEMINI_API_KEY } from "../config/api-key";

export function ChatbotTeachingBack() {
  const player = usePlayer();
  const stage = useStage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const hasStarted = stage.get("teachingBackStarted") || false;

  useEffect(() => {
    if (!hasStarted) {
      // Initialize the teaching back conversation - act like a confused student
      const initialMessage = {
        role: "assistant",
        content: "Hi! I've never heard of the Doppler Effect before. Can you teach me about it? I'm a bit confused about physics concepts, so please explain it in a way that's easy to understand.",
      };
      setMessages([initialMessage]);
      stage.set("teachingBackStarted", true);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // Save the teaching explanation
    const currentExplanation = player.stage.get("teachingExplanation") || "";
    player.stage.set("teachingExplanation", currentExplanation + (currentExplanation ? "\n\n" : "") + currentInput);

    try {
      const API_KEY = GEMINI_API_KEY;
      
      // Build conversation context for Gemini
      const conversationParts = [];
      messages.forEach((msg) => {
        conversationParts.push({
          text: msg.role === "user" ? `Teacher: ${msg.content}` : `Student: ${msg.content}`
        });
      });
      conversationParts.push({ text: `Teacher: ${currentInput}` });
      
      const prompt = `You are a STUDENT learning about the Doppler Effect. A teacher is explaining it to you. 
Your role is to act like a REAL STUDENT who:
- Sometimes doesn't understand explanations
- Questions things that seem unclear or incorrect
- Gets confused when explanations are wrong or incomplete
- Asks for clarification when something doesn't make sense
- Shows uncertainty when the teacher makes mistakes

IMPORTANT BEHAVIOR RULES:
1. If the teacher's explanation is CORRECT and clear: Show understanding with responses like "Oh, I see!", "That makes sense", "Got it, thanks!", or ask a follow-up question to show engagement.

2. If the teacher's explanation is INCORRECT, unclear, or has mistakes: 
   - DO NOT correct them or provide the right answer
   - Instead, act confused or question it with responses like:
     * "Hmm, I don't think that's quite right..."
     * "I'm not sure I understand that part"
     * "Wait, that doesn't make sense to me"
     * "I'm confused about that"
     * "That seems off to me"
     * "I don't think that's correct"
   - Ask them to explain again or clarify

3. Keep responses SHORT (1-2 sentences max)
4. Be natural and conversational
5. Show genuine confusion when explanations are wrong - don't pretend to understand
6. Never give away the correct answer - just express confusion or doubt

Now respond as a student would:\n\n` +
        conversationParts.map(p => p.text).join("\n\n") + "\n\nStudent:";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to get response");
      }

      const data = await response.json();
      const assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        "Thank you for your explanation!";

      const assistantMessage = {
        role: "assistant",
        content: assistantContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      // Fallback responses that sound like a confused student
      const fallbackResponses = [
        "Hmm, I'm not sure I understand that part. Can you explain it differently?",
        "I'm a bit confused. Could you clarify?",
        "That doesn't quite make sense to me. Can you go over that again?",
      ];
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: randomResponse,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    // Save final conversation history to both stage and player level
    player.stage.set("teachingBackConversation", messages);
    player.set("teachingBackConversation", messages);
    const finalExplanation = player.stage.get("teachingExplanation") || "";
    player.stage.set("finalTeachingExplanation", finalExplanation);
    player.set("finalTeachingExplanation", finalExplanation);
    player.stage.set("submit", true);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Teaching Phase: Explain the Doppler Effect
        </h2>
        <Timer />
      </div>

      <div className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-500">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your explanation of the Doppler Effect here..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px] resize-y"
          rows={4}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed self-end"
        >
          Send
        </button>
      </form>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleContinue}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Continue to Quiz
        </button>
      </div>
    </div>
  );
}

