```javascript
import { createClient } from '@supabase/supabase-js';
import { TopicInput } from '@/components/TopicInput';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { formatDistanceToNow } from 'date-fns';

// Re-create client here for server component usage if needed, or use a server-utils file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  // Fetch Topics
  const { data: topics } = await supabase.from('topics').select('*');
  
  // Fetch Articles (latest 20) with Source info
  const { data: articles } = await supabase
    .from('articles')
    .select('*, source:sources(topic_id, name)')
    .order('published_at', { ascending: false })
    .limit(20);

  const stats = {
    processed: articles?.length || 0,
    insights: 5, // Mock for now
    relevance: 92 // Mock for now
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      
      {/* Top Bar */}
      <header className="h-16 flex items-center justify-between mb-8">
        <h1 className="font-semibold text-lg">Good evening, User</h1>
        <div className="flex items-center gap-4">
          <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input & Feed */}
        <div className="lg:col-span-2 space-y-8">
            <TopicInput />

            <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Live Intelligence Feed
            </h2>

            <div className="space-y-4">
                {articles?.map((article) => (
                <article key={article.id} className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/50 group cursor-pointer transition shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {article.source?.name || 'Unknown Source'}
                        </span>
                        <span className="text-slate-500 text-xs">
                            • {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                        </span>
                    </div>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition">{article.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        {article.summary || 'No summary available.'}
                    </p>
                </article>
                ))}
                {(!articles || articles.length === 0) && (
                    <div className="text-center py-10 text-slate-500">
                        No articles found. Try adding a topic!
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Stats & Graph */}
        <div className="space-y-6">
             {/* Stats */}
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                    </div>
                    <div>
                        <div className="text-xl font-bold">{stats.processed}</div>
                        <div className="text-xs text-slate-400">Articles</div>
                    </div>
                </div>
                <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                    <div>
                        <div className="text-xl font-bold">{stats.insights}</div>
                        <div className="text-xs text-slate-400">Insights</div>
                    </div>
                </div>
            </div>

            {/* Graph */}
            <KnowledgeGraph topics={topics || []} articles={articles || []} />
        </div>
      </div>

    </div>
  );
}
```
