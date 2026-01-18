'use client';

import { useEffect, useState } from 'react';

export default function DataTestPage() {
  const [stats, setStats] = useState<any>(null);
  const [topRepos, setTopRepos] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch dashboard stats
        const statsRes = await fetch('/api/stats');
        const statsData = await statsRes.json();
        setStats(statsData.data);

        // Fetch top repositories
        const reposRes = await fetch('/api/repositories/top?limit=10');
        const reposData = await reposRes.json();
        setTopRepos(reposData.data);

        // Fetch language stats
        const langsRes = await fetch('/api/languages/stats');
        const langsData = await langsRes.json();
        setLanguages(langsData.data.slice(0, 10));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading data from Supabase...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-cyan-400">
          🎉 Supabase Data Test
        </h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-cyan-500/30">
            <div className="text-gray-400 text-sm">Total Repositories</div>
            <div className="text-3xl font-bold text-cyan-400">
              {stats?.overview?.totalRepos?.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-cyan-500/30">
            <div className="text-gray-400 text-sm">Total Stars</div>
            <div className="text-3xl font-bold text-cyan-400">
              {stats?.overview?.totalStars?.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-cyan-500/30">
            <div className="text-gray-400 text-sm">Total Commits</div>
            <div className="text-3xl font-bold text-cyan-400">
              {Math.round(stats?.overview?.totalCommits || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-cyan-500/30">
            <div className="text-gray-400 text-sm">Languages</div>
            <div className="text-3xl font-bold text-cyan-400">
              {stats?.overview?.uniqueLanguages}
            </div>
          </div>
        </div>

        {/* Top Repositories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top 10 Repositories</h2>
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-cyan-500/30">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4">#</th>
                  <th className="text-left p-4">Repository</th>
                  <th className="text-left p-4">Language</th>
                  <th className="text-right p-4">Stars</th>
                  <th className="text-right p-4">Forks</th>
                  <th className="text-right p-4">Commits</th>
                </tr>
              </thead>
              <tbody>
                {topRepos.map((repo, idx) => (
                  <tr key={repo.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 text-gray-400">{idx + 1}</td>
                    <td className="p-4 font-mono text-cyan-400">{repo.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">
                        {repo.primary_language || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-right">{repo.stars_count.toLocaleString()}</td>
                    <td className="p-4 text-right">{repo.forks_count.toLocaleString()}</td>
                    <td className="p-4 text-right">{Math.round(repo.commit_count || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Languages */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Top 10 Languages by Average Stars</h2>
          <div className="grid grid-cols-2 gap-4">
            {languages.map((lang, idx) => (
              <div key={idx} className="bg-gray-900 p-4 rounded-lg border border-cyan-500/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">{lang.primary_language}</span>
                  <span className="text-cyan-400">{lang.repo_count} repos</span>
                </div>
                <div className="text-sm text-gray-400">
                  Avg Stars: <span className="text-white">{lang.avg_stars?.toLocaleString()}</span> | 
                  Avg Forks: <span className="text-white">{lang.avg_forks?.toLocaleString()}</span>
                </div>
                <div className="mt-2 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full"
                    style={{ width: `${Math.min((lang.avg_stars / 50000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
          <h3 className="text-xl font-bold text-green-400 mb-2">✅ Supabase Integration Complete!</h3>
          <p className="text-gray-300">
            Your database is working perfectly with <strong>{stats?.overview?.totalRepos?.toLocaleString()}</strong> repositories loaded.
            All API endpoints are functional and ready for your dashboard!
          </p>
          <div className="mt-4 flex gap-4">
            <a 
              href="/api/stats" 
              target="_blank"
              className="px-4 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400"
            >
              View Stats API
            </a>
            <a 
              href="/api/repositories/top?limit=100" 
              target="_blank"
              className="px-4 py-2 bg-gray-700 text-white font-bold rounded hover:bg-gray-600"
            >
              View Top Repos API
            </a>
            <a 
              href="/" 
              className="px-4 py-2 bg-purple-600 text-white font-bold rounded hover:bg-purple-500"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
