"use client";

/**
 * Editor Provider
 *
 * Context provider for rich text editor that supplies:
 * - User list for @mentions
 * - Channel list for #mentions
 * - AI action handler
 *
 * @module components/editor/EditorProvider
 */

import { createContext, useContext, ReactNode, useCallback } from "react";
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
  // AI action handler - will be implemented in Phase 18.4
  const handleAIAction = useCallback(
    async (action: AIAction, text?: string): Promise<string> => {
      // Placeholder - will call Tiptap AI API or custom endpoint
      console.log("AI Action:", action, "Text:", text);

      // For now, return the original text with a note
      // This will be replaced with actual AI integration
      switch (action) {
        case "translate_ar":
          return `[Arabic translation pending] ${text}`;
        case "translate_en":
          return `[English translation pending] ${text}`;
        case "polish":
          return text || "";
        case "expand":
          return `${text}\n\n[Expanded content pending]`;
        case "summarize":
          return `[Summary pending] ${text?.substring(0, 100)}...`;
        case "simplify":
          return text || "";
        case "formal":
          return text || "";
        case "casual":
          return text || "";
        case "generate_caption":
          return "[Generated caption pending]";
        default:
          return text || "";
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
        handleAIAction,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

// ============================================
// CONVENIENCE WRAPPERS
// ============================================

export { RichTextEditor } from "./RichTextEditor";
export type { RichTextEditorProps, RichTextEditorRef, RichTextVariant } from "./RichTextEditor";
