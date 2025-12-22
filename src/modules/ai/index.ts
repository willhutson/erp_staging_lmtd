/**
 * AI Module Exports
 *
 * @module modules/ai
 */

export {
  performAIAction,
  translateToArabic,
  translateToEnglish,
  polishText,
  generateSocialCaption,
  generateBilingualCaption,
  batchTranslate,
  detectLanguage,
} from "./actions";

export type { AIActionRequest, AIActionResponse } from "./actions";
