"use client";

/**
 * Editor Provider
 *
 * Context provider for rich text editor that supplies:
 * - User list for @mentions
 * - Channel list for #mentions
 * - AI action handler with real OpenAI integration
 *
 * @module components/editor/EditorProvider
 */

import { createContext, useContext, ReactNode, useCallback, useState } from "react";
import { performAIAction } from "@/modules/ai/actions";
import type { MentionUser, MentionChannel, AIAction } from "./RichTextEditor";

// ============================================
// TYPES
// ============================================

interface EditorContextValue {
  users: MentionUser[];
  channels: MentionChannel[];
  currentUserId: string;
  organizationId: string;
  enableAI: boolean;
  isAILoading: boolean;
  handleAIAction: (action: AIAction, text?: string) => Promise<string>;
}

// ============================================
// CONTEXT
// ============================================

const EditorContext = createContext<EditorContextValue | null>(null);

// ============================================
// HOOK
// ============================================

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    // Return defaults if not in provider
    return {
      users: [],
      channels: [],
      currentUserId: "",
      organizationId: "",
      enableAI: false,
      isAILoading: false,
      handleAIAction: async () => "",
    };
  }
  return context;
}

// ============================================
// PROVIDER
// ============================================

interface EditorProviderProps {
  children: ReactNode;
  users: MentionUser[];
  channels?: MentionChannel[];
  currentUserId: string;
  organizationId: string;
  enableAI?: boolean;
}

export function EditorProvider({
  children,
  users,
  channels = [],
  currentUserId,
  organizationId,
  enableAI = false,
}: EditorProviderProps) {
  const [isAILoading, setIsAILoading] = useState(false);

  // AI action handler - calls server action
  const handleAIAction = useCallback(
    async (action: AIAction, text?: string): Promise<string> => {
      if (!text || text.trim().length === 0) {
        return "";
      }

      setIsAILoading(true);

      try {
        const result = await performAIAction({
          action,
          text,
        });

        if (result.success && result.result) {
          return result.result;
        }

        // If API fails, show error message
        console.error("AI Action failed:", result.error);
        return text; // Return original text on failure
      } catch (error) {
        console.error("AI Action error:", error);
        return text; // Return original text on error
      } finally {
        setIsAILoading(false);
      }
    },
    []
  );

  return (
    <EditorContext.Provider
      value={{
        users,
        channels,
        currentUserId,
        organizationId,
        enableAI,
        isAILoading,
        handleAIAction,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

// ============================================
// STANDALONE AI HOOK (for use outside provider)
// ============================================

export function useAIActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAction = useCallback(
    async (action: AIAction, text: string): Promise<string | null> => {
      if (!text || text.trim().length === 0) {
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await performAIAction({ action, text });

        if (result.success && result.result) {
          return result.result;
        }

        setError(result.error || "AI action failed");
        return null;
      } catch (err) {
        setError("Failed to execute AI action");
        console.error("AI Action error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const translateToArabic = useCallback(
    (text: string) => executeAction("translate_ar", text),
    [executeAction]
  );

  const translateToEnglish = useCallback(
    (text: string) => executeAction("translate_en", text),
    [executeAction]
  );

  const polish = useCallback(
    (text: string) => executeAction("polish", text),
    [executeAction]
  );

  const expand = useCallback(
    (text: string) => executeAction("expand", text),
    [executeAction]
  );

  const summarize = useCallback(
    (text: string) => executeAction("summarize", text),
    [executeAction]
  );

  const makeFormal = useCallback(
    (text: string) => executeAction("formal", text),
    [executeAction]
  );

  const makeCasual = useCallback(
    (text: string) => executeAction("casual", text),
    [executeAction]
  );

  return {
    isLoading,
    error,
    executeAction,
    translateToArabic,
    translateToEnglish,
    polish,
    expand,
    summarize,
    makeFormal,
    makeCasual,
  };
}

// ============================================
// CONVENIENCE WRAPPERS
// ============================================

export { RichTextEditor } from "./RichTextEditor";
export type { RichTextEditorProps, RichTextEditorRef, RichTextVariant } from "./RichTextEditor";
