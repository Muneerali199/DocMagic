import { render, screen } from "@testing-library/react";
import AdminOverviewPage from "@/app/admin/page";

const mockFrom = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createServer: jest.fn(() => ({ from: mockFrom })),
}));

function mockCounts(userCount: number | null, docCount: number | null) {
  mockFrom.mockImplementation((table: string) => {
    if (table === "profiles") {
      return { select: jest.fn().mockResolvedValue({ count: userCount }) };
    }
    if (table === "documents") {
      return { select: jest.fn().mockResolvedValue({ count: docCount }) };
    }
    return { select: jest.fn().mockResolvedValue({ count: 0 }) };
  });
}

describe("AdminOverviewPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("aggregates and displays user and document counts", async () => {
    mockCounts(42, 7);
    const ui = await AdminOverviewPage();
    render(ui);

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Total Documents")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("falls back to 0 when counts are null", async () => {
    mockCounts(null, null);
    const ui = await AdminOverviewPage();
    render(ui);

    expect(screen.getAllByText("0")).toHaveLength(2);
  });

  it("queries profiles and documents tables", async () => {
    mockCounts(1, 2);
    await AdminOverviewPage();

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockFrom).toHaveBeenCalledWith("documents");
  });
});
