import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import AfterHoursPreload from '../components/AfterHoursPreload';
import ThemeCursor from '../components/ThemeCursor';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <AfterHoursPreload><Component {...pageProps} /></AfterHoursPreload>
      <ThemeCursor />
      <Analytics />
    </>
  );
}
