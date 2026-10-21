import { contributions } from "./contributions";

export const profile = `Vikram Singh
AI Product Engineer, Mumbai, Maharashtra, India.
Email: vikramandanshu@gmail.com
GitHub: https://github.com/vikramsingh117
LeetCode: https://leetcode.com/u/vikramandanshu/

WORK EXPERIENCE
Upliance.ai — AI Product Engineer, January 2026–present.
His role includes product decisions and ownership alongside engineering implementation.
Collaborated with the product team on an Airfryer app revamp, integrating Server-Sent Events for real-time LLM updates.
Built voice-enabled onboarding with WebSockets.
Manages and maintains the Upliance app backend for an AI platform serving over 4,000 daily active customers.
Built a centralized VPS for SSH access and device-specific policy management.
Deployed 10+ GCP triggers, each containing over 100 lines of SQL code.

Office Solutions — Backend Trainee, March–June 2025.
Refactored and delivered a benchmarking tool to the client in three weeks.
Wrote 50+ tests with Cucumber and JUnit using a test-driven architecture.
Simplified entity relationships and removed unnecessary queries for a 50% performance improvement.
Implemented Redis rate limiting. Stack: Java, Spring Boot, Redis, Azure.

Cribble Org — SWE Intern, January–March 2025.
Implemented Winston logging with 50+ global and component logs.
Maintained and optimized Firestore deployments on Google Cloud.
Worked on a Telegram MiniApp for a community of 3,000+ members.
Stack: React, Firebase, GCP.

PROJECTS
Personal Portfolio — May 2022–present.
A deployed, CDN-cached serverless application maintained for over four years, exploring SEO, global state management, authentication, and AI.
Stack: Next.js, Docker, Redis, JWT.

Go Web Crawler & Search Index — April–June 2025.
Live application: https://go-web-crawler.onrender.com/
A lightweight crawling and indexing service that fetches live webpages, extracts and analyzes text, measures keyword frequency, and stores crawl results in MongoDB Atlas for later inspection.
Built with Go and net/http, GoQuery for HTML parsing, Gzip/Brotli/Deflate response handling, a responsive HTML/CSS interface, and environment-based database configuration.
Turns raw webpages into structured, searchable observations. The current project description does not establish a query-ranking algorithm.

EDUCATION
Vellore Institute of Technology, Chennai. B.Tech, Computer Science, March 2021–September 2025.
CGPA: 8.42/10.
First place on campus among 50+ teams at Google Hash Code.
Contributed to Kestra and MCPJam open-source projects.

OPEN SOURCE (statuses supplied by Vikram, not live-verified)
${contributions.map(item => `${item.project}: ${item.title}. Status: ${item.status}. ${item.url}`).join("\n")}
A separate Kestra schema-fix PR was closed, not merged; its URL was not provided.
The open Claude Agent SDK PR is proposed work, not an accepted upstream feature.

SKILLS
Languages: Java, JavaScript, TypeScript, Python, SQL, Bash.
Technologies: Linux, MySQL, MongoDB, Redis, Docker, Git, GCP, Azure, Firebase.
No details about availability, compensation, unlisted employers, project repository URLs, or unpublished implementation details are provided.
`;

