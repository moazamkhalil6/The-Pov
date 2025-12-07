
export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganized';
export type ConflictStyle = 'fight' | 'flight' | 'freeze' | 'fawn';

export interface UserProfile {
  id: string;
  username?: string; // Auth field
  password?: string; // Auth field
  displayName: string;
  pronouns: string;
  genderIdentity: string;
  sexualOrientation: string;
  age: number;
  location: string;
  culturalBackground: string;
  languages: string;
  attachmentStyle: AttachmentStyle;
  conflictStyle: ConflictStyle;
  triggers: string[];
  coreBeliefs: string[];
  traumas: string[];
  avatarColor?: string;
}

export interface Relationship {
  id: string;
  partnerAId: string;
  partnerBId: string | null;
  status: 'pending' | 'active';
  connectionCode: string;
  type: string; // e.g., Monogamous, Open
  relationalStatus: string; // e.g., Married, Dating
  outnessLevel: string;
  agreements: string[];
}

export interface ConflictEntry {
  whatHappened: string;
  reaction: string;
  feelings: string;
  trigger: string;
  partnerAwareness: 'yes' | 'no' | 'unsure';
}

export interface AnalysisResult {
  partnerA_analysis: {
    summary: string;
    distortions: string[];
    hardTruth: string;
    fairPoints: string;
  };
  partnerB_analysis: {
    summary: string;
    distortions: string[];
    hardTruth: string;
    fairPoints: string;
  };
  resolution: {
    immediateSteps: string[];
    longTermWork: string;
    safetyWarning?: string;
  };
}

export type ConflictStatus = 
  | 'draft_a'       // A is writing
  | 'pending_b'     // Waiting for B
  | 'draft_b'       // B is writing
  | 'review_a'      // A reviews B's input & adds support info
  | 'confirm_b'     // B confirms context
  | 'analyzing'     // AI processing
  | 'complete';     // Done

export interface ConflictSession {
  id: string;
  relationshipId: string;
  initiatorId: string; // User A
  responderId: string | null; // User B
  createdAt: number;
  status: ConflictStatus;
  reportA: ConflictEntry;
  reportB?: ConflictEntry;
  amendmentA?: string; // A's final notes/amendments after reading B
  analysis?: AnalysisResult;
}

export type ViewState = 'auth' | 'onboarding' | 'dashboard' | 'relationship' | 'conflict_list' | 'conflict_active' | 'history' | 'settings';
