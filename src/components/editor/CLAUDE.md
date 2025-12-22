# Rich Text Editor System

## Overview

Unified Tiptap-based rich text editor used across the platform with:
- Multiple variants for different use cases
- @mentions with user autocomplete
- AI integration hooks (translation, polish, generation)
- Character counting for social captions

## Architecture

```
/src/components/editor
├── RichTextEditor.tsx      # Main editor component
├── EditorProvider.tsx      # Context provider for mentions/AI
├── index.ts               # Exports
└── CLAUDE.md              # This file

/src/components/forms/fields
└── RichTextField.tsx      # Form field wrapper
```

## Variants

| Variant | Features | Use Case |
|---------|----------|----------|
| `minimal` | Bold, italic, lists | Simple notes |
| `standard` | + links, code, quotes | Descriptions, feedback |
| `mentions` | + @user mentions | Team comments |
| `full` | + headings, alignment | Long-form content |
| `caption` | + char count, optimized | Social posts |
| `form-help` | Compact, inline | Form field help text |

## Usage Examples

### Basic Editor

```tsx
import { RichTextEditor } from "@/components/editor";

<RichTextEditor
  variant="standard"
  value={content}
  onChange={(html, json) => setContent(html)}
  placeholder="Write something..."
/>
```

### With @Mentions

```tsx
<RichTextEditor
  variant="mentions"
  users={[
    { id: "1", name: "John Doe", email: "john@example.com" },
    { id: "2", name: "Jane Smith" },
  ]}
  onMention={(type, id) => console.log(`Mentioned ${type}: ${id}`)}
/>
```

### Social Caption

```tsx
<RichTextEditor
  variant="caption"
  maxLength={2200}
  showCharCount
  placeholder="Write your caption..."
/>
```

### With AI Features

```tsx
<RichTextEditor
  variant="full"
  enableAI
  onAIAction={async (action, text) => {
    // Call AI API
    const result = await translateText(text, action);
    return result;
  }}
/>
```

### In Dynamic Forms

```typescript
// Form config
{
  id: "description",
  type: "richtext",
  label: "Project Description",
  config: {
    mentions: true,
    enableAI: true,
    variant: "full",
  }
}
```

## AI Actions

Available actions (implemented in Phase 18.4):

| Action | Description |
|--------|-------------|
| `translate_ar` | Translate to Arabic |
| `translate_en` | Translate to English |
| `polish` | Fix grammar, improve style |
| `expand` | Expand bullet points to paragraphs |
| `summarize` | Condense to key points |
| `simplify` | Use simpler language |
| `formal` | Make more professional |
| `casual` | Make more conversational |
| `generate_caption` | Generate social caption |

## Ref Methods

Access editor programmatically:

```tsx
const editorRef = useRef<RichTextEditorRef>(null);

// Methods
editorRef.current?.getHTML();      // Get HTML content
editorRef.current?.getJSON();      // Get JSON content
editorRef.current?.getText();      // Get plain text
editorRef.current?.clear();        // Clear content
editorRef.current?.focus();        // Focus editor
editorRef.current?.insertContent(text);  // Insert at cursor
editorRef.current?.setContent(html);     // Replace content
```

## Platform Character Limits

For `caption` variant:

| Platform | Limit |
|----------|-------|
| Twitter/X | 280 |
| Instagram | 2,200 |
| LinkedIn | 3,000 |
| TikTok | 2,200 |
| Facebook | 63,206 |

## Where It's Used

- **Chat**: Message composer
- **Briefs**: Description field (via DynamicForm)
- **Content Engine**: Captions, client feedback
- **Client Portal**: Approval comments, revision requests
- **Forms**: Any `richtext` field type

## Dependencies

```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-mention @tiptap/extension-link @tiptap/extension-character-count @tiptap/extension-underline @tiptap/extension-text-align
```

## Future Enhancements

1. **Phase 18.4**: Tiptap AI integration
2. **Image embeds**: Paste/drop images
3. **Tables**: Table support for documentation
4. **Collaborative editing**: Real-time co-editing
5. **Comments**: Inline comment threads
6. **Templates**: Insert pre-made content blocks
