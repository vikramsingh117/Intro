import fetch from "node-fetch";

const LEETCODE_URL = "https://leetcode.com/graphql/";
const USERNAME = "vikramandanshu";

async function graphql(query, variables = {}) {
  const res = await fetch(LEETCODE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

export async function getProfileStats() {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
          starRating
          countryName
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
  `;
  const data = await graphql(query, { username: USERNAME });
  return data.matchedUser;
}

export async function getUserSubmissionStats() {
  const query = `
    query getUserSubmissionStats($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
  `;
  const data = await graphql(query, { username: USERNAME });
  return data.matchedUser.submitStats;
}

export async function getUserRankingHistory() {
  const query = `
    query userContestRankingHistory($username: String!) {
      userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        trendDirection
        contest {
          title
          startTime
        }
      }
    }
  `;
  const data = await graphql(query, { username: USERNAME });
  return data.userContestRankingHistory;
}

export async function getRecentSubmissions(limit = 10) {
  const query = `
    query recentSubmissionList($username: String!) {
      recentSubmissionList(username: $username) {
        title
        titleSlug
        statusDisplay
        lang
        timestamp
      }
    }
  `;
  const data = await graphql(query, { username: USERNAME });
  return data.recentSubmissionList.slice(0, limit);
}

export async function getLastMediumSolved() {
  const recent = await getRecentSubmissions(25);

  for (const s of recent) {
    const q = `
      query question($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          difficulty
        }
      }
    `;
    const info = await graphql(q, { titleSlug: s.titleSlug });
    if (info.question?.difficulty === "Medium") {
      const date = new Date(Number(s.timestamp) * 1000).toLocaleString("en-IN");
      return { title: s.title, date };
    }
  }
  return { message: "No Medium question found in recent submissions" };
}

export async function getContestRankingHistory() {
  const query = `
    query userContestRankingHistory($username: String!) {
      userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        contest {
          title
          startTime
        }
      }
    }
  `;
  const data = await graphql(query, { username: USERNAME });
  return data.userContestRankingHistory.filter((c) => c.attended);
}

export async function getUserCalendarData() {
  const query = `
    query userProfileCalendar($username: String!, $year: Int) {
      matchedUser(username: $username) {
        userCalendar(year: $year) {
          activeYears
          streak
          totalActiveDays
          dccBadges {
            timestamp
            badge {
              name
              icon
            }
          }
          submissionCalendar
        }
      }
    }
  `;

  const variables = {
    username: "vikramandanshu",
    year: new Date().getFullYear(),
  };

  const data = await graphql(query, variables);
  const calendarNode = data.matchedUser.userCalendar;

  // Parse stringified map of submissions {timestamp: count}
  const calendar = JSON.parse(calendarNode.submissionCalendar || "{}");

  const now = Date.now() / 1000;
  const dayAgo = now - 24 * 3600;

  const solvedIn24h = Object.entries(calendar)
    .filter(([ts]) => Number(ts) >= dayAgo)
    .reduce((sum, [, count]) => sum + count, 0);

  return {
    activeYears: calendarNode.activeYears,
    streak: calendarNode.streak,
    totalActiveDays: calendarNode.totalActiveDays,
    solved_in_24h: solvedIn24h,
    badges: calendarNode.dccBadges.map((b) => ({
      name: b.badge.name,
      icon: b.badge.icon,
    })),
  };
}

export async function getUserLanguageStats() {
  const query = `
    query languageStats($username: String!) {
      matchedUser(username: $username) {
        languageProblemCount {
          languageName
          problemsSolved
        }
      }
    }
  `;

  const variables = {
    username: "vikramandanshu",
  };

  const data = await graphql(query, variables);
  return data.matchedUser.languageProblemCount.map((lang) => ({
    language: lang.languageName,
    solved: lang.problemsSolved,
  }));
}



/* ============================================================
   Exports
   ============================================================ */
export default {
  getProfileStats,
  getUserSubmissionStats,
  getUserRankingHistory,
  getRecentSubmissions,
  getLastMediumSolved,
  getContestRankingHistory,
  getUserCalendarData,
  getUserLanguageStats,
};

// Test run
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Testing LeetCode API for", USERNAME);
  console.log(await getProfileStats());
  console.log(await getUserSubmissionStats());
  console.log(await getUserRankingHistory());
  console.log(await getRecentSubmissions());
  console.log(await getLastMediumSolved());
  console.log(await getContestRankingHistory());
  console.log(await getUserCalendarData());
  console.log(await getUserLanguageStats());
}
