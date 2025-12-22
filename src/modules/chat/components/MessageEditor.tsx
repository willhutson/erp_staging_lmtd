"use client";

/**
 * Message Editor Component
 *
 * Tiptap-based rich text editor for chat messages with:
 * - @mentions
 * - Emoji support
 * - Markdown shortcuts
 * - File attachments
 *
 * @module chat/components/MessageEditor
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Send,
  Paperclip,
  Smile,
  Bold,
  Italic,
  Code,
  List,
  AtSign,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface MessageEditorProps {
  channelId: string;
  onSend: (content: string, mentions: string[]) => Promise<void>;
  onTyping?: () => void;
  onStopTyping?: () => void;
  placeholder?: string;
  disabled?: boolean;
  users?: Array<{ id: string; name: string; avatarUrl: string | null }>;
  replyingTo?: {
    id: string;
    userName: string;
    preview: string;
  } | null;
  onCancelReply?: () => void;
}

// ============================================
// EMOJI PICKER DATA
// ============================================

const COMMON_EMOJIS = [
  "👍", "👎", "❤️", "😊", "😂", "🎉", "🔥", "✅",
  "👀", "🙏", "💯", "⭐", "🚀", "💪", "👏", "🤔",
  "😍", "😭", "🤷", "👋", "✨", "💡", "📌", "⚡",
];

// ============================================
// CUSTOM ENTER KEY EXTENSION
// ============================================

const EnterKeyExtension = Extension.create({
  name: "enterKey",

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        // Shift+Enter for new line
        if (this.editor.view.state.selection.$from.parent.type.name === "codeBlock") {
          return false; // Let default behavior handle code blocks
        }

        // Regular Enter triggers send
        const event = new CustomEvent("editor-submit");
        document.dispatchEvent(event);
        return true;
      },
      "Shift-Enter": () => {
        // Insert new line
        this.editor.commands.enter();
        return true;
      },
    };
  },
});

// ============================================
// COMPONENT
// ============================================

export function MessageEditor({
  channelId,
  onSend,
  onTyping,
  onStopTyping,
  placeholder = "Type a message...",
  disabled = false,
  users = [],
  replyingTo,
  onCancelReply,
}: MessageEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-4",
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "bg-blue-100 text-blue-700 px-1 rounded",
        },
        suggestion: {
          items: ({ query }) => {
            return users
              .filter((user) =>
                user.name.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5);
          },
          render: () => {
            let popup: HTMLElement | null = null;
            let component: any = null;

            return {
              onStart: (props: any) => {
                // Create mention popup
                popup = document.createElement("div");
                popup.className =
                  "bg-white border rounded-lg shadow-lg p-2 z-50";
                document.body.appendChild(popup);

                const rect = props.clientRect?.();
                if (rect && popup) {
                  popup.style.position = "fixed";
                  popup.style.left = `${rect.left}px`;
                  popup.style.top = `${rect.bottom + 4}px`;
                }

                component = {
                  updateProps: (newProps: any) => {
                    if (!popup) return;
                    popup.innerHTML = newProps.items
                      .map(
                        (item: any, index: number) => `
                        <div
                          class="px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${
                            index === newProps.selectedIndex ? "bg-gray-100" : ""
                          }"
                          data-index="${index}"
                        >
                          ${item.name}
                        </div>
                      `
                      )
                      .join("");

                    // Add click handlers
                    popup.querySelectorAll("[data-index]").forEach((el) => {
                      el.addEventListener("click", () => {
                        const idx = parseInt(el.getAttribute("data-index") || "0");
                        newProps.command(newProps.items[idx]);
                      });
                    });
                  },
                  destroy: () => {
                    popup?.remove();
                    popup = null;
                  },
                };

                component.updateProps(props);
              },
              onUpdate: (props: any) => {
                component?.updateProps(props);

                const rect = props.clientRect?.();
                if (rect && popup) {
                  popup.style.left = `${rect.left}px`;
                  popup.style.top = `${rect.bottom + 4}px`;
                }
              },
              onKeyDown: (props: any) => {
                if (props.event.key === "Escape") {
                  component?.destroy();
                  return true;
                }
                return false;
              },
              onExit: () => {
                component?.destroy();
              },
            };
          },
          command: ({ editor, range, props }: any) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent([
                {
                  type: "mention",
                  attrs: { id: props.id, label: props.name },
                },
                { type: "text", text: " " },
              ])
              .run();

            // Track mentioned user
            setMentionedUsers((prev) => [...new Set([...prev, props.id])]);
          },
        },
      }),
      EnterKeyExtension,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[40px] max-h-[200px] overflow-y-auto px-3 py-2",
      },
    },
    onUpdate: ({ editor }) => {
      // Handle typing indicator
      if (onTyping && !isTypingRef.current) {
        isTypingRef.current = true;
        onTyping();
      }

      // Reset typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onStopTyping?.();
      }, 2000);
    },
  });

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!editor || isSubmitting || disabled) return;

    const content = editor.getHTML();
    const textContent = editor.getText().trim();

    if (!textContent) return;

    setIsSubmitting(true);

    try {
      await onSend(content, mentionedUsers);
      editor.commands.clearContent();
      setMentionedUsers([]);
      onCancelReply?.();
    } finally {
      setIsSubmitting(false);
    }
  }, [editor, isSubmitting, disabled, onSend, mentionedUsers, onCancelReply]);

  // Listen for enter key submit
  useEffect(() => {
    const handleEditorSubmit = () => {
      handleSubmit();
    };

    document.addEventListener("editor-submit", handleEditorSubmit);
    return () => {
      document.removeEventListener("editor-submit", handleEditorSubmit);
    };
  }, [handleSubmit]);

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    editor?.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  };

  // Toggle formatting
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleCode = () => editor?.chain().focus().toggleCode().run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();

  // Trigger mention
  const triggerMention = () => {
    editor?.chain().focus().insertContent("@").run();
  };

  if (!editor) return null;

  return (
    <div className="border rounded-lg bg-white">
      {/* Reply preview */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span>Replying to</span>
            <span className="font-medium">{replyingTo.userName}</span>
            <span className="text-gray-400 truncate max-w-[200px]">
              {replyingTo.preview}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Formatting toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7", editor.isActive("bold") && "bg-gray-100")}
          onClick={toggleBold}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7", editor.isActive("italic") && "bg-gray-100")}
          onClick={toggleItalic}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7", editor.isActive("code") && "bg-gray-100")}
          onClick={toggleCode}
          title="Code (Ctrl+E)"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7", editor.isActive("bulletList") && "bg-gray-100")}
          onClick={toggleBulletList}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={triggerMention}
          title="Mention (@)"
        >
          <AtSign className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Actions bar */}
      <div className="flex items-center justify-between px-2 py-1 border-t">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Attach file">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Add emoji">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="grid grid-cols-8 gap-1">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    className="p-1 hover:bg-gray-100 rounded text-xl"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting || disabled || !editor.getText().trim()}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
