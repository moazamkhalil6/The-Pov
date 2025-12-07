
import { UserProfile, Relationship, ConflictSession } from '../types';

// Simulating a backend with LocalStorage
const STORAGE_KEYS = {
  USERS: 'pov_users',
  RELATIONSHIPS: 'pov_relationships',
  CONFLICTS: 'pov_conflicts',
  CURRENT_USER_ID: 'pov_current_user_id',
};

export const storage = {
  // User Management
  getUsers: (): UserProfile[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },
  
  saveUser: (user: UserProfile) => {
    const users = storage.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    // If saving the current user, ensure session is valid
    if (localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) === user.id) {
       // update successful
    }
  },

  getCurrentUser: (): UserProfile | null => {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!id) return null;
    return storage.getUsers().find(u => u.id === id) || null;
  },

  setCurrentUserId: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  },

  // Auth
  login: (username: string, password: string): UserProfile => {
    const users = storage.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) throw new Error("Invalid username or password");
    
    storage.setCurrentUserId(user.id);
    return user;
  },

  register: (username: string, password: string): UserProfile => {
    const users = storage.getUsers();
    if (users.find(u => u.username === username)) {
      throw new Error("Username already exists");
    }

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      username,
      password,
      displayName: username, // Default to username initially
      pronouns: '',
      genderIdentity: '',
      sexualOrientation: '',
      age: 0,
      location: '',
      culturalBackground: '',
      languages: 'English',
      attachmentStyle: 'secure',
      conflictStyle: 'freeze',
      triggers: [],
      coreBeliefs: [],
      traumas: []
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    storage.setCurrentUserId(newUser.id);
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    window.location.reload();
  },

  // Relationship Management
  getRelationships: (): Relationship[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RELATIONSHIPS) || '[]');
  },

  saveRelationship: (rel: Relationship) => {
    const rels = storage.getRelationships();
    const index = rels.findIndex(r => r.id === rel.id);
    if (index >= 0) rels[index] = rel;
    else rels.push(rel);
    localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify(rels));
  },

  findRelationshipForUser: (userId: string): Relationship | null => {
    const rels = storage.getRelationships();
    return rels.find(r => r.partnerAId === userId || r.partnerBId === userId) || null;
  },

  // Conflict Management
  getConflicts: (): ConflictSession[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFLICTS) || '[]');
  },

  saveConflict: (conflict: ConflictSession) => {
    const conflicts = storage.getConflicts();
    const index = conflicts.findIndex(c => c.id === conflict.id);
    if (index >= 0) conflicts[index] = conflict;
    else conflicts.push(conflict);
    localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(conflicts));
  },

  getConflictById: (id: string): ConflictSession | undefined => {
    return storage.getConflicts().find(c => c.id === id);
  }
};
