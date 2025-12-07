
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Auth } from './views/Auth';
import { Onboarding } from './views/Onboarding';
import { Dashboard } from './views/Dashboard';
import { RelationshipView } from './views/Relationship';
import { ConflictSessionView } from './views/ConflictSession';
import { UserProfile, ViewState } from './types';
import { storage } from './services/storage';
import { APP_COLORS } from './constants';
import { RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = storage.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (isProfileComplete(user)) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('onboarding');
      }
    } else {
      setCurrentView('auth');
    }
    setIsLoading(false);
  }, []);

  const isProfileComplete = (user: UserProfile) => {
    // Simple check: if they have triggers or beliefs, they passed onboarding.
    // Also checking age as a proxy for the first step.
    return user.triggers.length > 0 && user.age > 0;
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setCurrentView('auth');
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (isProfileComplete(user)) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('onboarding');
    }
  };

  const handleOnboardingComplete = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleSwitchUser = () => {
     // Debug feature to switch users easily for testing conflict flow
     const users = storage.getUsers();
     const nextUser = users.find(u => u.id !== currentUser?.id);
     if (nextUser) {
       storage.setCurrentUserId(nextUser.id);
       window.location.reload();
     } else {
       alert("No other user found locally. Create another account in a new incognito window or log out and create new.");
     }
  };

  if (isLoading) return <div className="bg-slate-950 h-screen w-screen flex items-center justify-center text-red-600">Loading...</div>;

  if (currentView === 'auth') {
    return <Auth onSuccess={handleAuthSuccess} />;
  }

  if (currentView === 'onboarding' && currentUser) {
    return <Onboarding initialUser={currentUser} onComplete={handleOnboardingComplete} />;
  }

  // Guard clause for main app
  if (!currentUser) return null;

  const relationship = storage.findRelationshipForUser(currentUser.id);
  const conflicts = storage.getConflicts().filter(c => c.relationshipId === relationship?.id).sort((a,b) => b.createdAt - a.createdAt);

  // Settings View (Inline for simplicity)
  const SettingsView = () => (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-black text-white mb-8">Settings</h1>
      
      <div className="bg-slate-900 p-6 rounded-lg mb-6 border border-slate-800">
         <h3 className="text-white font-bold mb-4">Debug / Testing</h3>
         <p className="text-slate-400 text-sm mb-4">
           Since this is a demo running in one browser, use this to switch between Partner A and Partner B to simulate the full conflict flow.
         </p>
         <button onClick={handleSwitchUser} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 border border-slate-700">
           <RefreshCw size={16}/> Switch User Profile
         </button>
      </div>

      <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
         <h3 className="text-white font-bold mb-4">Data Privacy</h3>
         <p className="text-slate-400 text-sm mb-4">
           All data is stored in your browser's LocalStorage. Gemini API is used for analysis but data is stateless.
         </p>
         <button 
           onClick={() => { localStorage.clear(); window.location.reload(); }}
           className="text-red-500 text-sm hover:underline"
         >
           Clear All Local Data (Reset App)
         </button>
      </div>
    </div>
  );
  
  // History View
  const HistoryView = () => (
     <div className="p-8 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-black text-white mb-8">Conflict History</h1>
        <div className="space-y-4">
           {conflicts.map(c => (
             <div key={c.id} className="bg-slate-900 p-6 rounded border border-slate-800">
                <div className="flex justify-between mb-2">
                   <span className="text-red-500 font-bold text-xs uppercase">{new Date(c.createdAt).toLocaleDateString()}</span>
                   <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${c.status === 'complete' ? 'bg-emerald-900/30 text-emerald-500' : 'bg-amber-900/30 text-amber-500'}`}>{c.status}</span>
                </div>
                <p className="text-white font-medium mb-2">{c.reportA.whatHappened}</p>
                {c.analysis ? (
                   <button className="text-sm text-slate-400 underline hover:text-white" onClick={() => {
                      // Logic to view past report - reusing session view in read-only mode would be ideal, 
                      // but for this iteration, we'll keep it simple or user can use 'Conflict Session' tab if active.
                      alert("To view detailed past analysis, this feature would open the Report View.");
                   }}>View Analysis Report</button>
                ) : (
                  <span className="text-xs text-slate-500 italic">Analysis pending completion</span>
                )}
             </div>
           ))}
           {conflicts.length === 0 && <p className="text-slate-500">No history found.</p>}
        </div>
     </div>
  );

  return (
    <div className={`flex min-h-screen ${APP_COLORS.background}`}>
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={handleLogout}
        userDisplayName={currentUser.displayName}
      />
      <main className="flex-1 ml-64 overflow-y-auto h-screen">
        {currentView === 'dashboard' && (
          <Dashboard 
             user={currentUser} 
             relationship={relationship} 
             recentConflicts={conflicts} 
             onNavigate={setCurrentView} 
          />
        )}
        {currentView === 'relationship' && (
          <RelationshipView 
             currentUser={currentUser} 
             relationship={relationship} 
             onUpdate={() => setCurrentView('dashboard')} 
          />
        )}
        {(currentView === 'conflict_active' || currentView === 'conflict_list') && (
           relationship ? (
             <ConflictSessionView 
                currentUser={currentUser} 
                relationship={relationship} 
                onClose={() => setCurrentView('dashboard')} 
             />
           ) : (
             <div className="p-10 text-center animate-fade-in">
                <h2 className="text-white text-xl mb-4 font-bold">No Relationship Connected</h2>
                <p className="text-slate-400 mb-6">You need to pair with a partner before starting a conflict session.</p>
                <button onClick={() => setCurrentView('relationship')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold">Connect a Partner</button>
             </div>
           )
        )}
        {currentView === 'history' && <HistoryView />}
        {currentView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
};

export default App;
