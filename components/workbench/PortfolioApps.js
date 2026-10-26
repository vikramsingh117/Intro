import { contributions } from '../../lib/contributions';
import styles from '../../styles/Workbench.module.css';

export const PROFILE_LINKS = [
  {title:'GitHub',icon:'GH',href:'https://github.com/vikramsingh117'},
  {title:'LinkedIn',icon:'in',href:'https://www.linkedin.com/in/vikram-singh-9b48a4220'},
  {title:'LeetCode',icon:'</>',href:'https://leetcode.com/u/vikramandanshu/'},
];
function ExternalLink({href,children}) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗<span className={styles.screenReaderOnly}> (opens in a new tab)</span></a>;
}
function Work() {
  return <div className={styles.portfolioApp}>
    <p className={styles.eyebrow}>EXPERIENCE / PRODUCT & ENGINEERING</p>
    <h2>From product decisions to working software.</h2>
    <p>I work across the experience people see and the systems that make it reliable.</p>
    <article>
      <small>JAN 2026 — PRESENT · AI PRODUCT ENGINEER</small>
      <h3>Upliance.ai</h3>
      <p>Connected cooking experiences across appliance touchscreens, companion apps, and internal operations tools. I helped shape product behavior and implemented features in an existing production ecosystem.</p>
      <h4>Frodo Cook Club · appliance touchscreen</h4>
      <ul><li>Integrated an ADK chatbot backend, including compatibility handling.</li><li>Built diet and allergen settings with GraphQL, including pruning incompatible allergens when diets change and distinguishing unset preferences from saved selections.</li><li>Improved dynamic category ordering and restored recipe-list scroll positions after navigation.</li></ul>
      <p className={styles.appStack}>React · TypeScript · Redux · GraphQL · Android WebView integration</p>
      <h4>Frodo companion app · recipe discovery & chat</h4>
      <ul><li>Device-aware recipe discovery, including filtering My Creations for the selected appliance.</li><li>Air-fryer recipe sorting and social tags, plus allergen and dislike preferences.</li><li>Backend-driven recipe generation in chat, view-only archived sessions, and streamed AI responses.</li><li>Scroll restoration, a What’s New drawer, and mobile UI improvements.</li></ul>
      <p className={styles.appStack}>React · Vite · Apollo Client · Redux Toolkit · SSE · PWA / WebViews</p>
      <h4>Frodo Recipe Admin · AI operations</h4>
      <ul><li>Built a chatbot-session viewer with pagination, user enrichment, and recipe results embedded in messages.</li><li>Added recipe-generation timing interfaces and a resource-document synchronization workflow.</li><li>Integrated separate backend services while handling inconsistent message formats and shared asynchronous state.</li></ul>
      <p className={styles.appStack}>React · TypeScript · Material UI · Apollo Client · Hasura GraphQL</p>
      <h4>Real-time systems & infrastructure</h4>
      <p>Voice onboarding with WebSockets, backend maintenance for a platform serving 4,000+ daily active customers, GCP SQL triggers, and centralized SSH access with device-specific policies.</p>
    </article>
    <article><small>MAR — JUN 2025 · BACKEND TRAINEE</small><h3>Office Solutions</h3>
      <ul><li>Delivered a Java/Spring Boot Power BI report benchmarking tool in three weeks, measuring report loading time.</li><li>Integrated a small Node.js server for Microsoft Power BI embedding APIs and used Selenium to automate the browser workflow.</li><li>Used multithreading in Spring Boot, Cucumber for BDD, and JUnit for testing.</li><li>Simplified database relationships and removed unnecessary queries for a 50% performance improvement.</li><li>Wrote 50+ Cucumber and JUnit tests and implemented Redis rate limiting.</li></ul>
      <p className={styles.appStack}>Java · Spring Boot · Node.js · Power BI · Selenium · Redis · Azure · Cucumber · JUnit</p>
    </article>
    <article><small>JAN — MAR 2025 · SWE INTERN</small><h3>Cribble Org</h3>
      <ul><li>Worked on a Telegram MiniApp for a community of 3,000+ members.</li><li>Implemented 50+ global and component-level Winston logs.</li><li>Maintained and optimized Firestore deployments on Google Cloud.</li></ul>
      <p className={styles.appStack}>React · Firebase · Firestore · GCP · Winston</p>
    </article>
  </div>;
}
function Projects() {
  return <div className={styles.portfolioApp}>
    <p className={styles.eyebrow}>PERSONAL PROJECTS / OPEN SOURCE</p><h2>Things I’ve built and contributed to.</h2>
    <article><small>APR — JUN 2025</small><h3>Go Web Crawler & Search Index</h3>
      <p>A service that fetches live webpages, extracts text, measures keyword frequency, and stores crawl results in MongoDB Atlas for inspection.</p>
      <ul><li>Go and net/http for fetching, with GoQuery for parsing HTML.</li><li>Support for Gzip, Brotli, and Deflate responses.</li><li>A responsive interface and environment-based database configuration.</li></ul>
      <p className={styles.appStack}>Go · GoQuery · MongoDB Atlas · HTML / CSS</p>
      <ExternalLink href="https://go-web-crawler.onrender.com/">Open the crawler</ExternalLink>
    </article>
    <article><small>2022 — PRESENT</small><h3>Personal portfolio</h3>
      <p>An evolving serverless portfolio exploring CDN caching, authentication, AI assistance, and interactive experiences.</p>
      <ul><li>A résumé-grounded assistant with streamed responses.</li><li>Readable portfolio pages alongside this cozy 3D workspace.</li><li>An interactive monitor, persistent notebook, city scene, and a simulated terminal.</li></ul>
      <p className={styles.appStack}>Next.js · React · Three.js · Redis · Docker · JWT</p>
      <ExternalLink href="https://github.com/vikramsingh117/Intro">View portfolio source</ExternalLink>
    </article>
    <article><small>SELECTED PULL REQUESTS</small><h3>Open-source work</h3>
      <ul className={styles.contributionLinks}>{contributions.map(item=><li key={item.url}><ExternalLink href={item.url}>{item.project}</ExternalLink><p>{item.title}</p></li>)}</ul>
    </article>
  </div>;
}
function About() {
  return <div className={styles.portfolioApp}>
    <p className={styles.eyebrow}>MUMBAI, INDIA / AI PRODUCT ENGINEER</p><h2>Hi, I’m Vikram Singh.</h2>
    <p>I help decide what an AI product should do, then build the experience and integrations that make it work. My work spans product behavior, user interfaces, real-time AI, and backend systems.</p>
    <p>At Upliance.ai, that includes cooking assistants, recipe discovery, dietary preferences, and tools that help teams understand AI sessions and operations.</p>
    <article><small>HOW I WORK</small><h3>Product thinking, with implementation ownership.</h3>
      <ul><li>Ask what the user should be able to do next.</li><li>Make state and edge cases explicit—from saved preferences to archived chats.</li><li>Build the tools that make systems easier to understand and support.</li></ul>
    </article>
    <article><small>TOOLBOX</small><h3>Across the stack</h3>
      <p>Java · TypeScript · JavaScript · Python · SQL · Bash · Go</p>
      <p>React · GraphQL · Spring Boot · Redis · MongoDB · MySQL · Docker · Linux · GCP · Azure · Firebase</p>
    </article>
    <article><small>EDUCATION</small><h3>VIT Chennai</h3><p>B.Tech in Computer Science · 2021–2025 · CGPA 8.42/10.</p><p>First on campus among 50+ teams at Google Hash Code.</p></article>
    <article><small>FIND ME ONLINE</small><h3>Let’s connect.</h3><div className={styles.profileLinks}>{PROFILE_LINKS.map(link=><ExternalLink key={link.title} href={link.href}>{link.title}</ExternalLink>)}<a href="mailto:vikramandanshu@gmail.com">Email me ↗</a></div></article>
  </div>;
}
export default function PortfolioApps({ title }) {
  return title==='My Work'?<Work/>:title==='Projects'?<Projects/>:<About/>;
}
