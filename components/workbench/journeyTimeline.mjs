export const START = 2; // March 2021
export const END = 70; // November 2026
export const CHAPTERS = [
  { at: 2, label: 'College', date: '2021–2025', title: 'A laptop. A notebook. A beginning.', description: 'Computer Science at VIT Chennai. Learning, building, and finding my way.' },
  { at: 48, label: 'Cribble', date: 'JAN–MAR 2025', title: 'Building for a community.', description: 'My first internship chapter: community software, React, and Firebase. College continues alongside it.' },
  { at: 50, label: 'Office Solutions', date: 'MAR–JUN 2025', title: 'Looking beneath the interface.', description: 'Backend work, report benchmarking, and the systems that make software reliable.' },
  { at: 56, label: 'Graduation', date: 'SEP 2025', title: 'One chapter completed.', description: 'A B.Tech in Computer Science, and a desk full of things learned along the way.' },
  { at: 60, label: 'upliance', date: '2026–PRESENT', title: 'From building features to shaping products.', description: 'AI Product Engineer at upliance. Product decisions, connected experiences, and implementation ownership.' },
];
export const DETAILS = {
  notebook: { title: 'The college notebook', meta: 'VIT CHENNAI · MAR 2021–SEP 2025', paragraphs: ['B.Tech in Computer Science at Vellore Institute of Technology, Chennai.', 'The starting point for a growing interest in software, systems, and building things people can use.'], later: ['Graduated with a CGPA of 8.42/10. First on campus among 50+ teams at Google Hash Code.'] },
  computer: { title: 'Things I built', meta: 'LEARNING THROUGH PROJECTS', paragraphs: ['This desk began with learning the fundamentals of computer science and exploring software development.'], portfolio: 'Personal portfolio · May 2022–present. An ongoing exploration of the web, from interfaces and authentication to the interactive room you are in now.', crawler: 'Go Web Crawler & Search Index · April–June 2025. Fetches webpages, extracts text and keyword frequency, and stores results in MongoDB Atlas.' },
  cribble: { title: 'Cribble Org', meta: 'SWE INTERN · JAN–MAR 2025', paragraphs: ['Worked on a Telegram MiniApp for a community of 3,000+ members.', 'Implemented Winston logging with 50+ global and component logs. Maintained and optimized Firestore deployments on Google Cloud.'], stack: 'React · Firebase · GCP · Winston' },
  office: { title: 'Office Solutions', meta: 'BACKEND TRAINEE · MAR–JUN 2025', paragraphs: ['Refactored and delivered a Java/Spring Boot Power BI report benchmarking application in three weeks.', 'Integrated the Microsoft embedding workflow through a small Node.js server. Used Selenium automation, multithreading, Cucumber, and 50+ JUnit tests.', 'Simplified database relationships and queries for a reported 50% performance improvement; implemented Redis rate limiting.'], stack: 'Java · Spring Boot · Node.js · Power BI · Redis' },
  github: { title: 'Building in the open', meta: 'CODE & PROJECTS', paragraphs: ['Explore my repositories and the work behind this portfolio. This object represents the coding chapter; its appearance is not an account creation date.'], href: 'https://github.com/vikramsingh117', link: 'Visit GitHub' },
  leetcode: { title: 'Working through problems', meta: 'PROBLEM SOLVING', paragraphs: ['A place for working through coding problems and practicing algorithms. Visit my profile for the current activity.'], href: 'https://leetcode.com/u/vikramandanshu/', link: 'Visit LeetCode' },
  diploma: { title: 'Graduation', meta: 'VIT CHENNAI · SEPTEMBER 2025', paragraphs: ['B.Tech in Computer Science · 2021–2025.', 'CGPA: 8.42/10. The internship chapters began during my final year, before graduation.'] },
  upliance: { title: 'upliance.ai', meta: 'AI PRODUCT ENGINEER · JAN 2026–PRESENT', paragraphs: ['I help shape product behavior and implement it across the upliance touchscreen, mobile experience, and internal AI tools.', 'Touchscreen: ADK chatbot integration, diet and allergen preferences, recipe category ordering, and scroll restoration.', 'Mobile: device-aware recipe discovery, recipe generation in chat, archived conversations, and streamed AI responses.', 'Internal tools: chatbot-session inspection, recipe-generation timing, and resource-document synchronization interfaces.'], stack: 'React · TypeScript · GraphQL · Redux · SSE' },
  notes: { title: 'How I work now', meta: 'PRODUCT THINKING + ENGINEERING', paragraphs: ['Start with what the person should be able to do next.', 'Make state and edge cases explicit, from saved preferences to archived chats.', 'Build the tools that make AI systems easier to understand, operate, and improve.'] },
};
export function chapterAt(month) { return CHAPTERS.reduce((found, chapter) => month >= chapter.at ? chapter : found, CHAPTERS[0]); }
export function seasonAt(month) { const m = month % 12; return m < 2 || m === 11 ? 'Winter' : m < 5 ? 'Spring' : m < 9 ? 'Monsoon' : 'Autumn'; }
export function dateLabel(month) { return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month % 12]} ${2021 + Math.floor(month / 12)}`; }
export const OBJECTS = [
  { id: 'notebook', label: 'College notebook', at: START, box: [141, 153, 47, 23] },
  { id: 'computer', label: 'Computer · projects', at: START, box: [215, 91, 93, 82] },
  { id: 'cribble', label: 'Cribble internship', at: 48, box: [318, 135, 20, 24] },
  { id: 'office', label: 'Office Solutions internship', at: 50, box: [344, 135, 20, 24] },
  { id: 'github', label: 'GitHub', at: 48, box: [318, 108, 20, 20] },
  { id: 'leetcode', label: 'LeetCode', at: 48, box: [344, 108, 20, 20] },
  { id: 'upliance', label: 'upliance · my work', at: 60, box: [389, 123, 51, 63] },
  { id: 'radio', label: 'Radio · toggle music', at: 60, box: [99, 146, 44, 20] },
  { id: 'ceiling', label: 'Ceiling light · toggle', at: 60, box: [388, 20, 51, 20] },
  { id: 'notes', label: 'Sticky notes · how I work', at: 60, box: [312, 33, 40, 25] },
];
export function objectsAt(month) { return OBJECTS.filter(object => month >= object.at); }
