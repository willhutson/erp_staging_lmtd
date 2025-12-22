/**
 * Rich Text Editor Exports
 *
 * Unified editor system for the platform.
 *
 * @module components/editor
 */

export { RichTextEditor } from "./RichTextEditor";
export type {
  RichTextEditorProps,
  RichTextEditorRef,
  RichTextVariant,
  MentionUser,
  MentionChannel,
  AIAction,
} from "./RichTextEditor";

export { EditorProvider, useEditorContext } from "./EditorProvider";
