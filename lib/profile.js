import { contributions } from "./contributions";

export const profile = `Vikram Singh
AI Product Engineer, Mumbai, Maharashtra, India.
Email: vikramandanshu@gmail.com
LinkedIn: https://www.linkedin.com/in/vikram-singh-9b48a4220
GitHub: https://github.com/vikramsingh117
LeetCode: https://leetcode.com/u/vikramandanshu/

WORK EXPERIENCE
Upliance.ai — AI Product Engineer, January 2026–present.
His role includes product decisions and ownership alongside engineering implementation; voice is one part of his work, not his whole role.
He confirmed he helped decide the product behavior in the following contributions, within existing production applications.
Frodo Cook Club: React and TypeScript touchscreen UI in an Android WebView; native Bluetooth belongs to the Android wrapper. Integrated an ADK chatbot backend with compatibility handling, GraphQL diet/allergen preferences, dynamic recipe category ordering, and scroll restoration. Handled incompatible allergen pruning when diet changes and distinguished unset preferences from saved selections.
Frodo companion app: React 19, TypeScript, Vite, Redux Toolkit, Apollo/Hasura GraphQL, WebSockets and HTTP streaming/SSE, available as a PWA and in iOS/Android WebViews. This is React web development, not React Native. Contributions: device-aware My Creations recipe filtering, air-fryer tags and sorting, backend-driven Generate recipe chat action, read-only archived chats, allergen/dislike preferences, scroll restoration, What's New drawer and mobile refinements.
Frodo Recipe Admin: React, TypeScript, MUI and Apollo/Hasura. Built a Redis chatbot-session viewer with pagination, user enrichment and embedded recipe results, a recipe-generation timing dashboard, and resource-document synchronization UI. Handled inconsistent message formats and asynchronous shared state. These contributions were frontend/API integration; the Redis and synchronization backends were separate services. Do not claim he built those backends.
Product examples include context-aware recipe discovery, consistent preference behavior, preserving navigation context, appropriate chat actions and making AI operations inspectable. No measured impact is provided for these individual features.
Collaborated with the product team on an Airfryer app revamp, integrating Server-Sent Events for real-time LLM updates.
Built voice-enabled onboarding with WebSockets.
Manages and maintains the Upliance app backend for an AI platform serving over 4,000 daily active customers.
Built a centralized VPS for SSH access and device-specific policy management.
Deployed 10+ GCP triggers, each containing over 100 lines of SQL code.

Office Solutions — Backend Trainee, March–June 2025.
Refactored and delivered a Java/Spring Boot Power BI report benchmarking tool to the client in three weeks. It measured report loading time to help assess report performance and complexity.
Integrated a small Node.js server with the Java application for the Microsoft embedding integration used in the project. The browser embedded Power BI reports in iframes and used Microsoft's supported JavaScript APIs to interact with reports and measure loading time. Selenium automated the browser workflow around the embedded reports. Used multithreading in Spring Boot, Cucumber for behavior-driven development, and JUnit for testing; wrote 50+ tests.
Technical wording: direct cross-origin iframe DOM access is restricted by the same-origin policy. Do not describe the integration as bypassing CORS, Selenium creating Node iframes, or all Power BI APIs being Node-only. The Node integration was a choice/requirement of this project's integration; the embedding client API runs in JavaScript/TypeScript. Do not invent the exact SDK version, event names, complexity formula, or thread-pool design without repository evidence.
Simplified entity relationships and removed unnecessary queries for a 50% performance improvement.
Implemented Redis rate limiting. Stack: Java, Spring Boot, Node.js, Microsoft Power BI embedding APIs, Selenium, Cucumber, JUnit, Redis, Azure.

Cribble Org — SWE Intern, January–March 2025.
Implemented Winston logging with 50+ global and component logs.
Maintained and optimized Firestore deployments on Google Cloud.
Worked on a Telegram MiniApp for a community of 3,000+ members.
Stack: React, Firebase, GCP.

PROJECTS
Personal Portfolio — May 2022–present.
A deployed, CDN-cached serverless application maintained for over four years, exploring SEO, global state management, authentication, and AI.
Current portfolio: Next.js, React, Three.js/React Three Fiber and CSS Modules; a readable Simple page and an interactive cozy After Hours room. Includes a physical monitor desktop with work/projects/social links, a simulated Linux terminal with sudo and app snapshots, Task Manager, a shared camera-enabled Photos gallery with a retro scanline filter, and the shared AI assistant; toggleable desk/ceiling lights, persistent page-turning notebook, night city window view, aircraft flyby, a radio playing user-supplied music, animated drawer/glasses, and shared MongoDB sticky notes. Decorative props include a plant, Pascal soft toy and a simplified upliance appliance on a stool. Supports touch gestures, mobile monitor layouts, SMAA scene antialiasing and a separately smoothed HTML monitor perimeter. Clicking the upliance display reveals work-specific pages. Home entry zooms/fades into the room and fades radio volume to 0.28 over 11 seconds after the entry gesture. Server-side MongoDB analytics store IP-based visits, interactions and estimated duration; ntfy alerts cover new photos, India landings and newly shared note messages. Historical project experience includes Docker, Redis and JWT; these are not current runtime dependencies.
Portfolio source: https://github.com/vikramsingh117/Intro

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

const uplianceAnswer = "At Upliance.ai, Vikram works as an AI Product Engineer, helping shape product behavior and implementing it. His work spans appliance touchscreen software, the Frodo companion app, and internal AI operations tools.\n\nHe integrated an ADK chatbot, built diet/allergen preferences and device-aware recipe discovery, preserved scroll positions, and added chat actions and read-only archived sessions. In Recipe Admin he built session inspection, recipe-generation timing, and resource-sync interfaces. The admin work was frontend/API integration with separate backend services.\n\nThe apps use React and TypeScript with GraphQL and shared state management; mobile wrappers use WebViews, not React Native. Voice onboarding and backend infrastructure are additional parts of his role.";
const officeAnswer = "At Office Solutions, Vikram worked on a Java/Spring Boot benchmarking tool that measured how long Power BI reports took to load. He refactored and delivered it to the client in three weeks.\n\nThe application integrated a small Node.js server for its Microsoft embedding workflow. Reports were embedded in a browser, and supported Power BI JavaScript APIs enabled interaction and load-time measurement across the iframe boundary. Selenium automated the browser workflow, and the Spring Boot application used multithreading.\n\nHe used Cucumber for BDD and JUnit for testing, writing 50+ tests. He also simplified database relationships and removed unnecessary queries for a 50% performance improvement, and implemented Redis rate limiting.";
const websiteAnswer = "This portfolio uses Next.js Pages Router, React and CSS Modules. Simple is the readable portfolio; After Hours is a cozy Three.js/React Three Fiber room. Its monitor has work, projects, social links, a simulated Linux terminal, Task Manager, a shared Photos gallery with a retro camera filter, and an AI Assistant app. You can toggle the lamp and radio, turn notebook pages and look through the window at a night city and passing aircraft. A drawer holds wearable blur glasses, and visitors can write and place shared notes stored in MongoDB. The plant sits left of the desk, Pascal beside the lamp, and an optimized upliance model rests on a stool to the right; clicking it opens his upliance work on its own screen.\n\nSimple loads first, then After Hours preloads models and textures. The home card fills with completed-asset progress; there is no loading or ready popup. The illustrated preview matches the room. Touch gestures and mobile layouts are supported. Home entry zooms through black into the room and fades in radio music over 11 seconds. SMAA smooths scene edges. Browser Back exits a focused room view first. Visit counts, interactions and duration are stored in MongoDB, with ntfy notifications for India visits, photos and new sticky notes.\n\nThe assistant streams replies from /api/about using Gemini plus curated résumé and repository text. Keys stay server-side. It has no live repo, bucket or vector-search access; the terminal cannot access real files or execute real shell commands.";

export const resumeTopics = [
  { pattern: /power\s*bi|office|benchmark|selenium|cucumber|junit|multithread|iframe/i, answer: officeAnswer },
  { pattern: /upliance|frodo|cook.club|allergen|diet|recipe|adk|webview|react.native|resource.*sync|session.*viewer/i, answer: uplianceAnswer },
  { pattern: /trigger|gcp.*sql|sql.*gcp/i, answer: "At Upliance.ai, Vikram deployed 10+ GCP triggers, each containing over 100 lines of SQL code." },
  { pattern: /open.source|kestra|mcp.?jam|anthropic|claude|contribution|pull.request/i, answer: `Vikram's open-source work (statuses supplied by him, not live-synced):\n\n${contributions.map(item => `${item.project}: ${item.title} — ${item.status}.\n${item.url}`).join("\n\n")}\n\nA separate Kestra schema fix was closed, not merged. The Claude Agent SDK PR remains proposed work, not an accepted upstream feature.` },
  { pattern: /website|repo|source.code|chatbot|assistant|stream|master.prompt|system.prompt|next\.js|css|react|bucket|embedding|signal.room|after.hours|radio|notebook|terminal|monitor|preload|3d|ntfy|notification|visitor|analytics|duration|photos|sticky/i, answer: websiteAnswer },
  { pattern: /product|ownership|decision/i, answer: uplianceAnswer },
  { pattern: /voice|real.time|websocket|\bsse\b|current|ai experience|ai engineer/i, answer: uplianceAnswer },
  { pattern: /power\s*bi|office|benchmark|selenium|cucumber|junit|multithread|iframe|performance|50%|test|redis|backend/i, answer: officeAnswer },
  { pattern: /project|search|crawler|portfolio|built|build/i, answer: "Go Web Crawler & Search Index (April–June 2025): fetches live webpages with Go and net/http, parses HTML with GoQuery, measures keyword frequency, and stores crawl results in MongoDB Atlas. It handles Gzip, Brotli, and Deflate responses, with a responsive HTML/CSS interface and environment-based database configuration.\n\nPersonal portfolio (2022–present): a serverless Next.js application maintained for four years, exploring CDN caching, SEO, authentication, Redis, Docker, and AI." },
  { pattern: /cribble|telegram|community|firebase|logging/i, answer: "At Cribble Org (January–March 2025), Vikram worked on a Telegram MiniApp for a community of 3,000+ members. He implemented 50+ Winston logs and maintained and optimized Firestore deployments on Google Cloud. The stack included React, Firebase, and GCP." },
  { pattern: /education|college|vit|degree|cgpa|hash|open.source|kestra|mcpjam|achievement/i, answer: "Vikram earned a B.Tech in Computer Science at VIT Chennai (2021–2025), with a CGPA of 8.42/10. He placed first on campus among 50+ teams at Google Hash Code and has contributed to Kestra and MCPJam." },
  { pattern: /contact|email|reach|hire|available|availability|salary/i, answer: "You can reach Vikram at vikramandanshu@gmail.com or find his work at github.com/vikramsingh117. He is based in Mumbai. His résumé doesn’t state availability or compensation expectations, so it’s best to ask him directly." },
  { pattern: /skill|stack|language|tool|technolog/i, answer: "Vikram works with Java, JavaScript, TypeScript, Python, SQL, and Bash. His infrastructure and data toolkit includes Redis, MongoDB, MySQL, Docker, Linux, GCP, Azure, Firebase, and Git.\n\nHis work spans real-time communication with SSE and WebSockets, Spring Boot backends, React apps, and Go-based crawling." },
  { pattern: /who|introduc|experience|about|summary|fit|strength/i, answer: "Vikram is an AI Product Engineer based in Mumbai, currently at Upliance.ai. He helps make product decisions and builds AI integrations, user experiences and operational tools across connected cooking products.\n\nBefore Upliance, he improved backend performance at Office Solutions and worked on community software at Cribble Org. He studied Computer Science at VIT Chennai and contributes to open source." },
];

export function resumeAnswer(prompt) {
  const topic = resumeTopics.find(item => item.pattern.test(prompt));
  return topic ? topic.answer : "The résumé doesn’t contain enough detail to answer that. Try asking about Upliance.ai, backend performance, projects, skills, or education. For more specifics, contact Vikram at vikramandanshu@gmail.com.";
}
