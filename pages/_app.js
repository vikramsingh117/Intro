import '../styles/globals.css';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Analytics } from '@vercel/analytics/react';

function AppContent({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
