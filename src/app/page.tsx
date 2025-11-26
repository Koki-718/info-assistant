import { TopicInput } from '@/components/TopicInput';

export default function Home() {
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

      <TopicInput />

      {/* Stats / Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 hover:border-indigo-500/30 transition shadow-lg">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          </div>
          <div>
            <div className="text-2xl font-bold">124</div>
            <div className="text-sm text-slate-400">Articles Processed</div>
          </div>
        </div>
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 hover:border-indigo-500/30 transition shadow-lg">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
          <div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-slate-400">New Insights</div>
          </div>
        </div>
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 hover:border-indigo-500/30 transition shadow-lg">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div className="text-2xl font-bold">98%</div>
            <div className="text-sm text-slate-400">Relevance Score</div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
        Live Intelligence Feed
      </h2>

      <div className="space-y-4">
        {/* Placeholder Feed Items - Will be replaced by real data later */}
        <article className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/50 group cursor-pointer transition shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded">TechCrunch</span>
              <span className="text-slate-500 text-xs">• 2 hours ago</span>
            </div>
            <button className="text-slate-500 hover:text-indigo-400 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
            </button>
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition">OpenAI Announces GPT-5 Development Phase</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            The latest iteration aims for AGI-level performance with enhanced reasoning capabilities. Early benchmarks suggest a 40% increase in complex problem-solving...
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">#GenerativeAI</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">#LLM</span>
          </div>
        </article>
      </div>

    </div>
  );
}
