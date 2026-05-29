export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GenerateResumeRequest {
  prompt: string;
  template?: string;
}

export interface GenerateResumeResponse {
  resume: string;
}

export interface GenerateLetterRequest {
  subject: string;
  content: string;
}

export interface GenerateLetterResponse {
  letter: string;
}