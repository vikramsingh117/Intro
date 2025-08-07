import '../styles/globals.css';
import { AuthProvider, useAuth } from '../context/AuthContext';
import MagicNumberLogin from '../components/MagicNumberLogin';

function AppContent({ Component, pageProps }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className={!isAuthenticated ? 'blur-background' : ''}>
        <Component {...pageProps} />
      </div>
      {!isAuthenticated && <MagicNumberLogin />}
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
