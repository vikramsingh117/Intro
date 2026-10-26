import Head from 'next/head';
import Link from 'next/link';

export default function Privacy(){
  return <main style={{maxWidth:720,margin:'0 auto',padding:'48px 24px',lineHeight:1.8}}>
    <Head><title>Privacy - Vikram Singh</title></Head>
    <Link href="/"><a>← Home</a></Link>
    <h1>Privacy</h1>
    <p>This portfolio records your IP address, approximate country/state, visits, pages viewed, and interactions with controls on Simple and After Hours. This helps me understand how the portfolio is used.</p>
    <p>These records are stored in my MongoDB database. An IP address can be shared by several people or change over time; location estimates can be inaccurate. For visits identified as being from India, I receive an ntfy notification naming the state when available. Your IP and interaction history are not included in that notification.</p>
    <p>Interaction analytics do not record typed messages, terminal commands, note contents, or photo contents. Photos and wall notes that you explicitly share are public and stored separately. New photo uploads send me a notification linking to the photo. Camera access starts only when you request it.</p>
    <p>Visit records currently have no automatic deletion schedule. For questions or a deletion request, contact <a href="mailto:vikramandanshu@gmail.com">vikramandanshu@gmail.com</a>. Avoid sending additional personal information until we establish what is needed to locate a record.</p>
  </main>;
}
