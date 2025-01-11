import styles from '../styles/Home.module.css';

const ContactCard = ({ href, title, isCard1 }) => {
  // Conditionally apply styles based on the isCard1 prop
  
  const cardStyle = isCard1 ? styles.card1 : styles.card;

  return (
    <a href={href} className={cardStyle}>
      <h2>{title}</h2>
    </a>
  );
};

export default ContactCard;
