import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import ThemeCursor from '../components/ThemeCursor';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <ThemeCursor />
      <Analytics />
    </>
  );
}
