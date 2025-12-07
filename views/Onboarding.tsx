
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from '../components/ui/Button';
import { APP_COLORS } from '../constants';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { storage } from '../services/storage';

interface OnboardingProps {
  initialUser: UserProfile;
  onComplete: (user: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ initialUser, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>(initialUser);
  
  // Temporary string states for array fields
  const [triggersInput, setTriggersInput] = useState(initialUser.triggers.join('\n'));
  const [beliefsInput, setBeliefsInput] = useState(initialUser.coreBeliefs.join('\n'));
  const [traumasInput, setTraumasInput] = useState(initialUser.traumas.join('\n'));

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    const updatedUser: UserProfile = {
      ...formData,
      // Ensure arrays are processed from text areas
      triggers: triggersInput.split('\n').filter(s => s.trim()),
      coreBeliefs: beliefsInput.split('\n').filter(s => s.trim()),
      traumas: traumasInput.split('\n').filter(s => s.trim()),
      // Ensure critical defaults if missing
      languages: formData.languages || 'English',
      age: formData.age || 18,
    };
    
    storage.saveUser(updatedUser);
    onComplete(updatedUser);
  };

  const InputLabel = ({ title, sub }: { title: string, sub?: string }) => (
    <div className="mb-2">
      <label className="block text-sm font-bold text-slate-200 uppercase tracking-wide">{title}</label>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );

  const TextInput = ({ label, sub, value, onChange, placeholder, type = 'text' }: any) => (
    <div className="mb-6">
      <InputLabel title={label} sub={sub} />
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full p-3 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:border-red-600 focus:outline-none transition-colors`}
        placeholder={placeholder}
      />
    </div>
  );

  const TextArea = ({ label, sub, value, onChange, placeholder, rows = 4 }: any) => (
    <div className="mb-6">
      <InputLabel title={label} sub={sub} />
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className={`w-full p-3 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:border-red-600 focus:outline-none transition-colors font-mono text-sm`}
        placeholder={placeholder}
      />
    </div>
  );

  const Select = ({ label, options, value, onChange }: any) => (
    <div className="mb-6">
      <InputLabel title={label} />
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:border-red-600 focus:outline-none"
      >
        <option value="">Select...</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={`min-h-screen ${APP_COLORS.background} flex flex-col items-center justify-center p-6`}>
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter">
            Profile Intake <span className="text-slate-600">Step {step}/4</span>
          </h2>
          <ShieldCheck className="text-emerald-500" size={24} />
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-xl text-white mb-6 font-light">The Basics</h3>
            <div className="grid grid-cols-2 gap-4">
              <TextInput label="Display Name" value={formData.displayName} onChange={(v:any) => handleChange('displayName', v)} />
              <TextInput label="Age" type="number" value={formData.age === 0 ? '' : formData.age} onChange={(v:any) => handleChange('age', parseInt(v))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <TextInput label="Pronouns" value={formData.pronouns} onChange={(v:any) => handleChange('pronouns', v)} />
               <TextInput label="Location" value={formData.location} onChange={(v:any) => handleChange('location', v)} />
            </div>
            <TextInput label="Gender Identity" value={formData.genderIdentity} onChange={(v:any) => handleChange('genderIdentity', v)} />
            <TextInput label="Sexual Orientation" value={formData.sexualOrientation} onChange={(v:any) => handleChange('sexualOrientation', v)} />
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-xl text-white mb-6 font-light">Cultural & Relational Context</h3>
            <TextInput label="Cultural Background" sub="Religion, family upbringing structure" value={formData.culturalBackground} onChange={(v:any) => handleChange('culturalBackground', v)} />
            <TextInput label="Languages" value={formData.languages} onChange={(v:any) => handleChange('languages', v)} />
            
            <Select 
              label="Attachment Style"
              value={formData.attachmentStyle}
              onChange={(v:any) => handleChange('attachmentStyle', v)}
              options={[
                { value: 'secure', label: 'Secure' },
                { value: 'anxious', label: 'Anxious (Preoccupied)' },
                { value: 'avoidant', label: 'Avoidant (Dismissive)' },
                { value: 'disorganized', label: 'Disorganized (Fearful-Avoidant)' },
              ]}
            />

            <Select 
              label="Conflict Style"
              value={formData.conflictStyle}
              onChange={(v:any) => handleChange('conflictStyle', v)}
              options={[
                { value: 'fight', label: 'Fight (Aggressive / Defensive)' },
                { value: 'flight', label: 'Flight (Run away / Leave)' },
                { value: 'freeze', label: 'Freeze (Shut down / Silent treatment)' },
                { value: 'fawn', label: 'Fawn (Appease / People please)' },
              ]}
            />
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
             <h3 className="text-xl text-white mb-6 font-light">Triggers & Fears</h3>
             <TextArea 
               label="Trigger Library" 
               sub="List specific actions that set you off. One per line." 
               placeholder="e.g., Partner checking my phone&#10;Being ignored when I ask a question&#10;Raised voices"
               value={triggersInput}
               onChange={setTriggersInput}
               rows={6}
             />
             <TextArea 
               label="Deepest Fears / Traumas" 
               sub="What are you most afraid of in relationships? One per line." 
               placeholder="e.g., Being abandoned unexpectedly&#10;Being controlled financially&#10;Being humiliated in public"
               value={traumasInput}
               onChange={setTraumasInput}
               rows={6}
             />
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h3 className="text-xl text-white mb-6 font-light">Core Beliefs</h3>
             <TextArea 
               label="Core Beliefs about Self & Others" 
               sub="Deep rooted beliefs that drive your behavior. One per line." 
               placeholder="e.g., I am unlovable if I make mistakes&#10;People always leave eventually&#10;If I show weakness, it will be used against me"
               value={beliefsInput}
               onChange={setBeliefsInput}
               rows={8}
             />
             <div className="mt-8 p-4 bg-slate-950/50 border border-slate-800 rounded text-sm text-slate-400">
                <p>All data is encrypted locally. By proceeding, you agree to receive brutally honest analysis based on these inputs.</p>
             </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
          {step > 1 ? (
            <Button variant="secondary" onClick={handleBack}>Back</Button>
          ) : <div></div>}
          
          {step < 4 ? (
            <Button onClick={handleNext}>Next <ArrowRight size={18} /></Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700 text-white w-full max-w-xs">
              Complete Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
