import { POST } from '../auth/register/route';
import { NextRequest } from 'next/server';

describe('Auth Regression Tests', () => {
  it('should successfully register with valid, compliant data', async () => {
    // This data meets all your new validation criteria:
    // 1. Name: No invalid characters
    // 2. Email: Valid format
    // 3. Password: Upper + Lower + Digit
    const validUser = {
      name: "Swarup Patil",
      email: "test@example.com",
      password: "Password123",
      utmData: {
        utm_source: "google",
        utm_medium: "cpc"
      }
    };

    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validUser),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    const data = await response.json();

    // Expecting 200 OK because the data is now strictly valid
    expect(response.status).toBe(200);
  });

  it('should reject invalid password (too simple)', async () => {
    const invalidUser = {
      name: "Swarup Patil",
      email: "test@example.com",
      password: "password123" // Missing Uppercase
    };

    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidUser),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    // Should fail validation because of password regex
    expect(response.status).toBe(500); 
  });
});