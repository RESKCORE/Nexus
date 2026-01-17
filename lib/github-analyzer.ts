import Sentiment from 'sentiment';

// Define the shape of our analysis result
export interface AnalysisResult {
  sentimentScore: number; // -5 to +5 range usually
  sentimentLabel: 'Positive' | 'Negative' | 'Neutral';
  topLanguages: Record<string, number>;
  totalEventsAnalyzed: number;
  recentCommits: CommitMessage[];
  eventTypeDistribution: Record<string, number>;
}

export interface CommitMessage {
  message: string;
  repo: string;
  author: string;
  timestamp: string;
}

const sentiment = new Sentiment();

/**
 * Fetches real events from GitHub and analyzes them in real-time.
 * This runs entirely on the server (Next.js API route) to avoid CORS/Rate limits on client.
 */
export async function analyzeGlobalGitActivity(): Promise<AnalysisResult> {
  try {
    const response = await fetch('https://api.github.com/events', {
      headers: {
        'User-Agent': 'Nexus-Observatory-v1.0',
        // 'Authorization': 'token YOUR_GITHUB_TOKEN' // Optional: Higher rate limits
      },
      next: { revalidate: 10 } // Cache for 10s to be nice to GitHub
    });

    if (!response.ok) {
      throw new Error(`GitHub API limit exceeded: ${response.status}`);
    }

    const events = await response.json();
    
    // Debug: Log event types received
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventTypesList = events.map((e: any) => e.type);
    console.log(`[Analysis] Fetched ${events.length} events from GitHub`);
    console.log(`[Analysis] Event types:`, [...new Set(eventTypesList)]);
    
    // Arrays to hold data for analysis
    const commitMessages: string[] = [];
    const languages: Record<string, number> = {};
    const recentCommits: CommitMessage[] = [];
    const eventTypes: Record<string, number> = {};

    // 1. Extract Data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events.forEach((event: any) => {
      // Track event type distribution
      const evtType = event.type || 'Unknown';
      eventTypes[evtType] = (eventTypes[evtType] || 0) + 1;
      
      // Collect commit messages for Sentiment Analysis from PushEvent
      if (event.type === 'PushEvent') {
        const commits = event.payload?.commits;
        if (commits && Array.isArray(commits) && commits.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          commits.forEach((commit: any) => {
            if (commit.message && typeof commit.message === 'string') {
              commitMessages.push(commit.message);
              
              // Add to recent commits for ticker (limit to first 15)
              if (recentCommits.length < 15) {
                const repoName = event.repo?.name || 'unknown/repo';
                const shortRepo = repoName.split('/')[1] || repoName;
                const authorName = commit.author?.name || commit.author?.email?.split('@')[0] || event.actor?.login || 'anonymous';
                recentCommits.push({
                  message: commit.message.split('\n')[0].slice(0, 80),
                  repo: shortRepo,
                  author: authorName,
                  timestamp: event.created_at || new Date().toISOString()
                });
              }
            }
          });
        } else {
          // PushEvent without commits array - create synthetic entry from event data
          const repoName = event.repo?.name || 'unknown/repo';
          const shortRepo = repoName.split('/')[1] || repoName;
          if (recentCommits.length < 15) {
            recentCommits.push({
              message: `Pushed to ${event.payload?.ref?.replace('refs/heads/', '') || 'main'}`,
              repo: shortRepo,
              author: event.actor?.login || 'anonymous',
              timestamp: event.created_at || new Date().toISOString()
            });
          }
        }
      }
      
      // Also extract text from other event types for more data
      // IssueCommentEvent - comments on issues
      if (event.type === 'IssueCommentEvent' && event.payload?.comment?.body) {
        commitMessages.push(event.payload.comment.body);
      }
      
      // IssuesEvent - issue titles
      if (event.type === 'IssuesEvent' && event.payload?.issue?.title) {
        commitMessages.push(event.payload.issue.title);
      }
      
      // PullRequestEvent - PR titles
      if (event.type === 'PullRequestEvent' && event.payload?.pull_request?.title) {
        commitMessages.push(event.payload.pull_request.title);
      }
      
      // CreateEvent - for repo/branch creation descriptions
      if (event.type === 'CreateEvent') {
        if (event.payload?.description) {
          commitMessages.push(event.payload.description);
        }
        // Add to ticker for branch/repo creation
        if (recentCommits.length < 15) {
          const repoName = event.repo?.name || 'unknown/repo';
          const shortRepo = repoName.split('/')[1] || repoName;
          const refType = event.payload?.ref_type || 'branch';
          const refName = event.payload?.ref || '';
          recentCommits.push({
            message: `Created ${refType}${refName ? `: ${refName}` : ''}`,
            repo: shortRepo,
            author: event.actor?.login || 'anonymous',
            timestamp: event.created_at || new Date().toISOString()
          });
        }
      }

      // Collect Repo Languages from multiple event types
      let repoLanguage = null;
      
      // From PullRequestEvent
      if (event.type === 'PullRequestEvent' && event.payload?.pull_request?.head?.repo?.language) {
        repoLanguage = event.payload.pull_request.head.repo.language;
      }
      // From PullRequestEvent base repo
      else if (event.type === 'PullRequestEvent' && event.payload?.pull_request?.base?.repo?.language) {
        repoLanguage = event.payload.pull_request.base.repo.language;
      }
      // From ForkEvent
      else if (event.type === 'ForkEvent' && event.payload?.forkee?.language) {
        repoLanguage = event.payload.forkee.language;
      }
      // Try repo name patterns to infer language (fallback heuristic)
      else if (event.repo?.name) {
        const repoName = event.repo.name.toLowerCase();
        if (repoName.includes('python') || repoName.includes('.py')) repoLanguage = 'Python';
        else if (repoName.includes('javascript') || repoName.includes('.js') || repoName.includes('node')) repoLanguage = 'JavaScript';
        else if (repoName.includes('typescript') || repoName.includes('.ts')) repoLanguage = 'TypeScript';
        else if (repoName.includes('rust') || repoName.includes('.rs')) repoLanguage = 'Rust';
        else if (repoName.includes('go') || repoName.includes('golang')) repoLanguage = 'Go';
        else if (repoName.includes('java') && !repoName.includes('javascript')) repoLanguage = 'Java';
        else if (repoName.includes('ruby') || repoName.includes('.rb')) repoLanguage = 'Ruby';
        else if (repoName.includes('cpp') || repoName.includes('c++')) repoLanguage = 'C++';
        else if (repoName.includes('react') || repoName.includes('vue') || repoName.includes('angular')) repoLanguage = 'JavaScript';
        else if (repoName.includes('swift')) repoLanguage = 'Swift';
        else if (repoName.includes('kotlin')) repoLanguage = 'Kotlin';
        else if (repoName.includes('php')) repoLanguage = 'PHP';
      }
      
      if (repoLanguage && repoLanguage !== null) {
        languages[repoLanguage] = (languages[repoLanguage] || 0) + 1;
      }
    });

    // 2. Perform Sentiment Analysis (NLP)
    let totalScore = 0;
    let analyzedCount = 0;

    commitMessages.forEach(msg => {
      const result = sentiment.analyze(msg);
      totalScore += result.score;
      analyzedCount++;
    });

    const avgScore = analyzedCount > 0 ? (totalScore / analyzedCount) : 0;
    
    console.log(`[Analysis] Analyzed ${analyzedCount} commit messages`);
    console.log(`[Analysis] Average sentiment: ${avgScore.toFixed(2)}`);
    console.log(`[Analysis] Languages detected:`, Object.keys(languages).length);
    
    // Normalize label
    let label: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
    if (avgScore > 0.5) label = 'Positive';
    if (avgScore < -0.5) label = 'Negative';

    console.log(`[Analysis] Recent commits collected: ${recentCommits.length}`);

    return {
      sentimentScore: parseFloat(avgScore.toFixed(2)),
      sentimentLabel: label,
      topLanguages: languages,
      totalEventsAnalyzed: events.length,
      recentCommits: recentCommits,
      eventTypeDistribution: eventTypes
    };

  } catch (error) {
    console.error("Analysis Failed:", error);
    console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
    // Fallback to "Neutral" state if offline/blocked
    return {
      sentimentScore: 0,
      sentimentLabel: 'Neutral',
      topLanguages: {},
      totalEventsAnalyzed: 0,
      recentCommits: [],
      eventTypeDistribution: {}
    };
  }
}
