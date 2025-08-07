import { Typewriter } from 'react-simple-typewriter';
import styles from '../styles/Home.module.css';

const Header = () => {
  return (
    <h1 className={styles.title}>
      <Typewriter
        words={[
          "Welcome, I am Vikram Singh",
          "I am a Full Stack Developer",
          "Competitive Programmer",
          "And passionate about Open Source",
          "I made this before AI became popular"
        ]}
        loop={Infinity}
        cursor
        cursorStyle="_"
        typeSpeed={70}
        deleteSpeed={50}
        delaySpeed={2000}
      />
    </h1>
  );
};

export default Header;
