/**
 * Chat Components Exports
 *
 * @module chat/components
 */

// Core Components
export { ChannelSidebar } from "./ChannelSidebar";
export { MessageEditor } from "./MessageEditor";
export { MessageList } from "./MessageList";
export { ThreadView } from "./ThreadView";

// Presence & Status
export { PresenceIndicator, AvatarWithPresence, PresenceBadge } from "./PresenceIndicator";
export { TypingIndicator, useTyping } from "./TypingIndicator";

// Search
export { MessageSearch, SearchTrigger } from "./MessageSearch";

// File Uploads
export {
  FileUploadButton,
  FilePreviewStrip,
  MessageAttachments,
  type FileUploadItem,
  type MessageAttachment,
} from "./FileUpload";

// Settings
export { NotificationSettings } from "./NotificationSettings";
