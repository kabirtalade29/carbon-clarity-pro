import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, Bot, User, CheckCircle2, ArrowRight, Zap } from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
};

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyCalculations, getMyProfile } from "@/lib/calculations.functions";
import { runCopilotQuery } from "@/lib/copilot-engine";

export function AiCopilotSheet() {
  const listFn = useServerFn(listMyCalculations);
  const profileFn = useServerFn(getMyProfile);

  const { data: calculations = [] } = useQuery({
    queryKey: ["me", "calculations"],
    queryFn: () => listFn(),
  });

  const { data: profile } = useQuery({
    queryKey: ["me", "profile"],
    queryFn: () => profileFn(),
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "copilot",
      text: "Hello! I am **clisomumbai Co-Pilot**. I am connected to your live corporate carbon ledger. I can analyze Scope 1, 2, and 3 entries, run audit traces, assess Kigali refrigerant compliance, and draft board summaries. How can I help today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    "Draft an executive board summary of our carbon footprint",
    "What is our highest Scope 3 emission driver?",
    "Check Montreal Protocol compliance for our refrigerants",
    "Suggest top 3 decarbonization initiatives for 2030",
    "Breakdown emissions by facility",
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const reply = await runCopilotQuery(query, {
        calculations,
        companyName: profile?.company || "Climate Social Mumbai",
        facilityName: profile?.facility || "Headquarters",
      });

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        sender: "copilot",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        sender: "copilot",
        text: "An error occurred while querying the carbon ledger. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-primary/40 bg-primary/5 hover:bg-primary/10"
        >
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="hidden sm:inline font-medium">AI Co-Pilot</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-6">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-primary font-display text-xl">
            <Sparkles className="h-5 w-5" /> clisomumbai Co-Pilot
          </SheetTitle>
          <SheetDescription className="text-xs">
            Natural language climate intelligence, audit traces & board reporting.
          </SheetDescription>
        </SheetHeader>

        {/* Suggested Prompt Chips */}
        <div className="py-3 flex flex-wrap gap-1.5 border-b">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary transition-all text-left flex items-center gap-1 text-muted-foreground"
            >
              <Zap className="h-3 w-3 text-amber-500 shrink-0" />
              <span className="truncate max-w-[180px]">{prompt}</span>
            </button>
          ))}
        </div>

        {/* Message Trajectory Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground border"
                }`}
              >
                {m.sender === "user" ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5 text-primary" />
                )}
              </div>
              <div
                className={`rounded-2xl p-3.5 max-w-[85%] leading-relaxed ${
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/40 border border-border/60 rounded-tl-none text-foreground whitespace-pre-line"
                }`}
              >
                {m.text}
                <div
                  className={`mt-1.5 text-[10px] text-right ${
                    m.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-center text-xs text-muted-foreground py-2">
              <Bot className="h-4 w-4 animate-spin text-primary" />
              <span>Analyzing carbon ledger & emission factors...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t flex gap-2">
          <Input
            placeholder="Ask Co-Pilot about emissions, reports..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="text-xs"
          />
          <Button onClick={() => handleSend()} disabled={loading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
