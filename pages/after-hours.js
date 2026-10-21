import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AboutChat from "../components/AboutChat";
import AssistantJourney from "../components/AssistantJourney";
import Contributions from "../components/Contributions";
import styles from "../styles/AfterHours.module.css";

const scenes = [
  { id:"voice", label:"01 / CONVERSATION", title:<>Voice in.<br/>Intelligence out.</>, company:"UPLIANCE.AI · AI PRODUCT ENGINEER · 2026 — PRESENT", copy:"Product decisions, real-time interactions, and ownership beyond launch.", detail:"Helped revamp the Airfryer app with SSE-powered LLM updates and built voice onboarding using WebSockets.", metric:"Real time", caption:"VOICE → MODEL → RESPONSE" },
  { id:"scale", label:"02 / SCALE", title:<>Small signals.<br/>Real people.</>, company:"UPLIANCE.AI · BACKEND & INFRASTRUCTURE", copy:"Maintaining the backend behind everyday AI experiences.", detail:"An AI platform serving 4,000+ daily active customers. Deployed 10+ GCP triggers, each containing over 100 lines of SQL code, and built a centralized VPS for SSH access and device-specific policies.", metric:"4,000+", caption:"DAILY ACTIVE CUSTOMERS" },
  { id:"craft", label:"03 / CRAFT", title:<>Less friction.<br/>More flow.</>, company:"OFFICE SOLUTIONS · BACKEND TRAINEE · MAR — JUN 2025", copy:"Simpler database relationships. Fewer redundant queries.", detail:"A 50% performance improvement. Delivered a benchmarking tool in three weeks, wrote 50+ tests with Cucumber and JUnit, and implemented Redis rate limiting.", metric:"50%", caption:"PERFORMANCE IMPROVEMENT" },
  { id:"open", label:"04 / OPEN SOURCE", title:<>Built with<br/>others.</>, company:"KESTRA / MCPJAM / CLAUDE AGENT SDK", copy:"From interface polish to agent message types.", detail:"Merged i18n cleanup in Kestra and Tools-tab hover styling in MCPJam Inspector. An open Claude Agent SDK for Python PR adds message timestamps and transcript parsing. Statuses supplied by Vikram, not live-synced. A separate Kestra schema fix was closed, not merged.", metric:"Shared", caption:"IDEAS → CONTRIBUTIONS → COMMUNITY" },
];

function Signal({ active }) {
  return <div className={styles.instrument} data-scene={active} aria-hidden="true">
    <div className={styles.instrumentHead}><span>VS / SIGNAL ENGINE</span><span>ILLUSTRATIVE</span></div>
    <svg viewBox="0 0 600 440" className={styles.diagram}>
      <defs><radialGradient id="signal-halo"><stop stopColor="#8fdcc1" stopOpacity=".2"/><stop offset="1" stopColor="#8fdcc1" stopOpacity="0"/></radialGradient></defs>
      <circle cx="300" cy="220" r="210" fill="url(#signal-halo)"/>
      <g className={styles.rings} fill="none" stroke="currentColor"><circle cx="300" cy="220" r="150"/><ellipse cx="300" cy="220" rx="210" ry="90"/><ellipse cx="300" cy="220" rx="90" ry="190"/></g>
      <g className={styles.wave} stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        {Array.from({length:35},(_,i)=><line key={i} x1={62+i*14} x2={62+i*14} y1={220-(12+Math.sin(i*1.7)**2*72)} y2={220+(12+Math.sin(i*1.7)**2*72)} style={{"--i":i}}/>)}
      </g>
      <g className={styles.network}>{Array.from({length:24},(_,i)=>{
        const angle=i*Math.PI*2/24, x=300+Math.cos(angle)*(i%2?180:125), y=220+Math.sin(angle)*(i%2?160:100);
        return <g key={i} style={{"--i":i}}><path d={`M300 220L${x} ${y}`} stroke="currentColor" strokeOpacity=".25"/><circle cx={x} cy={y} r={i%3?4:7} fill="currentColor"/></g>;
      })}</g>
      <g className={styles.routes} fill="none" stroke="currentColor" strokeWidth="2"><path className={styles.oldRoute} d="M60 300L170 100L240 340L350 90L440 310L540 150"/><path className={styles.fastRoute} d="M60 220H540"/><circle className={styles.packet} cx="60" cy="220" r="7" fill="currentColor"/></g>
      <g className={styles.branches} fill="none" stroke="currentColor" strokeWidth="2"><path d="M70 220H530M150 220C240 220 210 100 300 100H440M150 220C240 220 210 340 300 340H440"/>{[[150,220],[300,100],[440,100],[300,340],[440,340],[530,220]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r="8" fill="#0c171f"/>)}</g>
      <circle className={styles.core} cx="300" cy="220" r="9" fill="currentColor"/>
    </svg>
    <div className={styles.readout} key={active}><strong>{scenes[active].metric}</strong><span>{scenes[active].caption}</span></div>
    <div className={styles.instrumentFoot}><span>INPUT</span><i/><span>IMPACT</span></div>
  </div>;
}

