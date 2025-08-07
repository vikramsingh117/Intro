import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/MagicLogin.module.css';

const MagicNumberLogin = () => {
  const [magicNumber, setMagicNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginWithMagicNumber } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!magicNumber || isNaN(magicNumber)) {
      setError('Please enter a valid number');
      setLoading(false);
      return;
    }

    const result = await loginWithMagicNumber(magicNumber);
    
    if (!result.success) {
      setError(result.error || 'Invalid magic number');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>JWT Auth</h2>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <input
            // type="number"
            value={magicNumber}
            onChange={(e) => setMagicNumber(e.target.value)}
            placeholder="Pick your favorite number"
            className={styles.input}
            autoFocus
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MagicNumberLogin; 