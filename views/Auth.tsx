
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { storage } from '../services/storage';
import { UserProfile } from '../types';
import { APP_COLORS } from '../constants';
import { AlertTriangle, Lock, ArrowRight, UserPlus } from 'lucide-react';

interface AuthProps {
  onSuccess: (user: UserProfile) => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        const user = storage.login(username, password);
        onSuccess(user);
      } else {
        if (!username || !password) throw new Error("Please fill all fields");
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        if (password.length < 4) throw new Error("Password is too short");
        
        const user = storage.register(username, password);
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <div className={`min-h-screen ${APP_COLORS.background} flex flex-col items-center justify-center p-6 relative overflow-hidden`}>
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-900 via-red-600 to-red-900"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-slate-800/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">The Pov</h1>
          <p className="text-slate-400 text-sm font-mono tracking-wide">RELATIONSHIP CONFLICT ENGINE</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg mb-8 border border-slate-800">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            LOGIN
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${!isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-950/50 border border-red-900 text-red-200 p-3 rounded text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-red-600 outline-none transition-colors"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-red-600 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white focus:border-red-600 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>

          <Button className="w-full bg-red-700 hover:bg-red-800 text-white shadow-lg shadow-red-900/20" disabled={!username || !password}>
            {isLogin ? (
              <>Enter Engine <ArrowRight size={18} /></>
            ) : (
              <>Sign Up <UserPlus size={18} /></>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            <Lock size={12} className="inline mr-1" />
            End-to-End Encrypted Environment
          </p>
        </div>
      </div>
    </div>
  );
};
