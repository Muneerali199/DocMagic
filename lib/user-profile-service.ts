import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages?: string[];
  created_at: string;
  updated_at: string;
}

export interface ExperienceItem {
  id?: string;
  company: string;
  position: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
  achievements?: string[];
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  location?: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  achievements?: string[];
}

export interface ProjectItem {
  id?: string;
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  github_url?: string;
  start_date?: string;
  end_date?: string;
}

export interface CertificationItem {
  id?: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export class UserProfileService {
  private supabase = createClient();

  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  /**
   * Create or update user profile
   */
  async upsertUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .upsert(profile, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error upserting user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertUserProfile:', error);
      return null;
    }
  }

  /**
   * Auto-fill resume data from user profile
   */
  autoFillFromProfile(profile: UserProfile): any {
    return {
      personalInfo: {
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        linkedin: profile.linkedin || '',
        portfolio: profile.portfolio || '',
        github: profile.github || '',
        summary: profile.summary || '',
      },
      experience: profile.experience || [],
      education: profile.education || [],
      skills: profile.skills || [],
      projects: profile.projects || [],
      certifications: profile.certifications || [],
      languages: profile.languages || [],
    };
  }

  /**
   * Save resume data to user profile
   */
  async saveResumeToProfile(userId: string, resumeData: any): Promise<boolean> {
    try {
      const profileData: Partial<UserProfile> = {
        user_id: userId,
        full_name: resumeData.personalInfo?.fullName || '',
        email: resumeData.personalInfo?.email || '',
        phone: resumeData.personalInfo?.phone,
        location: resumeData.personalInfo?.location,
        linkedin: resumeData.personalInfo?.linkedin,
        portfolio: resumeData.personalInfo?.portfolio,
        github: resumeData.personalInfo?.github,
        summary: resumeData.personalInfo?.summary,
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        skills: resumeData.skills || [],
        projects: resumeData.projects || [],
        certifications: resumeData.certifications || [],
        languages: resumeData.languages || [],
        updated_at: new Date().toISOString(),
      };

      const result = await this.upsertUserProfile(profileData);
      return result !== null;
    } catch (error) {
      console.error('Error in saveResumeToProfile:', error);
      return false;
    }
  }
}

export const userProfileService = new UserProfileService();
