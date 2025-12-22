"use client";

/**
 * Unified Rich Text Editor
 *
 * Platform-wide Tiptap editor with multiple variants:
 * - minimal: Basic formatting (bold, italic, lists)
 * - standard: + links, code blocks
 * - mentions: + @user and #channel mentions
 * - full: + file attachments, embeds
 * - caption: Social-optimized with char count
 * - form-help: Compact inline tips
 *
 * Prepared for Tiptap AI integration (translation, generation, polish)
 *
 * @module components/editor/RichTextEditor
 */

import { useEffect, useImperativeHandle, forwardRef, useState } from "react";
import { useEditor, EditorContent, Editor, JSONContent } from "@tiptap/react";
import { performAIAction } from "@/modules/ai/actions";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Code,
  List,
  ListOrdered,
  Link as LinkIcon,
  AtSign,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Sparkles,
  Languages,
  Wand2,
  ChevronDown,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

export type RichTextVariant =
  | "minimal"    // Bold, italic, lists
  | "standard"   // + links, code, quotes
  | "mentions"   // + @mentions
  | "full"       // + headings, alignment, embeds
  | "caption"    // Social-optimized, char count
  | "form-help"; // Compact, inline

export interface MentionUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  email?: string;
}

export interface MentionChannel {
  id: string;
  name: string;
  icon?: string;
}

export interface RichTextEditorProps {
  variant?: RichTextVariant;
  value?: string;
  defaultValue?: string;
  onChange?: (html: string, json: JSONContent) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  editorClassName?: string;

  // Mentions
  users?: MentionUser[];
  channels?: MentionChannel[];
  onMention?: (type: "user" | "channel", id: string) => void;

  // Character limit (for captions)
  maxLength?: number;
  showCharCount?: boolean;

  // AI features (prepared for Phase 18.4)
  enableAI?: boolean;
  onAIAction?: (action: AIAction, selectedText?: string) => Promise<string>;

  // Toolbar customization
  hideToolbar?: boolean;
  toolbarPosition?: "top" | "bottom" | "floating";

  // Submit behavior (for chat-like inputs)
  submitOnEnter?: boolean;
  onSubmit?: (html: string) => void;
}

export type AIAction =
  | "translate_ar"
  | "translate_en"
  | "polish"
  | "expand"
  | "summarize"
  | "simplify"
  | "formal"
  | "casual"
  | "generate_caption";

export interface RichTextEditorRef {
  editor: Editor | null;
  getHTML: () => string;
  getJSON: () => JSONContent;
  getText: () => string;
  clear: () => void;
  focus: () => void;
  insertContent: (content: string) => void;
  setContent: (content: string) => void;
}

// ============================================
// EMOJI DATA
// ============================================

const COMMON_EMOJIS = [
  "👍", "👎", "❤️", "😊", "😂", "🎉", "🔥", "✅",
  "👀", "🙏", "💯", "⭐", "🚀", "💪", "👏", "🤔",
  "😍", "😭", "🤷", "👋", "✨", "💡", "📌", "⚡",
];

// ============================================
// PLATFORM CHAR LIMITS
// ============================================

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
  tiktok: 2200,
};

// ============================================
// MENTION SUGGESTION RENDERER
// ============================================

// Tiptap mention suggestion types (simplified for our use case)
interface MentionSuggestionProps {
  clientRect: (() => DOMRect | null) | null;
  items: MentionUser[];
  selectedIndex: number;
  command: (item: MentionUser) => void;
  event?: KeyboardEvent;
}

interface MentionCommandProps {
  editor: Editor;
  range: { from: number; to: number };
  props: MentionUser;
}

