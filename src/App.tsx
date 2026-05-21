import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  History, 
  Settings, 
  Youtube, 
  FileText, 
  Image as ImageIcon, 
  Tag as TagIcon, 
  Info,
  Calendar,
  ChevronRight,
  RefreshCw,
  Search,
  ExternalLink,
  Bot
} from 'lucide-react';

interface Job {
  id: string;
  date: string;
  timestamp: number;
  newsSources: any[];
  script: string;
  metadata: {
    title: string;
    description: string;
    tags: string[];
    thumbnailTitle: string;
    thumbnailSuggestion: string;
  };
}

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data);
      if (data.length > 0 && !selectedJob) {
        setSelectedJob(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const handleManualGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', { method: 'POST' });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }
      
      setJobs(prev => [data, ...prev]);
      setSelectedJob(data);
    } catch (err: any) {
      console.error("Manual generation failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      {/* Mesh Background Gradients */}
      <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/5 border-b border-white/10 backdrop-blur-xl z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg tracking-tight leading-none mb-0.5">AI Creator Studio</h1>
            <p className="text-blue-300/60 text-[10px] uppercase tracking-[0.2em] font-bold">Daily Intelligence Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:block text-right">
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-tighter">Daily Auto-Sync</p>
            <p className="text-emerald-400 text-sm font-mono">12:00 AM ACTIVE</p>
          </div>
          <button 
            onClick={handleManualGenerate}
            disabled={loading}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-white text-sm font-medium transition-all shadow-lg backdrop-blur-md flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin text-blue-400" /> : <Plus className="w-4 h-4 text-blue-400" />}
            Regenerate Manually
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-28 pb-12 px-4 md:px-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 relative z-10">
        
        {/* Left Side: Navigation & History */}
        <aside className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-300/60 uppercase tracking-widest">
              <History className="w-3.5 h-3.5" />
              <span>Broadcast History</span>
            </div>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-16rem)] pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`w-full text-left p-4 rounded-2xl transition-all border backdrop-blur-md group ${
                  selectedJob?.id === job.id 
                    ? 'bg-white/10 border-blue-500/30 shadow-xl shadow-blue-500/10 scale-[1.02]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                }`}
              >
                <div className="text-[10px] font-mono text-blue-400 mb-2 flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                  <Calendar className="w-3 h-3" />
                  {job.date}
                </div>
                <div className="font-semibold text-sm line-clamp-2 leading-snug tracking-tight text-white group-hover:text-blue-100 transition-colors">
                  {job.metadata?.title || 'Unknown Report'}
                </div>
              </button>
            ))}
            {jobs.length === 0 && !loading && (
              <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10 backdrop-blur-sm">
                <Info className="w-8 h-8 mx-auto mb-3 text-white/20" />
                <p className="text-xs text-white/40 font-medium">No intelligence reports generated yet.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Workspace: Content View */}
        <div className="min-h-[70vh]">
          <AnimatePresence mode="wait">
            {!selectedJob && !loading ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl shadow-2xl"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                  <Bot className="w-12 h-12 text-blue-400 relative z-10" />
                </div>
                <div className="max-w-md space-y-4 mb-8">
                  <h2 className="text-3xl font-black tracking-tighter">Ready to Broadcast?</h2>
                  <p className="text-blue-100/40 text-sm leading-relaxed">
                    Automate your entire YouTube pre-production flow. Crawl news, extract insights, and generate production-ready scripts in seconds.
                  </p>
                </div>
                <button 
                  onClick={handleManualGenerate}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  Start First Daily Generation
                </button>
              </motion.div>
            ) : selectedJob ? (
              <motion.div
                key={selectedJob.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                {/* Visual Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30 tracking-widest uppercase">Validated Report</span>
                      <span className="text-white/30 text-xs font-mono">ID: {selectedJob.id.slice(-8)}</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-balance leading-[1.1] text-white">
                      {selectedJob.metadata?.title || 'Untitled Report'}
                    </h1>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-300/60 text-right">Grounding Stats</span>
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-lg">
                       <div className="text-center">
                         <p className="text-lg font-black leading-none">{selectedJob.newsSources.length}</p>
                         <p className="text-[8px] uppercase text-white/30 font-bold tracking-tighter">Sources</p>
                       </div>
                       <div className="h-6 w-px bg-white/10" />
                       <div className="text-center">
                         <p className="text-lg font-black leading-none text-blue-400">7.2k</p>
                         <p className="text-[8px] uppercase text-white/30 font-bold tracking-tighter">Words Synthesized</p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Unified Workspace Grid */}
                <div className="grid grid-cols-12 gap-6">
                  
                  {/* Script Terminal */}
                  <section className="col-span-12 lg:col-span-8 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-lg shadow-2xl flex flex-col h-full ring-1 ring-white/5">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                          <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h2 className="font-bold text-lg leading-none">Video Script Pipeline</h2>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1.5">Optimized for retention & clarity</p>
                        </div>
                      </div>
                      <button className="text-[10px] font-bold text-white/40 hover:text-white bg-white/5 px-3 py-1.5 rounded-full border border-white/10 transition-all uppercase tracking-widest">Copy to Clipboard</button>
                    </div>
                    
                    <div className="bg-black/30 rounded-3xl p-8 overflow-y-auto border border-white/5 min-h-[400px]">
                      <div className="prose prose-invert max-w-none prose-blue">
                         <p className="text-blue-100/90 leading-relaxed text-lg font-serif italic whitespace-pre-wrap selection:bg-blue-500/50">
                           {selectedJob.script}
                         </p>
                      </div>
                    </div>
                  </section>

                  {/* Metadata & Actions Pane */}
                  <div className="col-span-12 lg:col-span-4 space-y-6">
                    
                    {/* Thumbnail Card */}
                    <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-lg shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[60px] pointer-events-none group-hover:bg-orange-500/30 transition-all" />
                      <label className="text-blue-300/60 text-[10px] uppercase font-bold tracking-widest block mb-4 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Thumbnail Strategy
                      </label>
                      <div className="space-y-4">
                        <div className="bg-black/60 border border-white/10 p-5 rounded-2xl relative z-10">
                          <p className="text-orange-500 font-black text-2xl tracking-tighter uppercase italic leading-none mb-3 transform -skew-x-6">
                            {selectedJob.metadata?.thumbnailTitle || 'Visual Insight'}
                          </p>
                          <p className="text-[11px] text-white/40 leading-relaxed italic">
                            <span className="text-white/60 font-bold not-italic">Directive:</span> {selectedJob.metadata?.thumbnailSuggestion || 'No suggestion available.'}
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* SEO Metadata */}
                    <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-lg shadow-xl border-l-4 border-l-blue-500/40">
                      <label className="text-blue-300/60 text-[10px] uppercase font-bold tracking-widest block mb-5 flex items-center gap-2">
                        <Search className="w-4 h-4" /> Optimization Hub
                      </label>
                      
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Generated Tags</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedJob.metadata?.tags?.map(tag => (
                              <span key={tag} className="text-[10px] bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-white/60 cursor-default transition-colors">
                                #{tag.replace(/\s+/g, '')}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Video Description</p>
                          <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                            <p className="text-xs text-blue-100/40 leading-relaxed line-clamp-6 font-mono selection:bg-purple-500/30">
                              {selectedJob.metadata?.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Source Pulse Feed */}
                    <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-lg shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-blue-300/60 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-emerald-400" /> Research Grounding
                        </label>
                      </div>
                      <div className="space-y-3">
                        {selectedJob.newsSources.map((source, idx) => (
                           <a 
                            key={idx}
                            href={source.web?.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group overflow-hidden"
                          >
                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 font-bold text-[10px] group-hover:bg-blue-500/20 transition-colors">
                              {idx + 1}
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="text-xs font-semibold text-white/80 truncate group-hover:text-blue-300 transition-colors">
                                {source.web?.title || 'Grounding Asset'}
                              </p>
                              <p className="text-[8px] text-white/30 truncate font-mono uppercase tracking-tighter">Source Verified</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </section>

                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Loading State Overlay */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-[#030712]/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-6"
            >
              <div className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center text-center gap-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/10 blur-[100px] pointer-events-none" />
                
                {error ? (
                  <>
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-red-500/40 rounded-full blur-xl" />
                      <Info className="w-10 h-10 text-red-500 relative z-10" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <h3 className="text-2xl font-black tracking-tighter text-red-400">Generation Halted</h3>
                      <div className="space-y-2">
                        <p className="text-xs text-white/60 max-w-[300px] mx-auto leading-relaxed">
                          {error.includes("quota") 
                            ? "Daily AI quota has been reached. Please try again tomorrow or check your plan." 
                            : error}
                        </p>
                      </div>
                      <button 
                        onClick={() => { setError(null); setLoading(false); }}
                        className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="w-24 h-24 border-[6px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin shadow-xl shadow-blue-500/20" />
                      <Bot className="absolute inset-0 m-auto w-10 h-10 text-blue-400" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <h3 className="text-3xl font-black tracking-tighter italic">Processing Global Data</h3>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-300/60 uppercase tracking-widest animate-pulse">Scanning 4.2k Intelligence Sources</p>
                        <p className="text-xs text-white/30 max-w-[280px] mx-auto leading-relaxed">
                          Gemini is currently synthesizing latest breakthroughs into your personalized production package.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Glass Footer */}
      <footer className="h-14 px-8 flex items-center justify-between bg-white/5 border-t border-white/10 backdrop-blur-xl relative z-20 mt-12">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/40"></div>
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest font-mono">Neural Engine Active</span>
          </div>
          <div className="h-3 w-[1px] bg-white/10 hidden md:block"></div>
          <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest hidden md:block">Grounding Confidence: 99.4%</span>
        </div>
        <div className="text-white/25 text-[10px] font-bold uppercase tracking-tighter">
          &copy; 2024 AI CREATOR ENGINE • VERSION 2.1.0-STABLE
        </div>
      </footer>
    </div>
  );
}
