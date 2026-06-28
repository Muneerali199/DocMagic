import { render, screen } from "@testing-library/react";
import AdminUsersPage from "@/app/admin/users/page";

const mockLimit = jest.fn();
const mockOrder = jest.fn(() => ({ limit: mockLimit }));
const mockSelect = jest.fn(() => ({ order: mockOrder }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock("@/lib/supabase/server", () => ({
  createServer: jest.fn(() => ({ from: mockFrom })),
}));

describe("AdminUsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders user rows with correct data", async () => {
    mockLimit.mockResolvedValue({
      data: [
        {
          id: "1",
          email: "alice@example.com",
          full_name: "Alice",
          role: "admin",
          credits: 50,
          created_at: "2026-01-15T00:00:00Z",
          is_suspended: false,
        },
        {
          id: "2",
          email: "bob@example.com",
          full_name: null,
          role: "user",
          credits: 0,
          created_at: "2026-02-01T00:00:00Z",
          is_suspended: true,
        },
      ],
    });

    const ui = await AdminUsersPage();
    render(ui);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Suspended")).toBeInTheDocument();
  });

  it("renders no data rows when there are no users", async () => {
    mockLimit.mockResolvedValue({ data: [] });
    const ui = await AdminUsersPage();
    render(ui);
    expect(screen.getAllByRole("row")).toHaveLength(1); // header row only
  });

  it("queries profiles ordered by newest first, limited to 100", async () => {
    mockLimit.mockResolvedValue({ data: [] });
    await AdminUsersPage();
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(mockLimit).toHaveBeenCalledWith(100);
  });
});