function createMentionSuggestion(users: MentionUser[]) {
  return {
    items: ({ query }: { query: string }) => {
      return users
        .filter((user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8);
    },
    render: () => {
      let popup: HTMLElement | null = null;

      return {
        onStart: (props: MentionSuggestionProps) => {
          popup = document.createElement("div");
          popup.className = "bg-white border rounded-lg shadow-lg py-1 z-50 min-w-[200px]";
          document.body.appendChild(popup);

          const updatePosition = () => {
            const rect = props.clientRect?.();
            if (rect && popup) {
              popup.style.position = "fixed";
              popup.style.left = `${rect.left}px`;
              popup.style.top = `${rect.bottom + 4}px`;
            }
          };

          const updateContent = () => {
            if (!popup) return;

            if (props.items.length === 0) {
              popup.innerHTML = `
                <div class="px-3 py-2 text-sm text-gray-500">
                  No users found
                </div>
              `;
              return;
            }

            popup.innerHTML = props.items
              .map((item: MentionUser, index: number) => `
                <div
                  class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    index === props.selectedIndex ? "bg-gray-100" : ""
                  }"
                  data-index="${index}"
                >
                  <div class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                    ${item.avatarUrl
                      ? `<img src="${item.avatarUrl}" class="w-7 h-7 rounded-full" />`
                      : item.name.charAt(0).toUpperCase()
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">${item.name}</div>
                    ${item.email ? `<div class="text-xs text-gray-500 truncate">${item.email}</div>` : ""}
                  </div>
                </div>
              `)
              .join("");

            popup.querySelectorAll("[data-index]").forEach((el) => {
              el.addEventListener("click", () => {
                const idx = parseInt(el.getAttribute("data-index") || "0");
                props.command(props.items[idx]);
              });
            });
          };

          updatePosition();
          updateContent();
        },
        onUpdate: (props: MentionSuggestionProps) => {
          const rect = props.clientRect?.();
          if (rect && popup) {
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + 4}px`;
          }

          if (!popup) return;

          if (props.items.length === 0) {
            popup.innerHTML = `
              <div class="px-3 py-2 text-sm text-gray-500">
                No users found
              </div>
            `;
            return;
          }

          popup.innerHTML = props.items
            .map((item: MentionUser, index: number) => `
              <div
                class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  index === props.selectedIndex ? "bg-gray-100" : ""
                }"
                data-index="${index}"
              >
                <div class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                  ${item.avatarUrl
                    ? `<img src="${item.avatarUrl}" class="w-7 h-7 rounded-full" />`
                    : item.name.charAt(0).toUpperCase()
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">${item.name}</div>
                  ${item.email ? `<div class="text-xs text-gray-500 truncate">${item.email}</div>` : ""}
                </div>
              </div>
            `)
            .join("");

          popup.querySelectorAll("[data-index]").forEach((el) => {
            el.addEventListener("click", () => {
              const idx = parseInt(el.getAttribute("data-index") || "0");
              props.command(props.items[idx]);
            });
          });
        },
        onKeyDown: (props: MentionSuggestionProps) => {
          if (props.event?.key === "Escape") {
            popup?.remove();
            popup = null;
            return true;
          }
          return false;
        },
        onExit: () => {
          popup?.remove();
          popup = null;
        },
      };
    },
    command: ({ editor, range, props }: MentionCommandProps) => {
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
    },
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  function RichTextEditor(
    {
      variant = "standard",
      value,
      defaultValue,
      onChange,
      onBlur,
      placeholder = "Write something...",
      disabled = false,
      readOnly = false,
      className,
      editorClassName,
      users = [],
      channels: _channels = [],
      onMention: _onMention,
      maxLength,
      showCharCount = false,
      enableAI = false,
      onAIAction,
      hideToolbar = false,
      toolbarPosition = "top",
      submitOnEnter = false,
      onSubmit,
    },
    ref
  ) {
    const [linkUrl, setLinkUrl] = useState("");
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);

    // Determine which features to enable based on variant
    const features = {
      bold: true,
      italic: true,
      underline: variant !== "minimal" && variant !== "form-help",
      lists: variant !== "form-help",
      orderedList: variant === "full" || variant === "standard",
      link: variant !== "minimal" && variant !== "form-help",
      code: variant === "standard" || variant === "full" || variant === "mentions",
      quote: variant === "full" || variant === "standard",
      headings: variant === "full",
      alignment: variant === "full",
      mentions: variant === "mentions" || variant === "full" || variant === "caption",
      charCount: variant === "caption" || showCharCount,
      ai: enableAI,
    };

    // Build extensions based on features
    const extensions = [
      StarterKit.configure({
        heading: features.headings ? { levels: [1, 2] } : false,
        bulletList: features.lists ? { HTMLAttributes: { class: "list-disc ml-4" } } : false,
        orderedList: features.orderedList ? { HTMLAttributes: { class: "list-decimal ml-4" } } : false,
        blockquote: features.quote ? { HTMLAttributes: { class: "border-l-4 border-gray-300 pl-4 italic" } } : false,
        code: features.code ? { HTMLAttributes: { class: "bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" } } : false,
        codeBlock: features.code ? { HTMLAttributes: { class: "bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm" } } : false,
      }),
      Placeholder.configure({ placeholder }),
    ];

    if (features.underline) {
      extensions.push(Underline);
    }

    if (features.link) {
      extensions.push(
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: "text-blue-600 underline hover:text-blue-800" },
        })
      );
    }

    if (features.alignment) {
      extensions.push(
        TextAlign.configure({ types: ["heading", "paragraph"] })
      );
    }

    if (features.mentions && users.length > 0) {
      extensions.push(
        Mention.configure({
          HTMLAttributes: { class: "bg-blue-100 text-blue-700 px-1 rounded font-medium" },
          suggestion: createMentionSuggestion(users),
        })
      );
    }

    if (features.charCount || maxLength) {
      extensions.push(
        CharacterCount.configure({ limit: maxLength })
      );
    }

    // Initialize editor
    const editor = useEditor({
      extensions,
      content: value || defaultValue || "",
      editable: !disabled && !readOnly,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML(), editor.getJSON());
      },
      onBlur: () => onBlur?.(),
      editorProps: {
        attributes: {
          class: cn(
            "prose prose-sm max-w-none focus:outline-none",
            variant === "form-help" && "text-sm",
            variant === "caption" && "min-h-[100px]",
            variant === "full" && "min-h-[200px]",
            editorClassName
          ),
        },
        handleKeyDown: (view, event) => {
          if (submitOnEnter && event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit?.(editor?.getHTML() || "");
            return true;
          }
          return false;
        },
      },
    });

    // Sync external value changes
    useEffect(() => {
      if (editor && value !== undefined && value !== editor.getHTML()) {
        editor.commands.setContent(value);
      }
    }, [editor, value]);

    // Expose editor methods via ref
    useImperativeHandle(ref, () => ({
      editor,
      getHTML: () => editor?.getHTML() || "",
      getJSON: () => editor?.getJSON() || { type: "doc", content: [] },
      getText: () => editor?.getText() || "",
      clear: () => editor?.commands.clearContent(),
      focus: () => editor?.commands.focus(),
      insertContent: (content: string) => editor?.commands.insertContent(content),
      setContent: (content: string) => editor?.commands.setContent(content),
    }));

    // Insert emoji
    const insertEmoji = (emoji: string) => {
      editor?.chain().focus().insertContent(emoji).run();
    };

    // Set link
    const setLink = () => {
      if (linkUrl) {
        editor
          ?.chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: linkUrl })
          .run();
      } else {
        editor?.chain().focus().unsetLink().run();
      }
      setShowLinkInput(false);
      setLinkUrl("");
    };

    // Handle AI action - uses provided handler or built-in server action
    const handleAIAction = async (action: AIAction) => {
      if (!editor) return;

      const selectedText = editor.state.selection.empty
        ? editor.getText()
        : editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to
          );

      if (!selectedText || selectedText.trim().length === 0) {
        return;
      }

      setIsAILoading(true);

      try {
        let result: string;

        if (onAIAction) {
          // Use custom handler if provided
          result = await onAIAction(action, selectedText);
        } else {
          // Use built-in server action
          const response = await performAIAction({
            action,
            text: selectedText,
          });

          if (!response.success || !response.result) {
            console.error("AI action failed:", response.error);
            return;
          }

          result = response.result;
        }

        // Replace content
        if (editor.state.selection.empty) {
          editor.commands.setContent(result);
        } else {
          editor.commands.insertContentAt(
            { from: editor.state.selection.from, to: editor.state.selection.to },
            result
          );
        }
      } catch (error) {
        console.error("AI action error:", error);
      } finally {
        setIsAILoading(false);
      }
    };

    if (!editor) return null;

    const charCount = editor.storage.characterCount?.characters() || 0;
    const charLimit = maxLength || (variant === "caption" ? PLATFORM_LIMITS.instagram : undefined);
    const isOverLimit = charLimit && charCount > charLimit;

    // Toolbar component
    const Toolbar = () => (
      <div className="flex items-center gap-0.5 flex-wrap">
        {/* Undo/Redo */}
        {variant === "full" && (
          <>
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              tooltip="Undo"
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              tooltip="Redo"
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarDivider />
          </>
        )}

        {/* Headings */}
        {features.headings && (
          <>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive("heading", { level: 1 })}
              tooltip="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive("heading", { level: 2 })}
              tooltip="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarDivider />
          </>
        )}

        {/* Basic formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          tooltip="Bold (⌘B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          tooltip="Italic (⌘I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        {features.underline && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            tooltip="Underline (⌘U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
        )}

        {features.code && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            tooltip="Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
        )}

        {(features.lists || features.link) && <ToolbarDivider />}

        {/* Lists */}
        {features.lists && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            tooltip="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
        )}
        {features.orderedList && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            tooltip="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        )}

        {features.quote && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            tooltip="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        )}

        {/* Alignment */}
        {features.alignment && (
          <>
            <ToolbarDivider />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              active={editor.isActive({ textAlign: "left" })}
              tooltip="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              active={editor.isActive({ textAlign: "center" })}
              tooltip="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              active={editor.isActive({ textAlign: "right" })}
              tooltip="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </>
        )}

        {/* Link */}
        {features.link && (
          <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", editor.isActive("link") && "bg-gray-100")}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 border rounded-md text-sm"
                  onKeyDown={(e) => e.key === "Enter" && setLink()}
                />
                <Button size="sm" onClick={setLink}>
                  {linkUrl ? "Set" : "Remove"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Mentions trigger */}
        {features.mentions && users.length > 0 && (
          <>
            <ToolbarDivider />
            <ToolbarButton
              onClick={() => editor.chain().focus().insertContent("@").run()}
              tooltip="Mention (@)"
            >
              <AtSign className="h-4 w-4" />
            </ToolbarButton>
          </>
        )}

        {/* Emoji */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-8 gap-1">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="p-1 hover:bg-gray-100 rounded text-lg"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* AI Actions */}
        {features.ai && (
          <>
            <ToolbarDivider />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 px-2"
                  disabled={isAILoading}
                >
                  {isAILoading ? (
                    <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  )}
                  <span className="text-xs">{isAILoading ? "Processing..." : "AI"}</span>
                  {!isAILoading && <ChevronDown className="h-3 w-3" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => handleAIAction("translate_ar")}
                  disabled={isAILoading}
                >
                  <Languages className="h-4 w-4 mr-2" />
                  Translate to Arabic
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAIAction("translate_en")}
                  disabled={isAILoading}
                >
                  <Languages className="h-4 w-4 mr-2" />
                  Translate to English
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleAIAction("polish")}
                  disabled={isAILoading}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Polish & fix grammar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAIAction("expand")}
                  disabled={isAILoading}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Expand content
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAIAction("summarize")}
                  disabled={isAILoading}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Summarize
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAIAction("simplify")}
                  disabled={isAILoading}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Simplify language
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleAIAction("formal")}
                  disabled={isAILoading}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Make formal
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAIAction("casual")}
                  disabled={isAILoading}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Make casual
                </DropdownMenuItem>
                {variant === "caption" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleAIAction("generate_caption")}
                      disabled={isAILoading}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate caption
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    );

    return (
      <div
        className={cn(
          "border rounded-lg bg-white",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {/* Top toolbar */}
        {!hideToolbar && toolbarPosition === "top" && (
          <div className="border-b px-2 py-1">
            <Toolbar />
          </div>
        )}

        {/* Editor */}
        <div className={cn(
          "px-3 py-2",
          variant === "form-help" && "px-2 py-1",
        )}>
          <EditorContent editor={editor} />
        </div>

        {/* Bottom toolbar or char count */}
        {(!hideToolbar && toolbarPosition === "bottom") || features.charCount ? (
          <div className="border-t px-2 py-1 flex items-center justify-between">
            {!hideToolbar && toolbarPosition === "bottom" && <Toolbar />}
            {features.charCount && (
              <div
                className={cn(
                  "text-xs ml-auto",
                  isOverLimit ? "text-red-500" : "text-gray-400"
                )}
              >
                {charCount}
                {charLimit && ` / ${charLimit}`}
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  }
);

// ============================================
// HELPER COMPONENTS
// ============================================

function ToolbarButton({
  children,
  onClick,
  active = false,
  disabled = false,
  tooltip,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tooltip?: string;
}) {
  const button = (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", active && "bg-gray-100")}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

// ============================================
// EXPORTS
// ============================================

export default RichTextEditor;
