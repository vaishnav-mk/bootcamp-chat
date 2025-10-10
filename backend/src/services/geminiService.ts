import { GoogleGenAI } from "@google/genai";
import { config } from "@/config/env";
import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

class GeminiService {
  private client: GoogleGenAI | null = null;
  private systemPrompt: string = "You are a helpful AI assistant. Only respond to the latest user message.";

  constructor() {
    if (config.geminiApiKey) {
      this.client = new GoogleGenAI({
        apiKey: config.geminiApiKey
      });
    } else {
      console.warn("Gemini API key not provided. LLM features will be disabled.");
    }
    
    this.loadSystemPrompt();
  }

  private async loadSystemPrompt(): Promise<void> {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const promptPath = path.join(__dirname, "../prompts/system.txt");
      const raw = await fs.readFile(promptPath, "utf-8");
      const promptContent = raw.trim().replace("{{current_date}}", new Date().toISOString());
      console.log("Loaded system prompt:", promptContent);
      this.systemPrompt = promptContent;
    } catch (error) {
      console.error("Failed to load system prompt:", error);
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generateResponse(message: string, conversationHistory?: Array<{role: string, content: string}>): Promise<string> {
    if (!this.client) {
      throw new Error("Gemini service not available. Please configure GEMINI_API_KEY.");
    }

    try {
      const contents = [];
      
      contents.push({
        role: "user",
        parts: [{ text: this.systemPrompt }]
      });
      contents.push({
        role: "model", 
        parts: [{ text: "I understand. I'm ready to help as your AI assistant." }]
      });

      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-8);
        
        for (const msg of recentHistory) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          });
        }
      }

      contents.push({
        role: "user",
        parts: [{ text: `Current message to respond to: ${message}` }]
      });

      console.log("AAAAAAAAA-- Sending contents to Gemini:", contents);

      const response = await this.client.models.generateContent({
        model: config.geminiModel,
        contents: contents,
      });

      return response.text || "I apologize, but I couldn't generate a response at this time.";
    } catch (error) {
      console.error("Error generating Gemini response:", error);
      throw new Error("Failed to generate response from Gemini");
    }
  }
}

export const geminiService = new GeminiService();