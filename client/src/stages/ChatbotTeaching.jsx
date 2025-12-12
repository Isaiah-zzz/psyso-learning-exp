import { usePlayer, useStage } from "@empirica/core/player/classic/react";
import React, { useState, useEffect, useRef } from "react";
import { Timer } from "../components/Timer";
import { GEMINI_API_KEY } from "../config/api-key";

export function ChatbotTeaching() {
  const player = usePlayer();
  const stage = useStage();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const hasStarted = stage.get("teachingStarted") || false;

  useEffect(() => {
    if (!hasStarted) {
      // Initialize the teaching conversation with a natural greeting
      const initialMessage = {
        role: "assistant",
        content: "Hey! I'm going to teach you about the Doppler Effect today. It's a pretty cool physics concept that you've probably experienced in real life. Ready to learn? Just say 'yes' or 'ready' when you want to start, or feel free to ask me anything!",
      };
      setMessages([initialMessage]);
      stage.set("teachingStarted", true);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getTeachingResponse = async (userInput, conversationHistory) => {
    const API_KEY = GEMINI_API_KEY;
    
    // Build conversation context
    const conversationParts = [];
    conversationHistory.forEach((msg) => {
      conversationParts.push({
        text: msg.role === "user" ? `Student: ${msg.content}` : `Tutor: ${msg.content}`
      });
    });
    conversationParts.push({ text: `Student: ${userInput}` });
    
    // Create an interactive teaching prompt - more realistic teacher behavior
    const systemPrompt = `You are a REAL teacher explaining the Doppler Effect to a student. Act naturally like a human teacher would:
- Be conversational and friendly, but not overly perfect
- Break concepts into digestible chunks (2-3 paragraphs max per response)
- Sometimes pause to check if the student understands: "Does that make sense?", "Are you following?", "Any questions so far?"
- Use everyday examples and analogies that students can relate to
- If the student seems confused, try explaining it differently
- If they ask questions, answer clearly but don't be overly formal
- Occasionally use casual language like "So basically..." or "Think of it this way..."
- Don't be a perfect robot - be human-like in your responses
- If the student says "yes", "ready", "ok", "let's go", or similar, start teaching the Doppler Effect step by step
- After explaining a concept, naturally check in: "Make sense?", "Have you heard of this before?", "Does that help?"
- Keep responses natural and conversational (3-4 sentences for explanations, 1-2 for questions)

Start teaching the Doppler Effect when the student is ready. Cover:
1. What the Doppler Effect is (in simple terms)
2. How it works with sound waves (with examples)
3. How it works with light waves (briefly)
4. Real-world examples they might have experienced

Remember: Be a REAL teacher, not a perfect AI. Be natural, conversational, and human-like!`;

    const prompt = systemPrompt + "\n\n" + conversationParts.map(p => p.text).join("\n\n") + "\n\nTutor:";
    
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I'm sorry, I couldn't process that. Could you try rephrasing your question?";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    const userMessage = {
      role: "user",
      content: userInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const assistantContent = await getTeachingResponse(userInput, messages);
      
      const assistantMessage = {
        role: "assistant",
        content: assistantContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I apologize, but I'm having trouble responding: ${error.message}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    // Save conversation history to both stage and player level
    player.stage.set("teachingConversation", messages);
    player.set("teachingConversation", messages);
    player.stage.set("submit", true);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Learning Phase: Doppler Effect
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
                    ? "bg-blue-500 text-white"
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

      {/* Quick action buttons - show only at the start */}
      {messages.length <= 1 && !isLoading && (
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={async () => {
              const userInput = "Yes, I'm ready!";
              const userMessage = { role: "user", content: userInput };
              setMessages((prev) => [...prev, userMessage]);
              setIsLoading(true);
              try {
                const assistantContent = await getTeachingResponse(userInput, messages);
                setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
              } catch (error) {
                console.error("Error:", error);
                setMessages((prev) => [...prev, { role: "assistant", content: "I'm ready to teach! Let's start with what the Doppler Effect is." }]);
              } finally {
                setIsLoading(false);
              }
            }}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors"
          >
            ✓ I'm ready!
          </button>
          <button
            onClick={async () => {
              const userInput = "What is the Doppler Effect?";
              const userMessage = { role: "user", content: userInput };
              setMessages((prev) => [...prev, userMessage]);
              setIsLoading(true);
              try {
                const assistantContent = await getTeachingResponse(userInput, messages);
                setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
              } catch (error) {
                console.error("Error:", error);
                setMessages((prev) => [...prev, { role: "assistant", content: "Great question! Let me explain..." }]);
              } finally {
                setIsLoading(false);
              }
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            What is it?
          </button>
          <button
            onClick={async () => {
              const userInput = "Can you give me an example?";
              const userMessage = { role: "user", content: userInput };
              setMessages((prev) => [...prev, userMessage]);
              setIsLoading(true);
              try {
                const assistantContent = await getTeachingResponse(userInput, messages);
                setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
              } catch (error) {
                console.error("Error:", error);
                setMessages((prev) => [...prev, { role: "assistant", content: "Sure! Here's a great example..." }]);
              } finally {
                setIsLoading(false);
              }
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            Show me an example
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message or question here..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleContinue}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Continue to Next Stage
        </button>
      </div>
    </div>
  );
}

