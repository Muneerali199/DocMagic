export interface StandardAIResponse<T = any> {
  success: boolean;       
  data: T | null;         
  error?: string;         
  metadata?: {
    generatedAt: string;  
    model: string;        
  };
}