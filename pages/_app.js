// Composes every page with route transitions, After Hours preloading, cursor theming, and privacy-aware analytics.
// Global styles and the pixel mascot font are initialized once here so individual routes share consistent presentation.
import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import AfterHoursPreload from '../components/AfterHoursPreload';
import AfterHoursTransition from '../components/AfterHoursTransition';
import VisitorAnalytics from '../components/VisitorAnalytics';
import ThemeCursor from '../components/ThemeCursor';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head><link key="mascot-font" rel="preload" href="/fonts/press-start-2p/PressStart2P-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" /></Head>
      <AfterHoursPreload><AfterHoursTransition><Component {...pageProps} /></AfterHoursTransition></AfterHoursPreload>
      <ThemeCursor />
      <Analytics />
      <VisitorAnalytics />
    </>
  );
}
