import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getProfileStats,
  getUserSubmissionStats,
  getUserRankingHistory,
  getRecentSubmissions,
  getLastMediumSolved,
  getContestRankingHistory,
  getUserCalendarData,
  getUserLanguageStats,
} from "./tool_calling.js";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const VIKRAM_PROFILE = `
Vikram Singh — Computer Science Engineer (B.Tech, VIT Chennai, CGPA 8.42, graduating 2025)
Email: vikramandanshu@gmail.com | Phone: +91 8928480961 | Location: Mumbai, Maharashtra

WORK EXPERIENCE
• Office Solutions (Backend Trainee, Mar–Jun 2025, Remote)
  – Delivered a benchmarking tool within 3 weeks using BDD (Cucumber, JUnit) with 50+ unit tests.
  – Simplified DB entities and removed redundant queries → ~50% performance boost.
  – Implemented Redis-based rate limiter. Stack: Java, Spring Boot, Redis, Azure.

• Cribble Org (SWE Intern, Jan–Mar 2025, Remote)
  – Implemented Winston logging with 50+ component logs.
  – Optimized Firestore deployments on GCP (Firebase Console).
  – Built Telegram MiniApp for 3 K+ users. Stack: React, Firebase, GCP.

• CozyCabs (Backend Intern, Aug–Oct 2024, Remote)
  – Built 10+ REST APIs using MVC architecture.
  – Combined GraphQL and REST for DB and service layers → higher efficiency.
  – Added OTP auth and maintained 100+ production commits. Stack: Node.js, GraphQL.

• ShortHills.ai (Full-Stack Intern, Sep–Dec 2023, Gurgaon)
  – Developed internal tool integrating Cloudinary API. Stack: Django, Cloudinary, MySQL.

PROJECTS
• Personal Portfolio (May 2022 – Present)
  – Long-term Next.js distributed service portfolio with Agentic support, cloud Redis instance, JWT auth, SEO friendly, CDN caching (Vercel deploy).

• Simplified Google Search Engine (Apr–Jun 2025)
  – Designed a crawler-based search engine ranking sites by query relevance.
  – Implemented smart Go crawler with header rotation to avoid blocks. Stack: Go, MongoDB.

EDUCATION
• Vellore Institute of Technology (2021 – 2025) — B.Tech in Computer Science
  – CGPA 8.42/10 | 1st place in Google Hash Code on campus (50+ teams)

SKILLS
• Languages: Java, JavaScript, TypeScript, Python, SQL, Bash
• Technologies: Linux, MySQL, MongoDB, Redis, Docker, Git, GCP, Azure, Firebase
• Interests: Weightlifting, Sketching, Travel
`;


const tools = [
  {
    functionDeclarations: [
      {
        name: "getProfileStats",
        description:
          "Fetches the user's LeetCode profile statistics such as total solved problems, ranking, and badges.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  },
  {
    functionDeclarations: [
      {
        name: "getUserSubmissionStats",
        description:
          "Fetches the user's LeetCode submission statistics such as total submissions and accepted submissions.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  },
  {
    functionDeclarations: [
      {
        name: "getUserRankingHistory",
        description: "Fetches the user's LeetCode contest ranking history.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  },
  {
    functionDeclarations: [
      {
        name: "getRecentSubmissions",
        description: "Fetches the user's recent LeetCode submissions.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  },
  {
    functionDeclarations: [
      {
        name: "getLastMediumSolved",
        description:
          "Fetches the last medium difficulty question solved by the user.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  },
  {
    functionDeclarations: [
      {
        name: "getContestRankingHistory",
        description: "Fetches the user's contest ranking history.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  },
  {
    functionDeclarations: [
      {
        name: "getUserCalendarData",
        description: "Fetches the user's LeetCode calendar data.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  },
  {
    functionDeclarations: [
      {
        name: "getUserLanguageStats",
        description:
          "Fetches all languages the user has used on LeetCode along with solved counts.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  },
];

export async function getGeminiLeetCodeResponse(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools,
    });
    const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [
        {
          text: `System instruction: You are a helpful assistant specialized in analyzing Vikram's Resume and LeetCode data.
          You can use built-in tools to fetch live LeetCode stats and also answer questions about Vikram’s background, projects, or experience.

          Resume & Profile Context:
          ${VIKRAM_PROFILE}

          Rules:
          - If the question is about LeetCode, use the available tools.
          - If its a general query about vikram, refer to resume and give a human like professional response.
          - If it’s about Vikram’s skills, experience, or projects, answer directly from the context above.
          - Keep responses factual, and professional.
          - If the question is unrelated to either, respond with: "I can only answer questions related to Vikram's profile or LeetCode stats."`
        },
      ],
    },
  ],
});


    let result = await chat.sendMessage(prompt);
    let response = result.response;

    const availableFunctions = {
      getUserLanguageStats,
      getProfileStats,
      getUserSubmissionStats,
      getUserRankingHistory,
      getRecentSubmissions,
      getLastMediumSolved,
      getContestRankingHistory,
      getUserCalendarData,
    };
    while (true) {
      const functionCalls = response.functionCalls();
      if (!functionCalls || functionCalls.length === 0) break;

      const functionCall = functionCalls[0];
      console.log("Function called:", functionCall.name);

      const fn = availableFunctions[functionCall.name];
      if (!fn)
        throw new Error(`No function implemented for ${functionCall.name}`);

      const fnResponse = await fn();
      console.log("Function response:", fnResponse);
      const safeResponse = JSON.parse(JSON.stringify(fnResponse));
const structuredResponse = {
  name: functionCall.name,
  content: safeResponse,
};

result = await chat.sendMessage([
  {
    functionResponse: {
      name: functionCall.name,
      response: structuredResponse,
    },
  },
]);


      response = result.response; // VERY IMPORTANT
    }

    const finalText = response.text();
    console.log("Gemini:", finalText);

    return finalText || "I couldn’t generate a response.";
  } catch (error) {
    console.error(" Error:", error.message);
    return "There was an error generating your response.";
  }
}
