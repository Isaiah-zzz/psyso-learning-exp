const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GEMINI_API_KEY: configApiKey } = require("./config/api-key");

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini API
// Priority: environment variable > config file
const apiKey = process.env.GEMINI_API_KEY || configApiKey;
const genAI = new GoogleGenerativeAI(apiKey);

// Teaching endpoint - generates initial teaching content
app.post("/api/gemini/teach", async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Gemini API key not configured. Please set GEMINI_API_KEY environment variable." 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = message || 
      "You are an expert Physics Professor. Your goal is to teach the user about the Doppler Effect. Keep your explanations clear, accurate, and concise (under 100 words per response). Start by introducing the concept. Cover frequency change, sound waves, and light waves (red shift/blue shift).";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ 
      error: "Failed to generate teaching content",
      details: error.message 
    });
  }
});

// Chat endpoint - for ongoing conversation
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Gemini API key not configured. Please set GEMINI_API_KEY environment variable." 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build conversation context
    let prompt = "You are a helpful AI tutor teaching about the Doppler Effect. ";
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += "Here's our conversation so far:\n\n";
      conversationHistory.forEach((msg) => {
        prompt += `${msg.role === "user" ? "Student" : "Tutor"}: ${msg.content}\n\n`;
      });
    }
    prompt += `Student: ${message}\n\nTutor:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ 
      error: "Failed to get response",
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

