import React, { useState } from 'react';
import { UserProfile, Relationship } from '../types';
import { Button } from '../components/ui/Button';
import { Copy, CheckCircle, RefreshCw } from 'lucide-react';
import { storage } from '../services/storage';

interface RelationshipProps {
  currentUser: UserProfile;
  relationship: Relationship | null;
  onUpdate: () => void;
}

export const RelationshipView: React.FC<RelationshipProps> = ({ currentUser, relationship, onUpdate }) => {
  const [connectCode, setConnectCode] = useState('');

  const createRelationship = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRel: Relationship = {
      id: crypto.randomUUID(),
      partnerAId: currentUser.id,
      partnerBId: null,
      status: 'pending',
      connectionCode: code,
      type: 'Monogamous',
      relationalStatus: 'Dating',
      outnessLevel: 'Private',
      agreements: ['No yelling', 'Timeouts allowed'],
    };
    storage.saveRelationship(newRel);
    onUpdate();
  };

  const joinRelationship = () => {
    // In a real app, this would query the DB. Here we search local storage mocks.
    const allRels = storage.getRelationships();
    const target = allRels.find(r => r.connectionCode === connectCode && r.status === 'pending');
    
    if (target) {
      target.partnerBId = currentUser.id;
      target.status = 'active';
      storage.saveRelationship(target);
      onUpdate();
    } else {
      alert("Invalid code or relationship not found.");
    }
  };

  if (relationship) {
    return (
      <div className="p-8 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-black text-white mb-8">Relationship Context</h1>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide font-bold">Status</p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${relationship.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <p className="text-xl text-white font-medium capitalize">{relationship.status}</p>
              </div>
            </div>
            {relationship.status === 'pending' && (
               <div className="bg-slate-950 p-4 rounded border border-dashed border-slate-700 text-center">
                 <p className="text-xs text-slate-500 mb-1">Share this code with your partner:</p>
                 <p className="text-2xl font-mono font-bold text-red-500 tracking-widest">{relationship.connectionCode}</p>
               </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-4 bg-slate-950 rounded border border-slate-800">
               <p className="text-sm text-slate-500 mb-1">Structure</p>
               <p className="text-white font-medium">{relationship.type}</p>
             </div>
             <div className="p-4 bg-slate-950 rounded border border-slate-800">
               <p className="text-sm text-slate-500 mb-1">Stage</p>
               <p className="text-white font-medium">{relationship.relationalStatus}</p>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Non-Negotiable Agreements</h2>
          <div className="space-y-2">
            {relationship.agreements.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded border-l-4 border-emerald-600">
                <CheckCircle size={16} className="text-emerald-500" />
                <span className="text-slate-300">{rule}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">Agreements help the conflict engine understand your boundaries.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <h1 className="text-3xl font-black text-white mb-6 text-center">Connect with Partner</h1>
      
      <div className="w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <div className="mb-8 text-center">
          <h3 className="text-xl text-white font-bold mb-2">Create New Connection</h3>
          <p className="text-slate-400 text-sm mb-4">Generate a secure code to invite your partner.</p>
          <Button onClick={createRelationship} className="w-full">Generate Invite Code</Button>
        </div>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">OR</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <div className="mt-4 text-center">
          <h3 className="text-xl text-white font-bold mb-2">Join Existing</h3>
          <p className="text-slate-400 text-sm mb-4">Enter the code provided by your partner.</p>
          <input 
            type="text" 
            placeholder="ENTER CODE" 
            value={connectCode}
            onChange={(e) => setConnectCode(e.target.value.toUpperCase())}
            className="w-full p-3 bg-slate-950 border border-slate-700 rounded text-center text-xl tracking-widest text-white mb-4 uppercase placeholder:text-slate-700"
          />
          <Button variant="secondary" onClick={joinRelationship} className="w-full" disabled={!connectCode}>
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
};
