// Activity Timeline API - Merges GitHub and LeetCode data
export default async function handler(req, res) {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    console.log(`Fetching activity timeline (limit: ${limit}, offset: ${offset})`);
    
    // Fetch GitHub activities
    const githubActivities = await fetchGitHubActivities();
    
    // Fetch LeetCode submissions  
    const leetcodeActivities = await fetchLeetCodeActivities();
    
    // Merge and sort activities
    const allActivities = [...githubActivities, ...leetcodeActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Newest first
      .slice(offset, offset + parseInt(limit));
    
    // Add relative timestamps
    const activitiesWithRelativeTime = allActivities.map(activity => ({
      ...activity,
      relativeTime: getRelativeTime(activity.timestamp)
    }));
    
    res.status(200).json({
      success: true,
      activities: activitiesWithRelativeTime,
      hasMore: (offset + parseInt(limit)) < (githubActivities.length + leetcodeActivities.length),
      totalCount: githubActivities.length + leetcodeActivities.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Activity Timeline Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Fetch GitHub activities
async function fetchGitHubActivities() {
  try {
    const response = await fetch('https://api.github.com/users/vikramsingh117/events?per_page=30');
    if (!response.ok) return [];
    
    const events = await response.json();
    
    return events.map(event => {
      const baseActivity = {
        id: event.id,
        platform: 'github',
        timestamp: event.created_at,
        actor: event.actor?.login,
        repo: event.repo?.name
      };
      
      // Parse different GitHub event types
      switch (event.type) {
        case 'PushEvent':
          const commits = event.payload?.commits || [];
          const commitMsg = commits[0]?.message || 'Unknown commit';
          return {
            ...baseActivity,
            type: 'github_push',
            message: `Pushed to ${event.repo?.name?.split('/')[1] || 'repository'}`,
            details: {
              commitMessage: commitMsg.length > 50 ? commitMsg.substring(0, 50) + '...' : commitMsg,
              commitCount: commits.length,
              branch: event.payload?.ref?.replace('refs/heads/', '') || 'main'
            },
            icon: '🚀'
          };
          
        case 'CreateEvent':
          if (event.payload?.ref_type === 'repository') {
            return {
              ...baseActivity,
              type: 'github_create_repo',
              message: `Created new repository "${event.repo?.name?.split('/')[1] || 'repository'}"`,
              details: {
                description: event.payload?.description || '',
                isPrivate: event.payload?.master_branch !== null
              },
              icon: '📁'
            };
          }
          return null;
          
        case 'IssuesEvent':
          return {
            ...baseActivity,
            type: 'github_issue',
            message: `${event.payload?.action === 'opened' ? 'Opened' : 'Updated'} issue in ${event.repo?.name?.split('/')[1]}`,
            details: {
              issueTitle: event.payload?.issue?.title || 'Unknown issue',
              action: event.payload?.action
            },
            icon: '🐛'
          };
          
        case 'WatchEvent':
          return {
            ...baseActivity,
            type: 'github_star',
            message: `Starred ${event.repo?.name?.split('/')[1] || 'repository'}`,
            details: {
              action: event.payload?.action
            },
            icon: '⭐'
          };
          
        default:
          return null;
      }
    }).filter(Boolean); // Remove null entries
    
  } catch (error) {
    console.error('GitHub API Error:', error);
    return [];
  }
}

// Fetch LeetCode activities
async function fetchLeetCodeActivities() {
  try {
    const graphqlQuery = {
      query: `
        query recentSubmissions($username: String!, $limit: Int!) {
          recentSubmissionList(username: $username, limit: $limit) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
            __typename
          }
        }
      `,
      variables: {
        username: "vikramandanshu",
        limit: 20
      }
    };

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; ActivityBot/1.0)',
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!response.ok) return [];
    
    const data = await response.json();
    const submissions = data?.data?.recentSubmissionList || [];
    
    return submissions.map(submission => ({
      id: `leetcode_${submission.timestamp}_${submission.titleSlug}`,
      platform: 'leetcode',
      type: 'leetcode_submission',
      timestamp: new Date(parseInt(submission.timestamp) * 1000).toISOString(),
      message: `Solved "${submission.title}" on LeetCode`,
      details: {
        problemTitle: submission.title,
        problemSlug: submission.titleSlug,
        status: submission.statusDisplay,
        language: submission.lang,
        difficulty: getDifficultyFromTitle(submission.title), // We'll need to guess or fetch separately
        isAccepted: submission.statusDisplay === 'Accepted'
      },
      icon: submission.statusDisplay === 'Accepted' ? '✅' : '❌'
    }));
    
  } catch (error) {
    console.error('LeetCode API Error:', error);
    return [];
  }
}

// Helper function to get relative time
function getRelativeTime(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

// Helper to guess difficulty (basic heuristic)
function getDifficultyFromTitle(title) {
  // This is a basic guess - in a real implementation, you'd fetch from another API
  const easyKeywords = ['two sum', 'palindrome', 'reverse', 'valid'];
  const hardKeywords = ['median', 'merge', 'tree', 'dynamic'];
  
  const lowerTitle = title.toLowerCase();
  if (easyKeywords.some(keyword => lowerTitle.includes(keyword))) return 'Easy';
  if (hardKeywords.some(keyword => lowerTitle.includes(keyword))) return 'Hard';
  return 'Medium'; // Default guess
} 