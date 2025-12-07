import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { UserProfile, Relationship, ConflictSession, ConflictEntry } from '../types';
import { Button } from '../components/ui/Button';
import { AlertTriangle, Check, Lock, ChevronRight, RefreshCcw, AlertOctagon } from 'lucide-react';
import { storage } from '../services/storage';
import { analyzeConflict } from '../services/gemini';
import { INITIAL_CONFLICT_ENTRY } from '../constants';

interface ConflictSessionProps {
  currentUser: UserProfile;
  relationship: Relationship;
  onClose: () => void;
}

export const ConflictSessionView: React.FC<ConflictSessionProps> = ({ currentUser, relationship, onClose }) => {
  // Try to find active session or create state for new one
  const [session, setSession] = useState<ConflictSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<ConflictEntry>(INITIAL_CONFLICT_ENTRY);
  const [amendment, setAmendment] = useState('');
  
  // Load Partner Profile (for display context)
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check for existing active sessions
    const conflicts = storage.getConflicts();
    const active = conflicts.find(c => 
      c.relationshipId === relationship.id && c.status !== 'complete'
    );
    
    if (active) {
      setSession(active);
    } else {
      // Create new Draft
      const newSession: ConflictSession = {
        id: crypto.randomUUID(),
        relationshipId: relationship.id,
        initiatorId: currentUser.id,
        responderId: relationship.partnerAId === currentUser.id ? relationship.partnerBId : relationship.partnerAId,
        createdAt: Date.now(),
        status: 'draft_a',
        reportA: { ...INITIAL_CONFLICT_ENTRY }
      };
      setSession(newSession);
    }

    // Load Partner
    const partnerId = relationship.partnerAId === currentUser.id ? relationship.partnerBId : relationship.partnerAId;
    if (partnerId) {
       const users = storage.getUsers();
       const p = users.find(u => u.id === partnerId);
       if (p) setPartnerProfile(p);
    }
  }, [relationship.id, currentUser.id]);

  const updateField = (field: keyof ConflictEntry, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveStep = (nextStatus: any) => {
    if (!session) return;
    const updated = { ...session };
    
    if (session.status === 'draft_a') {
      updated.reportA = formData;
      updated.status = 'pending_b';
    } else if (session.status === 'draft_b') {
      updated.reportB = formData;
      updated.status = 'review_a';
    } else if (session.status === 'review_a') {
      updated.amendmentA = amendment;
      updated.status = 'confirm_b';
    } else if (session.status === 'confirm_b') {
      updated.status = 'analyzing';
    }

    setSession(updated);
    storage.saveConflict(updated);
  };

  const runAnalysis = async () => {
    if (!session || !session.reportB || !partnerProfile) return;
    
    setLoading(true);
    setError(null);

    try {
      // Determine who is A and B in user objects. 
      // session.initiatorId is A.
      const users = storage.getUsers();
      const userA = users.find(u => u.id === session.initiatorId)!;
      const userB = users.find(u => u.id === session.responderId)!;

      const result = await analyzeConflict(session, userA, userB);
      
      const completedSession = {
        ...session,
        status: 'complete' as const,
        analysis: result
      };
      setSession(completedSession);
      storage.saveConflict(completedSession);

    } catch (err) {
      setError("Analysis failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // RENDER HELPERS
  const InputSection = ({ label, desc, field, placeholder, textarea = false }: any) => (
    <div className="mb-6 animate-fade-in-up">
      <label className="block text-red-100 font-bold mb-1">{label}</label>
      <p className="text-slate-400 text-xs mb-2">{desc}</p>
      {textarea ? (
        <textarea 
          className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-100 focus:border-red-500 outline-none min-h-[100px]"
          placeholder={placeholder}
          value={formData[field as keyof ConflictEntry]}
          onChange={(e) => updateField(field as keyof ConflictEntry, e.target.value)}
        />
      ) : (
        <input 
           className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-100 focus:border-red-500 outline-none"
           placeholder={placeholder}
           value={formData[field as keyof ConflictEntry]}
           onChange={(e) => updateField(field as keyof ConflictEntry, e.target.value)}
        />
      )}
    </div>
  );

  const DisplayReport = ({ report, title }: { report: ConflictEntry, title: string }) => (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 mb-6">
      <h4 className="text-red-500 font-bold uppercase tracking-wider text-sm mb-4 border-b border-slate-800 pb-2">{title}</h4>
      <div className="space-y-4">
        <div><span className="text-slate-500 text-xs uppercase block">What Happened</span><p className="text-slate-200">{report.whatHappened}</p></div>
        <div><span className="text-slate-500 text-xs uppercase block">Reaction</span><p className="text-slate-200">{report.reaction}</p></div>
        <div><span className="text-slate-500 text-xs uppercase block">Feelings</span><p className="text-slate-200">{report.feelings}</p></div>
        <div><span className="text-slate-500 text-xs uppercase block">Trigger</span><p className="text-slate-200">{report.trigger}</p></div>
      </div>
    </div>
  );

  const AnalysisCard = ({ title, data }: { title: string, data: any }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
      <h3 className="text-xl font-black text-white mb-4 border-b border-red-900 pb-2">{title}</h3>
      <p className="text-slate-300 mb-4 italic">"{data.summary}"</p>
      
      <div className="mb-4">
        <h4 className="text-red-400 font-bold text-sm uppercase mb-2">Cognitive Distortions Detected</h4>
        <div className="flex flex-wrap gap-2">
          {data.distortions.length > 0 ? data.distortions.map((d: string, i: number) => (
            <span key={i} className="px-2 py-1 bg-red-950 text-red-200 text-xs rounded border border-red-900">{d}</span>
          )) : <span className="text-slate-500 text-sm">None detected.</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-950/20 p-4 rounded border border-red-900/30">
          <h4 className="text-red-500 font-bold text-sm uppercase mb-2 flex items-center gap-2">
             <AlertOctagon size={14}/> Hard Truth
          </h4>
          <p className="text-slate-200 text-sm leading-relaxed">{data.hardTruth}</p>
        </div>
        <div className="bg-emerald-950/20 p-4 rounded border border-emerald-900/30">
          <h4 className="text-emerald-500 font-bold text-sm uppercase mb-2 flex items-center gap-2">
             <Check size={14}/> Fair Points
          </h4>
          <p className="text-slate-200 text-sm leading-relaxed">{data.fairPoints}</p>
        </div>
      </div>
    </div>
  );


  if (!session) return <div className="text-white p-10">Initializing...</div>;

  // -- STATE 1: Initiator Input --
  if (session.status === 'draft_a' && currentUser.id === session.initiatorId) {
    return (
      <div className="max-w-3xl mx-auto p-6 animate-fade-in">
        <h2 className="text-2xl font-black text-white mb-6">Report a Concern</h2>
        <InputSection field="whatHappened" label="What happened?" desc="Describe facts as if to a judge. No mind-reading." placeholder="e.g., We were in the kitchen and..." textarea />
        <InputSection field="reaction" label="Your reaction?" desc="What did you do/say in response?" placeholder="e.g., I walked away and slammed the door." />
        <InputSection field="feelings" label="Your feelings?" desc="Use emotional words, not thoughts." placeholder="e.g., I felt dismissed and small." />
        <InputSection field="trigger" label="Trigger?" desc="What specifically set you off?" placeholder="e.g., Raised voice." />
        
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => handleSaveStep('pending_b')} disabled={!formData.whatHappened}>Submit to Partner</Button>
        </div>
      </div>
    );
  }

  // -- STATE: Waiting for Partner --
  if ((session.status === 'pending_b' && currentUser.id === session.initiatorId) || 
      (session.status === 'draft_a' && currentUser.id !== session.initiatorId)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
        <Lock className="text-slate-600 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-white mb-2">Waiting for Partner</h2>
        <p className="text-slate-400">Your report is locked. Your partner needs to respond from their account.</p>
        <Button variant="secondary" className="mt-6" onClick={onClose}>Return to Dashboard</Button>
      </div>
    );
  }

  // -- STATE 2: Responder Input --
  if ((session.status === 'pending_b' || session.status === 'draft_b') && currentUser.id === session.responderId) {
     if (session.status === 'pending_b') {
        // Switch local state to draft_b immediately on render if not already
        const upd = { ...session, status: 'draft_b' as const };
        setSession(upd);
        storage.saveConflict(upd);
     }
     
     return (
       <div className="max-w-3xl mx-auto p-6 animate-fade-in">
         <h2 className="text-2xl font-black text-white mb-4">Your Perspective</h2>
         <div className="bg-slate-900 p-4 rounded mb-8 border border-slate-800 opacity-75">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Partner said:</h4>
            <p className="text-slate-300 italic">"{session.reportA.whatHappened}"</p>
         </div>

         <InputSection field="whatHappened" label="What happened (your POV)?" desc="Stick to facts." placeholder="e.g., I was trying to explain..." textarea />
         <InputSection field="reaction" label="Your reaction?" desc="Your behaviors." placeholder="e.g., I kept talking louder." />
         <InputSection field="feelings" label="Your feelings?" desc="Emotions." placeholder="e.g., I felt unheard." />
         <InputSection field="trigger" label="Trigger?" desc="What triggered you?" placeholder="e.g., Being ignored." />

         <div className="flex justify-end gap-4 mt-8">
            <Button onClick={() => handleSaveStep('review_a')} disabled={!formData.whatHappened}>Submit Perspective</Button>
         </div>
       </div>
     );
  }

  // -- STATE 3: Initiator Review --
  if (session.status === 'review_a' && currentUser.id === session.initiatorId) {
     return (
       <div className="max-w-4xl mx-auto p-6 animate-fade-in">
          <h2 className="text-2xl font-black text-white mb-6">Review & Amend</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <DisplayReport title="Your Report" report={session.reportA} />
             {session.reportB && <DisplayReport title="Partner's Perspective" report={session.reportB} />}
          </div>
          
          <div className="mt-6">
             <label className="block text-red-100 font-bold mb-2">Add Support Info / Amendments</label>
             <p className="text-slate-400 text-xs mb-2">Read their side. Is there context missing? Add it here. You cannot change your original text, only add context.</p>
             <textarea 
               className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-100 h-32"
               value={amendment}
               onChange={(e) => setAmendment(e.target.value)}
             />
          </div>

          <div className="flex justify-end mt-8">
             <Button onClick={() => handleSaveStep('confirm_b')}>Submit Amendment</Button>
          </div>
       </div>
     );
  }

  // -- STATE 4: Responder Confirm --
  if (session.status === 'confirm_b' && currentUser.id === session.responderId) {
      return (
        <div className="max-w-3xl mx-auto p-6 animate-fade-in">
           <h2 className="text-2xl font-black text-white mb-6">Final Confirmation</h2>
           <p className="text-slate-300 mb-6">Review the final context. Once you agree, the CBT Engine will analyze both sides.</p>
           
           <div className="bg-slate-950 border border-slate-800 p-4 rounded mb-4">
              <h4 className="text-red-400 text-xs font-bold uppercase mb-2">Partner's Final Note</h4>
              <p className="text-white">{session.amendmentA || "No amendments added."}</p>
           </div>

           <div className="flex justify-end gap-4 mt-8">
              <Button onClick={() => handleSaveStep('analyzing')}>Agree & Run Analysis</Button>
           </div>
        </div>
      );
  }

  // -- STATE 5: Waiting (for other user) --
  if ((session.status === 'review_a' && currentUser.id === session.responderId) ||
      (session.status === 'confirm_b' && currentUser.id === session.initiatorId)) {
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
            <RefreshCcw className="text-slate-600 mb-4 animate-spin-slow" size={48} />
            <h2 className="text-2xl font-bold text-white mb-2">Pending Partner Action</h2>
            <p className="text-slate-400">Please wait for your partner to complete their step.</p>
            <Button variant="secondary" className="mt-6" onClick={onClose}>Return to Dashboard</Button>
          </div>
        );
  }

  // -- STATE 6: Analysis Trigger (Either can trigger if status is analyzing) --
  if (session.status === 'analyzing') {
     return (
       <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
          <h2 className="text-3xl font-black text-white mb-4">Ready for Analysis</h2>
          <p className="text-slate-400 max-w-md mb-8">Both partners have submitted and agreed to the context. The engine will now deconstruct the conflict.</p>
          
          {error && <div className="text-red-500 mb-4 bg-red-950/20 p-3 rounded">{error}</div>}
          
          <Button onClick={runAnalysis} isLoading={loading} className="w-64">
             {loading ? 'Analyzing...' : 'Generate CBT Report'}
          </Button>
       </div>
     );
  }

  // -- STATE 7: Complete --
  if (session.status === 'complete' && session.analysis) {
     return (
       <div className="max-w-5xl mx-auto p-6 animate-fade-in pb-20">
          <div className="flex items-center justify-between mb-8">
             <h1 className="text-3xl font-black text-white">Conflict Analysis Report</h1>
             <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>

          {session.analysis.resolution.safetyWarning && (
            <div className="bg-red-900/80 text-white p-4 rounded-lg mb-8 flex items-start gap-4 border border-red-500">
               <AlertTriangle size={24} className="shrink-0" />
               <div>
                  <h4 className="font-bold uppercase">Safety Warning</h4>
                  <p className="text-sm">{session.analysis.resolution.safetyWarning}</p>
               </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
             <AnalysisCard title={`Analysis: ${currentUser.id === session.initiatorId ? 'You' : 'Partner'}`} 
               data={currentUser.id === session.initiatorId ? session.analysis.partnerA_analysis : session.analysis.partnerB_analysis} />
             
             <AnalysisCard title={`Analysis: ${currentUser.id === session.initiatorId ? 'Partner' : 'You'}`} 
               data={currentUser.id === session.initiatorId ? session.analysis.partnerB_analysis : session.analysis.partnerA_analysis} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
             <h3 className="text-2xl font-bold text-white mb-6">Path Forward</h3>
             
             <div className="mb-8">
               <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Immediate Steps</h4>
               <ul className="space-y-3">
                 {session.analysis.resolution.immediateSteps.map((step, i) => (
                   <li key={i} className="flex items-start gap-3 text-slate-200">
                     <ChevronRight className="text-red-500 mt-1 shrink-0" size={16} />
                     {step}
                   </li>
                 ))}
               </ul>
             </div>

             <div>
               <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Long Term Work</h4>
               <p className="text-slate-300 leading-relaxed">{session.analysis.resolution.longTermWork}</p>
             </div>
          </div>
       </div>
     );
  }

  return <div>State Error</div>;
};
