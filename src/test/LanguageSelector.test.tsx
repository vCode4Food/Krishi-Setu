import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { LanguageProvider } from "@/context/LanguageContext";
import i18n from "@/i18n/config";
import "@/../src/i18n/config";

const renderSelector = (hints: { profileState?: string | null } = {}) =>
  render(
    <LanguageProvider hints={hints}>
      <LanguageSelector />
    </LanguageProvider>,
  );

describe("LanguageSelector", () => {
  it("renders English as active on a first visit", () => {
    renderSelector();
    const trigger = screen.getByRole("button", { name: /select language/i });
    expect(trigger).toHaveTextContent("English");
    expect(i18n.language).toBe("en");
  });

  it("guest dropdown shows only English + Hindi (no regional recommendation)", () => {
    renderSelector();
    fireEvent.click(screen.getByRole("button", { name: /select language/i }));
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["English", "हिन्दी"]);
  });

  it("shows the state recommendation in the dropdown without applying it", () => {
    renderSelector({ profileState: "Maharashtra" });
    fireEvent.click(screen.getByRole("button", { name: /select language/i }));
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["English", "हिन्दी", "मराठी"]);
    // footer documents the recommendation source
    expect(screen.getByText(/Maharashtra/)).toBeInTheDocument();
    // active is still English — recommendation never auto-applies
    const active = screen.getByRole("option", { selected: true });
    expect(active).toHaveTextContent("English");
  });

  it("selecting हिन्दी switches the UI language and persists the preference", () => {
    renderSelector();
    fireEvent.click(screen.getByRole("button", { name: /select language/i }));
    fireEvent.click(screen.getByRole("option", { name: /हिन्दी/ }));
    expect(i18n.language).toBe("hi");
    expect(localStorage.getItem("krushisetu.language")).toBe("hi");
  });

  it("expands More languages to the full 13-language catalogue", () => {
    renderSelector();
    fireEvent.click(screen.getByRole("button", { name: /select language/i }));
    fireEvent.click(screen.getByRole("button", { name: /more languages/i }));
    // contextual options + all 13 in the expanded panel
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options.length).toBe(2 + 13);
    expect(options.join(" ")).toContain("தமிழ்");
    expect(options.join(" ")).toContain("اردو");
  });
});
