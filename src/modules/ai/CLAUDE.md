# AI Module

## Overview

Unified AI integration for the platform using OpenAI GPT-4. Provides translation (EN↔AR), content enhancement, and caption generation capabilities.

## Architecture

```
/src/modules/ai
├── actions.ts     # Server actions for AI operations
├── index.ts       # Exports
└── CLAUDE.md      # This file

/src/lib/ai.ts     # Core AI service with OpenAI integration
```

## Configuration

Add to `.env`:

```bash
OPENAI_API_KEY=sk-...
```

## Available Actions

| Action | Description | Model |
|--------|-------------|-------|
| `translate_ar` | Translate to Arabic (Gulf dialect) | GPT-3.5 Turbo |
| `translate_en` | Translate to English | GPT-3.5 Turbo |
| `polish` | Fix grammar, improve clarity | GPT-3.5 Turbo |
| `expand` | Expand with more detail (2-3x) | GPT-4 Turbo |
| `summarize` | Condense to key points (~1/3) | GPT-4 Turbo |
| `simplify` | Use simpler language | GPT-4 Turbo |
| `formal` | Professional business tone | GPT-4 Turbo |
| `casual` | Friendly, conversational tone | GPT-4 Turbo |
| `generate_caption` | Generate social media caption | GPT-4 Turbo |

## Usage Examples

### In RichTextEditor

The editor has built-in AI support - just enable it:

```tsx
<RichTextEditor
  variant="full"
  enableAI
  value={content}
  onChange={(html) => setContent(html)}
/>
```

Users can then:
1. Select text (or use full content if nothing selected)
2. Click AI dropdown in toolbar
3. Choose an action
4. Content is replaced with AI result

### With EditorProvider

For app-wide AI context:

```tsx
<EditorProvider
  users={users}
  currentUserId={userId}
  organizationId={orgId}
  enableAI
>
  <RichTextEditor variant="mentions" enableAI />
</EditorProvider>
```

### Standalone Server Actions

```typescript
import {
  translateToArabic,
  translateToEnglish,
  polishText,
  generateSocialCaption,
  generateBilingualCaption,
} from "@/modules/ai";

// Simple translation
const arabic = await translateToArabic("Hello world");

// Generate caption
const caption = await generateSocialCaption({
  topic: "New product launch",
  client: "CCAD",
  platform: "instagram",
  tone: "professional",
});

// Bilingual content
const bilingual = await generateBilingualCaption({
  topic: "Ramadan campaign",
  platform: "instagram",
});
// Returns: { english: "...", arabic: "..." }
```

### Standalone Hook (outside provider)

```tsx
import { useAIActions } from "@/components/editor/EditorProvider";

function MyComponent() {
  const {
    isLoading,
    error,
    translateToArabic,
    translateToEnglish,
    polish,
    expand,
    summarize,
    makeFormal,
    makeCasual,
  } = useAIActions();

  const handleTranslate = async () => {
    const result = await translateToArabic(text);
    if (result) {
      setText(result);
    }
  };

  return (
    <Button onClick={handleTranslate} disabled={isLoading}>
      {isLoading ? "Translating..." : "Translate to Arabic"}
    </Button>
  );
}
```

## Arabic Translation Notes

The translation is optimized for:
- Modern Standard Arabic (MSA)
- Gulf dialect influences appropriate for UAE audience
- Social media formatting (hashtags, mentions preserved)
- Marketing/advertising content

Example:
```
Input:  "Check out our new collection!"
Output: "تصفحوا مجموعتنا الجديدة!"
```

## Caption Generation

Captions include:
- Hook to grab attention
- Value proposition
- Call-to-action
- 5-10 relevant hashtags

Platform-specific guidelines are automatically applied:
- **Instagram**: Visual focus, line breaks, emojis, hashtags at end
- **Twitter/X**: Concise (280 chars), punchy, 1-3 hashtags
- **LinkedIn**: Professional, thought leadership, minimal emojis
- **TikTok**: Trendy, youthful, references to sounds/challenges
- **Facebook**: Conversational, shareable, questions work well

## Rate Limits

OpenAI rate limits apply. The module handles:
- 429 errors with user-friendly message
- Automatic retry not implemented (user should retry)
- Token usage logged to audit log

## Audit Logging

All AI actions are logged:

```typescript
{
  action: "AI_ACTION",
  entityType: "AI",
  entityId: "translate_ar",
  metadata: {
    action: "translate_ar",
    textLength: 150,
    platform: "instagram"
  }
}
```

## Cost Considerations

| Model | Input Cost | Output Cost |
|-------|------------|-------------|
| GPT-3.5 Turbo | $0.50/1M | $1.50/1M |
| GPT-4 Turbo | $10/1M | $30/1M |

Translation uses GPT-3.5 (fast, cheap).
Generation uses GPT-4 (quality critical).

## Future Enhancements

1. **Streaming**: Show text as it generates
2. **Batch Translation**: Translate entire content calendars
3. **Custom Prompts**: User-defined AI actions
4. **Tone Presets**: Client-specific brand voices
5. **Review Mode**: Show before/after diff
6. **Anthropic Fallback**: Switch provider on errors

## Dependencies

```bash
pnpm add openai
```

## Where It's Used

- **RichTextEditor**: All variants with `enableAI`
- **Content Engine**: Caption creation
- **Client Portal**: Not exposed to clients (internal only)
- **Chat**: Message polish/translate
