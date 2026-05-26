import {
  reserveCredits,
  refundCredits,
  creditReservationConflictResponse,
  type UserCreditsRow,
} from '@/lib/credit-operations';
import type { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase mock factory
//
// All three functions use the Supabase query builder with a chained API:
//   .from(table).update(data).eq(col, val).eq(col, val).select().maybeSingle()
//   .from(table).select(cols).eq(col, val).single()
//
// The builder mock makes every intermediate method return itself so any
// chain length works. Only the terminal methods (single, maybeSingle) are
// configured per-test.
// ---------------------------------------------------------------------------
function buildSupabaseMock() {
  const terminal = {
    maybeSingle: jest.fn(),
    single: jest.fn(),
  };

  const builder: Record<string, jest.Mock> = {};
  for (const method of ['select', 'update', 'eq', 'insert']) {
    builder[method] = jest.fn().mockReturnValue(builder);
  }
  builder['maybeSingle'] = terminal.maybeSingle;
  builder['single'] = terminal.single;

  const from = jest.fn().mockReturnValue(builder);
  const mockSupabase = { from } as unknown as SupabaseClient;

  return { mockSupabase, from, builder, terminal };
}

const sampleRow: UserCreditsRow = {
  user_id: 'user-1',
  tier: 'basic',
  credits_total: 100,
  credits_used: 10,
  credits_reset_at: '2030-01-01T00:00:00Z',
};

// ---------------------------------------------------------------------------
// reserveCredits
// ---------------------------------------------------------------------------
describe('reserveCredits', () => {
  it('returns null immediately when creditCost is 0', async () => {
    const { mockSupabase } = buildSupabaseMock();
    const result = await reserveCredits(mockSupabase, 'user-1', 10, 0);
    expect(result).toBeNull();
  });

  it('returns null immediately when creditCost is negative', async () => {
    const { mockSupabase } = buildSupabaseMock();
    const result = await reserveCredits(mockSupabase, 'user-1', 10, -5);
    expect(result).toBeNull();
  });

  it('returns the updated row on a successful CAS update', async () => {
    const { mockSupabase, terminal } = buildSupabaseMock();
    terminal.maybeSingle.mockResolvedValue({ data: sampleRow, error: null });

    const result = await reserveCredits(mockSupabase, 'user-1', 10, 5);
    expect(result).toEqual(sampleRow);
  });

  it('returns null when the CAS update matches no row (concurrent request won)', async () => {
    const { mockSupabase, terminal } = buildSupabaseMock();
    terminal.maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await reserveCredits(mockSupabase, 'user-1', 10, 5);
    expect(result).toBeNull();
  });

  it('throws when the database returns an error', async () => {
    const { mockSupabase, terminal } = buildSupabaseMock();
    const dbError = new Error('DB connection lost');
    terminal.maybeSingle.mockResolvedValue({ data: null, error: dbError });

    await expect(reserveCredits(mockSupabase, 'user-1', 10, 5)).rejects.toThrow(
      'DB connection lost'
    );
  });

  it('calls from() with the correct table name', async () => {
    const { mockSupabase, from, terminal } = buildSupabaseMock();
    terminal.maybeSingle.mockResolvedValue({ data: sampleRow, error: null });

    await reserveCredits(mockSupabase, 'user-1', 10, 5);
    expect(from).toHaveBeenCalledWith('user_credits');
  });
});

// ---------------------------------------------------------------------------
// refundCredits
// ---------------------------------------------------------------------------
describe('refundCredits', () => {
  it('returns true immediately when creditCost is 0', async () => {
    const { mockSupabase } = buildSupabaseMock();
    const result = await refundCredits(mockSupabase, 'user-1', 0);
    expect(result).toBe(true);
  });

  it('returns true immediately when creditCost is negative', async () => {
    const { mockSupabase } = buildSupabaseMock();
    const result = await refundCredits(mockSupabase, 'user-1', -3);
    expect(result).toBe(true);
  });

  it('returns false when the initial read fails', async () => {
    const { mockSupabase, terminal } = buildSupabaseMock();
    terminal.single.mockResolvedValue({ data: null, error: new Error('Read error') });

    const result = await refundCredits(mockSupabase, 'user-1', 5);
    expect(result).toBe(false);
  });

  it('returns false when the initial read returns no row', async () => {
    const { mockSupabase, terminal } = buildSupabaseMock();
    terminal.single.mockResolvedValue({ data: null, error: null });

    const result = await refundCredits(mockSupabase, 'user-1', 5);
    expect(result).toBe(false);
  });

  it('applies the refund and returns true on first attempt', async () => {
    const { mockSupabase, terminal } = buildSupabaseMock();

    // First call: read -> current credits_used = 10
    // Second call: update CAS -> success
    terminal.single
      .mockResolvedValueOnce({ data: { credits_used: 10 }, error: null })
      .mockResolvedValueOnce({ data: { ...sampleRow, credits_used: 5 }, error: null });

    const result = await refundCredits(mockSupabase, 'user-1', 5);
    expect(result).toBe(true);
  });

  it('never lets credits_used drop below 0', async () => {
    const { mockSupabase, terminal, builder } = buildSupabaseMock();

    terminal.single
      .mockResolvedValueOnce({ data: { credits_used: 3 }, error: null })
      .mockResolvedValueOnce({ data: { ...sampleRow, credits_used: 0 }, error: null });

    await refundCredits(mockSupabase, 'user-1', 10);

    // Capture the value passed to update()
    const updateCall = builder['update'].mock.calls[0][0] as { credits_used: number };
    expect(updateCall.credits_used).toBe(0);
  });

  it('retries after a CAS miss and succeeds on the second attempt', async () => {
    const { mockSupabase, terminal } = buildSupabaseMock();

    terminal.single
      // Attempt 1 read
      .mockResolvedValueOnce({ data: { credits_used: 10 }, error: null })
      // Attempt 1 update: CAS miss (another request changed credits_used)
      .mockResolvedValueOnce({ data: null, error: new Error('CAS miss') })
      // Attempt 2 read
      .mockResolvedValueOnce({ data: { credits_used: 15 }, error: null })
      // Attempt 2 update: success
      .mockResolvedValueOnce({ data: { ...sampleRow, credits_used: 10 }, error: null });

    const result = await refundCredits(mockSupabase, 'user-1', 5);
    expect(result).toBe(true);
  });

  it('returns false after exhausting maxAttempts', async () => {
    const { mockSupabase, terminal } = buildSupabaseMock();

    // Every read returns a row, every update fails (simulates persistent contention)
    terminal.single.mockResolvedValue({ data: { credits_used: 10 }, error: null });

    // Override single to fail on every update call (odd calls = read, even calls = update)
    let callIndex = 0;
    terminal.single.mockImplementation(() => {
      callIndex++;
      if (callIndex % 2 === 1) {
        // Read call
        return Promise.resolve({ data: { credits_used: 10 }, error: null });
      }
      // Update call: CAS miss
      return Promise.resolve({ data: null, error: new Error('CAS miss') });
    });

    const result = await refundCredits(mockSupabase, 'user-1', 5, 3);
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// creditReservationConflictResponse
// ---------------------------------------------------------------------------
describe('creditReservationConflictResponse', () => {
  it('returns the expected shape with a defined tier', () => {
    const response = creditReservationConflictResponse(5, 'pro');
    expect(response).toMatchObject({
      error: 'Not enough credits',
      needsUpgrade: false,
      currentTier: 'pro',
      creditCost: 5,
    });
    expect(typeof response.message).toBe('string');
    expect(response.message.length).toBeGreaterThan(0);
  });

  it('defaults currentTier to "free" when tier is undefined', () => {
    const response = creditReservationConflictResponse(3, undefined);
    expect(response.currentTier).toBe('free');
  });

  it('reflects the creditCost in the response', () => {
    const response = creditReservationConflictResponse(10, 'basic');
    expect(response.creditCost).toBe(10);
  });

  it('always sets needsUpgrade to false', () => {
    expect(creditReservationConflictResponse(1, 'enterprise').needsUpgrade).toBe(false);
  });
});
