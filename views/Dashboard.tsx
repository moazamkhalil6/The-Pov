import React from 'react';
import { UserProfile, Relationship, ConflictSession } from '../types';
import { Button } from '../components/ui/Button';
import { Plus, Users, Zap, Shield, BookOpen } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  relationship: Relationship | null;
  recentConflicts: ConflictSession[];
  onNavigate: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, relationship, recentConflicts, onNavigate }) => {
  
  const StatCard = ({ icon: Icon, title, value, sub }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
          <Icon size={20} />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-slate-100 mb-1">{value}</h3>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      {sub && <p className="text-xs text-slate-500 mt-2">{sub}</p>}
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">
          Welcome back, <span className="text-red-500">{user.displayName}</span>.
        </h1>
        <p className="text-slate-400 max-w-2xl">
          "The first step to resolving conflict is acknowledging the distortion in your own lens."
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          icon={Users} 
          title="Relationship Status" 
          value={relationship ? "Connected" : "Solo"} 
          sub={relationship ? "Tracking active" : "Pairing needed"} 
        />
        <StatCard 
          icon={Zap} 
          title="Total Conflicts" 
          value={recentConflicts.length} 
          sub="Recorded sessions" 
        />
        <StatCard 
          icon={Shield} 
          title="Conflict Style" 
          value={user.conflictStyle.charAt(0).toUpperCase() + user.conflictStyle.slice(1)} 
          sub="Default pattern" 
        />
        <StatCard 
          icon={BookOpen} 
          title="Triggers Logged" 
          value={user.triggers.length} 
          sub="Known activation points" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Actions Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-red-950 to-slate-900 border border-red-900/50 p-8 rounded-2xl relative overflow-hidden">
             <div className="relative z-10">
               <h2 className="text-2xl font-bold text-white mb-4">Conflict Engine</h2>
               <p className="text-red-200 mb-6 max-w-lg">
                 Start a new structured session to process a disagreement. 
                 Identify facts, separate emotions, and get honest analysis.
               </p>
               <div className="flex gap-4">
                 <Button onClick={() => onNavigate('conflict_active')}>
                   <Plus size={18} /> Report a Concern
                 </Button>
                 <Button variant="secondary" onClick={() => onNavigate('history')}>
                   View History
                 </Button>
               </div>
             </div>
             {/* Abstract Decor */}
             <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={18} className="text-yellow-500" /> Recent Activity
            </h3>
            {recentConflicts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-950/50 rounded-lg border border-slate-800 border-dashed">
                <p>No conflicts recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentConflicts.slice(0, 3).map(conf => (
                  <div key={conf.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center hover:border-slate-600 transition-colors cursor-pointer"
                       onClick={() => onNavigate('history')}>
                    <div>
                      <p className="text-slate-200 font-medium truncate max-w-md">{conf.reportA.whatHappened}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block
                        ${conf.status === 'complete' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}
                      `}>
                        {conf.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(conf.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
             <h3 className="text-lg font-bold text-white mb-4">Relationship</h3>
             {relationship ? (
               <div>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-slate-950 rounded border border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">Connected</p>
                      <p className="text-xs text-slate-500">ID: {relationship.id.substring(0,8)}...</p>
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full text-sm" onClick={() => onNavigate('relationship')}>
                    Manage Agreements
                  </Button>
               </div>
             ) : (
               <div className="text-center">
                 <p className="text-slate-400 text-sm mb-4">No active partner connected.</p>
                 <Button className="w-full" onClick={() => onNavigate('relationship')}>Connect Partner</Button>
               </div>
             )}
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Daily Reminder</h3>
            <blockquote className="text-slate-400 italic text-sm border-l-2 border-red-800 pl-4 py-1">
              "Is it more important to be right, or to be understood?"
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};
