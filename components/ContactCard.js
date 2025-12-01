import styles from '../styles/Home.module.css';

const ContactCard = ({ href, title, isCard1 }) => {
    // console.log("Rendering card:", title);

  // Apply card2 style specifically for the "?" card
  const cardStyle =
    title === "?" ? styles.card2 : isCard1 ? styles.card1 : styles.card;

  return (
    <a href={href} className={cardStyle}>
      <h2>{title}</h2>
    </a>
  );
};

export default ContactCard;
