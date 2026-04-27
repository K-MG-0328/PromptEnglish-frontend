"use client";

import { Provider } from "jotai";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <main className="min-h-screen">{children}</main>
    </Provider>
  );
}