export default function AfterHours() {
  const page=useRef(null);
  const [active,setActive]=useState(0);
  const [calm,setCalm]=useState(false);
  const [journey,setJourney]=useState(false);
  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const update=()=>setCalm(media.matches); update();
    media.addEventListener("change",update);
    return()=>media.removeEventListener("change",update);
  },[]);
  useEffect(()=>{
    const node=page.current, sections=[...node.querySelectorAll("[data-scene-index]")];
    let frame=0;
    const update=()=>{
      frame=0;
      let nearest=0, distance=Infinity;
      sections.forEach((section,i)=>{
        const box=section.getBoundingClientRect(), delta=Math.abs(box.top+box.height/2-window.innerHeight*.52);
        if(delta<distance){distance=delta;nearest=i;}
      });
      setActive(nearest);
      const bounds=node.getBoundingClientRect();
      node.style.setProperty("--progress",Math.max(0,Math.min(1,-bounds.top/Math.max(1,bounds.height-window.innerHeight))));
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update(); window.addEventListener("scroll",schedule,{passive:true}); window.addEventListener("resize",schedule);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);};
  },[]);
  return <main ref={page} className={styles.page} data-calm={calm} data-cursor-theme="glossy">
    <Head><title>Vikram Singh — After Hours</title><meta name="description" content="AI Product Engineer in Mumbai. Product decisions, real-time AI, and ownership of systems serving 4,000+ daily customers."/><meta name="theme-color" content="#080f17"/></Head>
    <div className={styles.edgeTop} aria-hidden="true"/><div className={styles.edgeBottom} aria-hidden="true"/>
    <div className={styles.controls}><Link href="/"><a>VS / AFTER HOURS ↗</a></Link><button aria-pressed={calm} onClick={()=>setCalm(!calm)}>{calm?"Motion off":"Reduce motion"}</button><Link href="/simple"><a>Simple ↗</a></Link></div>
    <div className={styles.progress} aria-hidden="true"/>
    <section className={styles.hero} id="top">
      <div className={styles.heroCopy}><p className={styles.eyebrow}><span className={styles.dot}/> AI PRODUCT ENGINEER / MUMBAI, INDIA</p><h1>Vikram<br/><em>Singh.</em></h1><p className={styles.statement}>Product decisions. Engineering.<br/>Ownership beyond launch.</p><p className={styles.credit}>OPEN SOURCE <a href="https://github.com/kestra-io/kestra">Kestra ↗</a><a href="https://github.com/MCPJam">MCP-Jam ↗</a></p><a className={styles.scrollLink} href="#voice">Follow the signal <span>↓</span></a></div>
      <div className={styles.assistant}><div className={styles.assistantLabel}><span>THE LIVE DEMO</span><button aria-expanded={journey} aria-controls="after-hours-journey" onClick={()=>setJourney(!journey)}>{journey?"Back to conversation ↗":"How it works ↗"}</button></div><div hidden={journey}><AboutChat theme="dark"/></div><div id="after-hours-journey" hidden={!journey}>{journey&&<AssistantJourney theme="dark"/>}</div><p className={styles.micro}>A real conversation. Streamed, not scripted.</p></div>
    </section>
    <div className={styles.story}>
      <div className={styles.stage}><Signal active={active}/><nav className={styles.sceneNav} aria-label="Story chapters">{scenes.map((scene,i)=><a key={scene.id} href={`#${scene.id}`} aria-current={active===i?"step":undefined}><span>0{i+1}</span>{scene.id}</a>)}</nav></div>
      <div className={styles.chapters}>{scenes.map((scene,i)=><section id={scene.id} data-scene-index={i} data-active={active===i} className={styles.chapter} key={scene.id}><p className={styles.eyebrow}>{scene.label}</p><h2>{scene.title}</h2><p className={styles.body}>{scene.copy}</p><p className={styles.company}>{scene.company}</p><details><summary>Behind the signal <span>+</span></summary><p>{scene.detail}</p></details>{scene.id==="open"&&<Contributions/>}</section>)}</div>
    </div>
    <section className={styles.projects}><p className={styles.eyebrow}>05 / INDEPENDENT EXPLORATIONS</p><h2>Curiosity,<br/><em>compiled.</em></h2>
      <div className={styles.projectGrid}>
        <article><span className={styles.projectIndex}>01 / GO · MONGODB ATLAS · GOQUERY</span><div className={styles.crawler} aria-hidden="true"><span>crawl</span><i>→</i><span>parse</span><i>→</i><span>index</span></div><h3>Raw pages. Structured observations.</h3><p>A Go web crawler that extracts text, measures keyword frequency, and stores crawl results in MongoDB Atlas.</p><details><summary>Under the hood +</summary><p>Go and net/http for fetching; GoQuery for HTML parsing; Gzip, Brotli, and Deflate response handling. A responsive HTML/CSS interface supports inspection, with environment-based database configuration. April–June 2025.</p></details></article>
        <article><span className={styles.projectIndex}>02 / NEXT.JS · REACT · SSE</span><div className={styles.stream} aria-hidden="true">{["data: {",'"type": "delta",','"text": "Hello."',"}"].map((text,i)=><span key={text} style={{"--i":i}}>{text}</span>)}</div><h3>The portfolio is the demo.</h3><p>Two experiences. One streaming assistant.</p><details><summary>Under the hood +</summary><p>Next.js Pages Router, CSS Modules, embedded résumé and repository context, server-side Gemini streaming, validation, request limits and fallback answers.</p></details></article>
      </div><div className={styles.education}><span>VIT CHENNAI / B.TECH COMPUTER SCIENCE</span><span>8.42 / 10 CGPA</span><span>1ST ON CAMPUS / GOOGLE HASH CODE / 50+ TEAMS</span></div>
    </section>
    <footer className={styles.contact}><span className={styles.dot}/><p className={styles.eyebrow}>06 / NEXT SIGNAL</p><h2>What are<br/>you <em>building?</em></h2><a className={styles.contactLink} href="mailto:vikramandanshu@gmail.com">Let’s talk ↗</a><div className={styles.footerLinks}><a href="https://github.com/vikramsingh117">GitHub ↗</a><a href="#top">Back to the signal ↑</a><Link href="/simple"><a>The simple version ↗</a></Link></div><p className={styles.micro}>VIKRAM SINGH / MUMBAI / AFTER HOURS</p></footer>
  </main>;
}
