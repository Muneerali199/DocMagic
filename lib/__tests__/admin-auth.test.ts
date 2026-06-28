import { requireAdmin, isAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));
const mockGetUser = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createServer: jest.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

describe("admin-auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requireAdmin", () => {
    it("redirects to signin when no user", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/auth/signin");
    });

    it("redirects to dashboard when role is not admin", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      mockSingle.mockResolvedValue({ data: { role: "user" } });
      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("redirects to dashboard when profile is missing", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      mockSingle.mockResolvedValue({ data: null });
      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("returns the user when role is admin", async () => {
      const adminUser = { id: "u1" };
      mockGetUser.mockResolvedValue({ data: { user: adminUser } });
      mockSingle.mockResolvedValue({ data: { role: "admin" } });
      const result = await requireAdmin();
      expect(result).toEqual(adminUser);
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe("isAdmin", () => {
    it("returns false when no user", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      expect(await isAdmin()).toBe(false);
    });

    it("returns false when role is not admin", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      mockSingle.mockResolvedValue({ data: { role: "user" } });
      expect(await isAdmin()).toBe(false);
    });

    it("returns true when role is admin", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      mockSingle.mockResolvedValue({ data: { role: "admin" } });
      expect(await isAdmin()).toBe(true);
    });
  });
});
