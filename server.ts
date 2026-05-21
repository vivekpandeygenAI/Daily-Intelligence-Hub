import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import cron from "node-cron";
import { format } from "date-fns";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}
if (!fs.existsSync(JOBS_FILE)) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify([]));
}

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

interface Job {
  id: string;
  date: string;
  timestamp: number;
  newsSources: any[];
  script: string;
  metadata: {
    title: string;
    description: string;
    tags: string[];
    thumbnailTitle: string;
    thumbnailSuggestion: string;
  };
}

async function runDailyAIGeneration() {
  console.log("Running scheduled AI News generation...");
  try {
    const prompt = `Search for the latest AI technology enhancements, new skills, and major developments from the last 24 hours. 
    Analyze these developments and:
    1. Create a engaging YouTube video script in simple English suitable for a 5-minute video.
    2. Suggest a catchy Thumbnail Title and a Visual Suggestion for the thumbnail.
    3. Provide a SEO-friendly YouTube Video Title, Description, and Tags.
    
    Format the response as a valid JSON object with the following structure:
    {
      "script": "...",
      "metadata": {
        "title": "...",
        "description": "...",
        "tags": ["...", "..."],
        "thumbnailTitle": "...",
        "thumbnailSuggestion": "..."
      }
    }`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: { type: Type.STRING },
            metadata: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                thumbnailTitle: { type: Type.STRING },
                thumbnailSuggestion: { type: Type.STRING },
              },
              required: ["title", "description", "tags", "thumbnailTitle", "thumbnailSuggestion"],
            },
          },
          required: ["script", "metadata"],
        },
      },
    });

    const data = JSON.parse(result.text || "{}");
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const newJob: Job = {
      id: Date.now().toString(),
      date: format(new Date(), "yyyy-MM-dd"),
      timestamp: Date.now(),
      newsSources: groundingChunks,
      script: data.script,
      metadata: data.metadata,
    };

    const jobs: Job[] = JSON.parse(fs.readFileSync(JOBS_FILE, "utf-8"));
    jobs.unshift(newJob);
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs.slice(0, 30), null, 2)); // Keep last 30 days
    console.log("Generation completed successfully.");
    return newJob;
  } catch (error: any) {
    console.error("Error during scheduled generation:", error);
    if (error.message?.includes("RESOURCE_EXHAUSTED") || error.status === 429) {
      throw new Error("AI Quota Exceeded. Please try again later.");
    }
    throw error;
  }
}

// REST API
app.get("/api/jobs", (req, res) => {
  const jobs = JSON.parse(fs.readFileSync(JOBS_FILE, "utf-8"));
  res.json(jobs);
});

app.post("/api/generate", async (req, res) => {
  try {
    const job = await runDailyAIGeneration();
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule for 12:00 AM daily
cron.schedule("0 0 * * *", () => {
  runDailyAIGeneration();
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
