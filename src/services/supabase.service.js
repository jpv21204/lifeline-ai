import { createClient } from '@supabase/supabase-js';

const getEnvVar = (name) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
      if (import.meta.env[name]) return import.meta.env[name];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[name]) return process.env[name];
    }
  } catch {}
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export class SupabaseService {
  constructor() {
    this.isConfigured = isSupabaseConfigured;
    if (this.isConfigured) {
      console.log('[SupabaseService] Initialized with Supabase backend.');
    } else {
      console.warn('[SupabaseService] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set. Using LocalStorage fallback.');
    }
  }

  // ==========================================
  // Auth Operations
  // ==========================================

  async signUp({ email, password, fullName, phone }) {
    if (!this.isConfigured) {
      return { user: { id: `local_${Date.now()}`, email, fullName, phone }, session: null, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone }
        }
      });
      if (error) throw error;

      if (data.user) {
        await this.saveUserProfile({
          userId: data.user.id,
          fullName,
          email,
          phone
        });
      }
      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      console.warn('[SupabaseService] SignUp error:', err.message);
      return { user: null, session: null, error: err };
    }
  }

  async signIn({ email, password }) {
    if (!this.isConfigured) {
      return { user: { email }, session: null, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      console.warn('[SupabaseService] SignIn error:', err.message);
      return { user: null, session: null, error: err };
    }
  }

  async signOut() {
    if (this.isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[SupabaseService] SignOut error:', err.message);
      }
    }
  }

  // ==========================================
  // Profile Operations
  // ==========================================

  async saveUserProfile(profileData) {
    const userId = profileData.userId || profileData.email || 'guest';
    const row = {
      user_id: userId,
      full_name: profileData.fullName || profileData.name || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      age: profileData.age ? parseInt(profileData.age, 10) : null,
      gender: profileData.gender || '',
      location: profileData.location || '',
      state: profileData.state || 'Telangana',
      language: profileData.language || 'en',
      income: profileData.income || '',
      occupation: profileData.occupation || '',
      existing_conditions: profileData.existingConditions || '',
      updated_at: new Date().toISOString()
    };

    if (this.isConfigured) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert(row, { onConflict: 'user_id' });

        if (error) console.warn('[SupabaseService] Save profile error:', error.message);
      } catch (err) {
        console.warn('[SupabaseService] Save profile exception:', err.message);
      }
    }

    // Always update LocalStorage cache
    try {
      localStorage.setItem('lifeline_profile', JSON.stringify(profileData));
    } catch {}
  }

  async fetchUserProfile(userId) {
    if (this.isConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          return {
            userId: data.user_id,
            name: data.full_name,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            age: data.age || '',
            gender: data.gender || '',
            location: data.location || '',
            state: data.state || 'Telangana',
            language: data.language || 'en',
            income: data.income || '',
            occupation: data.occupation || '',
            existingConditions: data.existing_conditions || ''
          };
        }
      } catch (err) {
        console.warn('[SupabaseService] Fetch profile error:', err.message);
      }
    }

    // Fallback to LocalStorage
    try {
      const saved = localStorage.getItem('lifeline_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  }

  // ==========================================
  // Consultation / Medical History Operations
  // ==========================================

  async saveConsultation(consultationData, userId = 'guest') {
    const row = {
      user_id: userId,
      symptoms: consultationData.symptoms || '',
      urgency: String(consultationData.urgency || 'Low'),
      summary: consultationData.summary || '',
      action_plan: consultationData.actionPlan || {},
      agent_results: consultationData.agentResults || {},
      response_time: consultationData.responseTime || 0,
      created_at: consultationData.timestamp || new Date().toISOString()
    };

    if (this.isConfigured) {
      try {
        const { data, error } = await supabase
          .from('consultations')
          .insert([row])
          .select();

        if (error) console.warn('[SupabaseService] Save consultation error:', error.message);
        else console.log('[SupabaseService] Consultation saved to Supabase:', data);
      } catch (err) {
        console.warn('[SupabaseService] Save consultation exception:', err.message);
      }
    }
  }

  async fetchMedicalHistory(userId = 'guest') {
    if (this.isConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('consultations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map(item => ({
            id: item.id,
            timestamp: item.created_at,
            symptoms: item.symptoms,
            urgency: item.urgency,
            summary: item.summary,
            actionPlan: item.action_plan,
            agentResults: item.agent_results,
            responseTime: item.response_time
          }));
        }
      } catch (err) {
        console.warn('[SupabaseService] Fetch medical history error:', err.message);
      }
    }

    // Fallback to LocalStorage
    try {
      const saved = localStorage.getItem('lifeline_medical_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }

  async clearMedicalHistory(userId = 'guest') {
    if (this.isConfigured && userId) {
      try {
        const { error } = await supabase
          .from('consultations')
          .delete()
          .eq('user_id', userId);

        if (error) console.warn('[SupabaseService] Clear medical history error:', error.message);
      } catch (err) {
        console.warn('[SupabaseService] Clear medical history exception:', err.message);
      }
    }

    try {
      localStorage.removeItem('lifeline_medical_history');
    } catch {}
  }
}

export const supabaseService = new SupabaseService();
