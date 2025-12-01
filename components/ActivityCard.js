import styles from '../styles/Home.module.css';

const ActivityCard = () => {
  return (
    <div className={styles.activityContainer}>
      <div className={styles.activityImages}>
        {/* Invisible Overlay - LeetCode Only */}
        <div className={styles.overlayContainer}>
          <a
            href="https://leetcode.com/vikramandanshu"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.invisibleOverlay} ${styles.leetcodeOverlay}`}
            aria-label="View LeetCode Profile"
          />
        </div>

        {/* LeetCode Monthly Activity Graph */}
        <img
          className={styles.activityImage}
          src="https://leetcard.jacoblin.cool/vikramandanshu?ext=heatmap&theme=dark"
          alt="LeetCode Activity Graph"
        />
      </div>
    </div>
  );
};

export default ActivityCard;
