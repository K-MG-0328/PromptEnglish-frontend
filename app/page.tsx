"use client";

import { useEffect, useState } from "react";
import { httpClient, HttpError } from "@/infrastructure/http/httpClient";

type HealthResponse = { status: string };

export default function HomePage() {
  const [health, setHealth] = useState<string>("…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    httpClient<HealthResponse>("/health")
      .then((res) => setHealth(res.status))
      .catch((err: unknown) => {
        if (err instanceof HttpError) {
          setError(`Backend ${err.status}`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold">PromptEnglish</h1>
      <p className="text-sm opacity-70">LLM-powered English learning</p>
      <div className="rounded border px-4 py-2 text-sm">
        Backend health: <span className="font-mono">{error ?? health}</span>
      </div>
    </div>
  );
}
