"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, User, Send, Plus } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      if (!res.ok) return;
      const data = await res.json();
      setSessions((data.data ?? data).slice(0, 20));
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadSession = async (id: string) => {
    setSessionId(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const s = data.data ?? data;
      const msgs: ChatMessage[] = (s.messages ?? []).map((m: { role: string; content: string }, i: number, arr: { timestamp: string }[]) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: arr[i]?.timestamp ?? s.createdAt,
      }));
      setMessages(msgs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, sessionId }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = await res.json();
      const result = data.data ?? data;

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (result.expense) {
        const confirmMsg: ChatMessage = {
          role: "assistant",
          content: `✅ Created expense: **${result.expense.description}** — $${result.expense.amount.toFixed(2)}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, confirmMsg]);
      }

      if (!sessionId) {
        setSessionId(result.sessionId ?? null);
        fetchSessions();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again.", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Session sidebar */}
      <Card className="hidden md:block w-64 shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">History</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => { setSessionId(null); setMessages([]); }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          {sessionsLoading && <Skeleton className="h-8 w-full mb-2" />}
          {sessions.map((s) => (
            <Button
              key={s.id}
              variant={sessionId === s.id ? "secondary" : "ghost"}
              className="w-full justify-start text-xs mb-1 h-auto py-2 px-3"
              onClick={() => loadSession(s.id)}
            >
              <span className="truncate">{s.title || "Untitled"}</span>
            </Button>
          ))}
          {!sessionsLoading && sessions.length === 0 && (
            <p className="text-xs text-muted-foreground px-3">No conversations yet</p>
          )}
        </CardContent>
      </Card>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg">Ledger</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-3" />
              <p>Ask me to add an expense or query your spending.</p>
              <p className="text-sm mt-1">Example: &ldquo;I spent $45 on groceries today&rdquo;</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-50 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>
        <CardFooter className="border-t p-3">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex w-full gap-2"
          >
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
