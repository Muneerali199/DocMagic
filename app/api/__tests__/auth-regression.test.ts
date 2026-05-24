import { POST } from '../auth/register/route';
import { NextRequest } from 'next/server';

// Mock Environment Variables
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost';

jest.mock('@/lib/supabase/server', () => ({
  createRoute: jest.fn(() => ({
    auth: {
      signUp: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })
    }
  }))
}));

describe('Auth Regression Tests', () => {
  it('should successfully register with valid, compliant data', async () => {
    const validUser = {
      name: "Swarup Patil",
      email: "test@example.com",
      password: "Password123" // Explicitly keeping this format
    };

    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validUser),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
  });
});