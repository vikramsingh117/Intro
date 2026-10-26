import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import AfterHoursPreload from '../components/AfterHoursPreload';
import AfterHoursTransition from '../components/AfterHoursTransition';
import ThemeCursor from '../components/ThemeCursor';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <AfterHoursPreload><AfterHoursTransition><Component {...pageProps} /></AfterHoursTransition></AfterHoursPreload>
      <ThemeCursor />
      <Analytics />
    </>
  );
}
