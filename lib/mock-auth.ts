// Mock authentication for development environment
export const mockUser = {
  id: 'mock-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  aud: 'authenticated',
  role: 'authenticated'
}

// Mock session for development
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser
}

// Check if we're in development mode without real Supabase credentials
export const isDevelopmentMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || url.includes('mock') || !key || key.includes('mock')
}

// Mock authentication functions for development
export const mockAuth = {
  async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
    if (isDevelopmentMode()) {
      return {
        data: { user: mockUser, session: mockSession },
        error: null
      }
    }
    throw new Error('Mock auth only available in development mode')
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    if (isDevelopmentMode()) {
      // Store mock session in localStorage for client-side persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock-session', JSON.stringify(mockSession))
      }
      return {
        data: { user: mockUser, session: mockSession },
        error: null
      }
    }
    throw new Error('Mock auth only available in development mode')
  },

  async signOut() {
    if (isDevelopmentMode()) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock-session')
      }
      return { error: null }
    }
    throw new Error('Mock auth only available in development mode')
  },

  async getSession() {
    if (isDevelopmentMode()) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mock-session')
        if (stored) {
          return { data: { session: JSON.parse(stored) }, error: null }
        }
      }
      return { data: { session: null }, error: null }
    }
    throw new Error('Mock auth only available in development mode')
  },

  async getUser() {
    if (isDevelopmentMode()) {
      const sessionResult = await this.getSession()
      return {
        data: { user: sessionResult.data.session?.user || null },
        error: null
      }
    }
    throw new Error('Mock auth only available in development mode')
  },

  // Add auth state change listener mock
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (isDevelopmentMode()) {
      // Simulate auth state change in development
      setTimeout(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('mock-session') : null
        if (stored) {
          callback('SIGNED_IN', JSON.parse(stored))
        } else {
          callback('SIGNED_OUT', null)
        }
      }, 100)
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    }
    throw new Error('Mock auth only available in development mode')
  }
}
