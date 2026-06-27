"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface EditLoopMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
  timestamp: Date;
  highlights?: string[];
  atsImpact?: string;
}

export interface UseAIEditLoopOptions {
  endpoint: string;
  buildBody: (userMessage: string, messages: EditLoopMessage[]) => Record<string, unknown>;
  parseResponse: (data: unknown) => {
    assistantContent: string;
    extraFields?: Record<string, unknown>;
  };
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  onData?: (data: unknown) => void;
  initialMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

export function useAIEditLoop({
  endpoint,
  buildBody,
  parseResponse,
  getHeaders,
  onData,
  initialMessage = "",
  successMessage = "Changes applied successfully!",
  errorMessage = "Something went wrong. Please try again.",
}: UseAIEditLoopOptions) {
  const [messages, setMessages] = useState<EditLoopMessage[]>(() => {
    const initial: EditLoopMessage = {
      role: "assistant",
      content:
        initialMessage ||
        "👋 Hi! I can help you improve your content. Tell me what you'd like to change!",
      id: "initial",
      timestamp: new Date(),
    };
    return [initial];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((msg: EditLoopMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");

    const userMsg: EditLoopMessage = {
      role: "user",
      content: text,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setIsLoading(true);

    try {
      const customHeaders = await getHeaders?.();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...customHeaders,
      };
      const updatedMessages = [...messages, userMsg];
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(buildBody(text, updatedMessages)),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || errData?.details || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const parsed = parseResponse(data);

      const assistantMsg: EditLoopMessage = {
        role: "assistant",
        content: parsed.assistantContent,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...parsed.extraFields,
      };
      addMessage(assistantMsg);

      onData?.(data);
      toast.success(successMessage);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : errorMessage;
      toast.error(errorMessage, { description: errMsg });

      addMessage({
        role: "assistant",
        content: `❌ I encountered an error: ${errMsg}\n\nPlease try rephrasing or try again.`,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    input,
    isLoading,
    endpoint,
    buildBody,
    messages,
    parseResponse,
    getHeaders,
    onData,
    successMessage,
    errorMessage,
    addMessage,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        role: "assistant",
        content:
          initialMessage ||
          "👋 Hi! I can help you improve your content. Tell me what you'd like to change!",
        id: "initial",
        timestamp: new Date(),
      },
    ]);
  }, [initialMessage]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    handleKeyDown,
    clearMessages,
    messagesEndRef,
  };
}
