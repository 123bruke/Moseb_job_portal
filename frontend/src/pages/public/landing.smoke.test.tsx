import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
  },
}));
vi.stubGlobal("fetch", vi.fn(async () => new Response("[]", { headers: { "Content-Type": "application/json" } })));

import Landing from "@/pages/public/Landing";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/app/auth";
import { ThemeProvider } from "@/app/theme";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

function mount(ui: ReactNode, path = "/") {
  act(() =>
    root.render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <ThemeProvider>
          <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    ),
  );
  return host;
}

describe("marketing home", () => {
  it("renders every section and both illustrations", () => {
    const el = mount(<Landing />);
    for (const id of ["top", "about", "services", "ranking", "students", "company", "cta"]) {
      expect(el.querySelector(`#${id}`), `missing section #${id}`).toBeTruthy();
    }
    expect(el.querySelector('img[src="/illustrations/students.svg"]')).toBeTruthy();
    expect(el.querySelector('img[src="/illustrations/learning.svg"]')).toBeTruthy();
    expect(el.textContent).toMatch(/Hire fairly/i);
    expect(el.textContent?.toLowerCase()).toContain("bias");
  });
});

describe("header", () => {
  it("shows Home, About, Company, Services and a sign-in control", () => {
    const el = mount(
      <AuthProvider>
        <Layout />
      </AuthProvider>,
    );
    for (const label of ["Home", "About", "Company", "Services"]) {
      const link = [...el.querySelectorAll("header a")].find((a) => a.textContent?.trim().includes(label));
      expect(link, `missing header link "${label}"`).toBeTruthy();
    }
    expect([...el.querySelectorAll("header a")].some((a) => /sign in/i.test(a.textContent ?? ""))).toBe(true);
  });
});