import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  HeartHandshake, 
  Zap, 
  History, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { APP_COLORS } from '../constants';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLogout: () => void;
  userDisplayName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, userDisplayName }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1
        ${currentView === view 
          ? 'bg-red-900/30 text-red-400 border-l-2 border-red-500' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm tracking-wide">{label}</span>
    </button>
  );

  return (
    <aside className={`w-64 h-screen ${APP_COLORS.sidebar} border-r ${APP_COLORS.border} flex flex-col fixed left-0 top-0 overflow-y-auto z-50`}>
      <div className="p-6">
        <h1 className="text-2xl font-black text-red-600 tracking-tighter uppercase mb-1">The Pov</h1>
        <p className="text-xs text-slate-500 font-mono">CONFLICT ENGINE v1.0</p>
      </div>

      <nav className="flex-1 px-3">
        <div className="mb-4">
           <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Main</p>
           <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
           <NavItem view="conflict_list" icon={Zap} label="Conflict Session" />
        </div>
        
        <div className="mb-4">
           <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Context</p>
           <NavItem view="relationship" icon={HeartHandshake} label="Relationship" />
           <NavItem view="history" icon={History} label="History" />
        </div>

        <div>
           <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">System</p>
           <NavItem view="settings" icon={Settings} label="Settings" />
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-red-900 flex items-center justify-center text-red-200 font-bold text-xs">
            {userDisplayName.substring(0,2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{userDisplayName}</p>
            <p className="text-xs text-slate-500">Online • Encrypted</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-950 text-slate-400 hover:text-red-400 text-xs font-bold border border-slate-800 transition-colors"
        >
          <LogOut size={14} />
          LOGOUT
        </button>
      </div>
    </aside>
  );
};
