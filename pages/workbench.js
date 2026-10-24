import Head from 'next/head';
import ProductWorkbench from '../components/workbench/ProductWorkbench';
import styles from '../styles/Workbench.module.css';

export default function AfterHoursWorkspace() {
  return <main className={`${styles.page} ${styles.roomPage}`} data-cursor-theme="glossy">
    <Head>
      <title>Vikram Singh — After Hours</title>
      <meta name="description" content="Explore Vikram Singh’s cozy interactive workspace: AI engineering, product decisions, and projects." />
      <meta name="theme-color" content="#10181c" />
    </Head>
    <ProductWorkbench />
  </main>;
}
