import { useState, useEffect } from 'react';
import styles from '../styles/ActivityTimeline.module.css';

const ActivityTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);

  // Fetch activities
  const fetchActivities = async (newOffset = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(`/api/activity-timeline?limit=5&offset=${newOffset}`);
      const data = await response.json();

      if (data.success) {
        if (append) {
          setActivities(prev => [...prev, ...data.activities]);
        } else {
          setActivities(data.activities);
        }
        setHasMore(data.hasMore);
        setOffset(newOffset);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch activities');
      console.error('Timeline fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load initial activities
  useEffect(() => {
    fetchActivities();
  }, []);

  // Load more activities
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchActivities(offset + 5, true);
    }
  };

  // Format single line message
  const formatMessage = (activity) => {
    let message = activity.message;
    
    // Add platform context
    if (activity.platform === 'github' && activity.details) {
      if (activity.details.commitMessage) {
        message += ` - "${activity.details.commitMessage}"`;
      }
      if (activity.details.branch && activity.details.branch !== 'main') {
        message += ` on ${activity.details.branch}`;
      }
    }
    
    if (activity.platform === 'leetcode' && activity.details) {
      message += ` (${activity.details.difficulty}) in ${activity.details.language}`;
      if (activity.details.status !== 'Accepted') {
        message += ` - ${activity.details.status}`;
      }
    }
    
    return message;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recent Activity</h2>
        </div>
        <div className={styles.loading}>
          <p>Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recent Activity</h2>
        </div>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={() => fetchActivities()} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Activity</h2>
      </div>

      <div className={styles.activityFeed}>
        {activities.map((activity, index) => (
          <div key={activity.id} className={styles.activityItem}>
            <span className={styles.activityMessage}>
              {formatMessage(activity)}
            </span>
            <span className={styles.activityTime}>
              {activity.relativeTime}
            </span>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <button 
            onClick={loadMore} 
            disabled={loadingMore}
            className={styles.loadMoreButton}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* End of timeline */}
      {!hasMore && activities.length > 0 && (
        <div className={styles.endMessage}>
          <p>End of recent activities</p>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline; 