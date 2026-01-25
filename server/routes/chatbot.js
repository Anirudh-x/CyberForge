/**
 * Chatbot Routes - Gemini AI Integration
 * 
 * This module handles chatbot interactions using Google's Gemini 2.5 Flash Lite model.
 * Features:
 * - Per-user chat sessions
 * - Streaming responses
 * - Security-focused AI assistant for CTF platform
 */
import 'dotenv/config'; // This MUST be the very first line
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from 'express';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configuration
// Change this line in your project
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// Store chat sessions per user (in-memory for now)
// In production, consider using Redis or database storage
const chatSessions = new Map();

/**
 * Initialize a new chat session with system prompt
 */
async function initializeChatSession() {
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ 
          text: "You are SequriQuest AI Assistant, a helpful and knowledgeable cybersecurity expert. You help users with CTF challenges, cybersecurity concepts, and provide guidance on ethical hacking. Be concise, friendly, and security-focused. Keep responses under 200 words unless asked for detailed explanations."
        }],
      },
      {
        role: "model",
        parts: [{ 
          text: "Hello! I'm SequriQuest AI Assistant. I'm here to help you with CTF challenges, cybersecurity concepts, and ethical hacking guidance. How can I assist you today?"
        }],
      },
    ],
  });
  
  return chat;
}

/**
 * POST /api/chatbot/message
 * Send a message to the chatbot and get a response
 * 
 * Request body:
 * - message: string (user's message)
 * - sessionId: string (optional, for maintaining conversation context)
 */
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required and must be a non-empty string' 
      });
    }

    // Prevent excessively long messages
    if (message.length > 2000) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is too long. Please keep it under 2000 characters.' 
      });
    }

    // Get or create chat session
    let chatSession;
    const userSessionId = sessionId || 'default';

    if (chatSessions.has(userSessionId)) {
      chatSession = chatSessions.get(userSessionId);
    } else {
      chatSession = await initializeChatSession();
      chatSessions.set(userSessionId, chatSession);
    }

    // Send message to Gemini and get response
    const result = await chatSession.sendMessage(message);
    const response = result.response;
    const text = response.text();

    // Return response
    res.json({ 
      success: true,
      reply: text,
      sessionId: userSessionId
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return res.status(500).json({ 
        success: false,
        error: 'Chatbot service is not properly configured. Please contact support.' 
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to get response from chatbot. Please try again.' 
    });
  }
});

/**
 * POST /api/chatbot/reset
 * Reset a chat session (clear conversation history)
 * 
 * Request body:
 * - sessionId: string (optional)
 */
router.post('/reset', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userSessionId = sessionId || 'default';

    // Remove existing session
    if (chatSessions.has(userSessionId)) {
      chatSessions.delete(userSessionId);
    }

    // Create new session
    const newSession = await initializeChatSession();
    chatSessions.set(userSessionId, newSession);

    res.json({ 
      success: true,
      message: 'Chat session reset successfully',
      sessionId: userSessionId
    });

  } catch (error) {
    console.error('Chat reset error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reset chat session' 
    });
  }
});

/**
 * GET /api/chatbot/health
 * Check if chatbot service is available
 */
router.get('/health', (req, res) => {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  
  res.json({ 
    success: true,
    status: isConfigured ? 'ready' : 'not_configured',
    model: 'gemini-2.5-flash-lite',
    activeSessions: chatSessions.size
  });
});

export default router;
