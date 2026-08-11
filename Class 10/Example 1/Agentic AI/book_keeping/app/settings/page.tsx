"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [health] = useState<{ status: string; checks: Record<string, string> } | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      (window as { __health?: unknown }).__health = data;
    } finally {
      setHealthLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>AI Agent</CardTitle>
          <CardDescription>Configuration for Ledger, the bookkeeping AI assistant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>AI Provider</span>
            <span className="font-mono">OpenRouter</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Model</span>
            <span className="font-mono">{process.env.NEXT_PUBLIC_OPENROUTER_MODEL || "openai/gpt-4o-mini"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>API Key</span>
            <span>
              {process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ? (
                <Badge variant="outline" className="text-green-600">Configured</Badge>
              ) : (
                <Badge variant="destructive">Not configured</Badge>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System</CardTitle>
          <CardDescription>Application health and diagnostics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span>
              {healthLoading ? (
                <Badge variant="secondary">Checking...</Badge>
              ) : health ? (
                <Badge variant={health.status === "ok" ? "default" : "destructive"}>
                  {health.status}
                </Badge>
              ) : (
                <Badge variant="outline">Unknown</Badge>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Framework</span>
            <span className="font-mono">Next.js 15</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Database</span>
            <span className="font-mono">PostgreSQL (Neon)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>API Protocol</span>
            <span className="font-mono">Next.js Route Handlers</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
