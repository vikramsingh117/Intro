import styles from '../styles/Home.module.css';

const ActivityCard = () => {
  return (
    <div className={styles.activityContainer}>
      <div className={styles.activityImages}>
        {/* GitHub Stats */}
        <img
          src="https://github-readme-stats.vercel.app/api?username=vikramsingh117&show_icons=true&theme=radical"
          alt="GitHub Stats"
          className={styles.activityImage}
        />
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