export const resumeTopics = [
  { pattern: /trigger|gcp.*sql|sql.*gcp/i, answer: "At Upliance.ai, Vikram deployed 10+ GCP triggers, each containing over 100 lines of SQL code." },
  { pattern: /open.source|kestra|mcp.?jam|anthropic|claude|contribution|pull.request/i, answer: `Vikram's open-source work (statuses supplied by him, not live-synced):\n\n${contributions.map(item => `${item.project}: ${item.title} — ${item.status}.\n${item.url}`).join("\n\n")}\n\nA separate Kestra schema fix was closed, not merged. The Claude Agent SDK PR remains proposed work, not an accepted upstream feature.` },
  { pattern: /website|repo|source.code|chatbot|assistant|stream|master.prompt|system.prompt|next\.js|css|react|bucket|embedding|signal.room|after.hours/i, answer: "This portfolio uses Next.js Pages Router, React, and CSS Modules. The landing chooser offers Simple and After Hours. After Hours uses a scroll-driven animated signal to illustrate voice, scale, performance and open-source work. The Signal Room experiment was removed. Diagrams are illustrative, not live telemetry.\n\nAboutChat.js reads SSE replies from /api/about. The API combines a master prompt, embedded résumé and repository context, then streams Gemini text. Keys stay server-side; requests are validated and rate limited per process.\n\nLive GCP bucket retrieval and vector search are not currently connected." },
  { pattern: /product|ownership|decision/i, answer: "Vikram is an AI Product Engineer at Upliance.ai. His role spans product decisions, engineering implementation and ownership—not just model integration. His work includes the Airfryer app revamp, real-time LLM updates, voice onboarding and backend maintenance for a platform serving 4,000+ daily active customers. Specific roadmap decisions and unlisted product outcomes have not been provided." },
  { pattern: /upliance|voice|real.time|websocket|\bsse\b|current|ai experience|ai engineer/i, answer: "Vikram is an AI Product Engineer at Upliance.ai (January 2026–present). He integrated Server-Sent Events for real-time LLM updates in the Airfryer app and built voice onboarding with WebSockets.\n\nHe also maintains backend services for a platform serving 4,000+ daily active customers and built a centralized VPS for SSH access and device-specific policies." },
  { pattern: /performance|50%|office|benchmark|test|redis|backend/i, answer: "At Office Solutions, Vikram simplified database entity relationships and removed unnecessary queries, producing a 50% performance improvement. He delivered a benchmarking tool in three weeks and wrote 50+ tests using Cucumber and JUnit.\n\nThe backend stack included Java, Spring Boot, Redis, and Azure, with Redis also used for rate limiting." },
  { pattern: /project|search|crawler|portfolio|built|build/i, answer: "Go Web Crawler & Search Index (April–June 2025): fetches live webpages with Go and net/http, parses HTML with GoQuery, measures keyword frequency, and stores crawl results in MongoDB Atlas. It handles Gzip, Brotli, and Deflate responses, with a responsive HTML/CSS interface and environment-based database configuration.\n\nPersonal portfolio (2022–present): a serverless Next.js application maintained for four years, exploring CDN caching, SEO, authentication, Redis, Docker, and AI." },
  { pattern: /cribble|telegram|community|firebase|logging/i, answer: "At Cribble Org (January–March 2025), Vikram worked on a Telegram MiniApp for a community of 3,000+ members. He implemented 50+ Winston logs and maintained and optimized Firestore deployments on Google Cloud. The stack included React, Firebase, and GCP." },
  { pattern: /education|college|vit|degree|cgpa|hash|open.source|kestra|mcpjam|achievement/i, answer: "Vikram earned a B.Tech in Computer Science at VIT Chennai (2021–2025), with a CGPA of 8.42/10. He placed first on campus among 50+ teams at Google Hash Code and has contributed to Kestra and MCPJam." },
  { pattern: /contact|email|reach|hire|available|availability|salary/i, answer: "You can reach Vikram at vikramandanshu@gmail.com or find his work at github.com/vikramsingh117. He is based in Mumbai. His résumé doesn’t state availability or compensation expectations, so it’s best to ask him directly." },
  { pattern: /skill|stack|language|tool|technolog/i, answer: "Vikram works with Java, JavaScript, TypeScript, Python, SQL, and Bash. His infrastructure and data toolkit includes Redis, MongoDB, MySQL, Docker, Linux, GCP, Azure, Firebase, and Git.\n\nHis work spans real-time communication with SSE and WebSockets, Spring Boot backends, React apps, and Go-based crawling." },
  { pattern: /who|introduc|experience|about|summary|fit|strength/i, answer: "Vikram is an AI Product Engineer based in Mumbai, currently at Upliance.ai. His work connects real-time AI experiences with the backend systems that support them.\n\nBefore Upliance, he improved backend performance at Office Solutions and worked on community software at Cribble Org. He studied Computer Science at VIT Chennai and contributes to open source." },
];

export function resumeAnswer(prompt) {
  const topic = resumeTopics.find(item => item.pattern.test(prompt));
  return topic ? topic.answer : "The résumé doesn’t contain enough detail to answer that. Try asking about Upliance.ai, backend performance, projects, skills, or education. For more specifics, contact Vikram at vikramandanshu@gmail.com.";
}
