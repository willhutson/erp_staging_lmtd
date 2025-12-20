export { slackClient } from "./client";
export type { SlackBlock, SlackChannel, SlackMessage } from "./client";
export {
  sendSlackNotification,
  sendToChannel,
  notifyBriefEvent,
  notifyApprovalNeeded,
  notifyDeadlineApproaching,
} from "./notification-service";
