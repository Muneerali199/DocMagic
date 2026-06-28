import { render, screen } from "@testing-library/react";
import AdminConfigPage from "@/app/admin/config/page";

describe("AdminConfigPage", () => {
  it("renders all configuration settings and values", () => {
    render(<AdminConfigPage />);

    expect(screen.getByText("System Configuration")).toBeInTheDocument();

    expect(screen.getByText("Default Credits (New User)")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    expect(screen.getByText("Max Documents Per User")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();

    expect(screen.getByText("AI Generation Rate Limit")).toBeInTheDocument();
    expect(screen.getByText("20 / 5 min")).toBeInTheDocument();

    expect(screen.getByText("Maintenance Mode")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
  });

  it("renders the correct number of rows", () => {
    render(<AdminConfigPage />);
    expect(screen.getAllByRole("row")).toHaveLength(5); // 1 header + 4 data rows
  });

  it("shows the coming-soon notice", () => {
    render(<AdminConfigPage />);
    expect(
      screen.getByText("Live config editing coming soon."),
    ).toBeInTheDocument();
  });
});
