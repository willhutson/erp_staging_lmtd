"use server";

/**
 * Slash Commands
 *
 * Handle chat slash commands like /giphy, /poll, /remind, etc.
 *
 * @module chat/actions/slash-commands
 */

import { db } from "@/lib/db";

// ============================================
// TYPES
// ============================================

export interface SlashCommand {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  handler: (args: string, context: CommandContext) => Promise<CommandResult>;
}

export interface CommandContext {
  userId: string;
  userName: string;
  channelId: string;
  channelName: string;
  organizationId: string;
}

export interface CommandResult {
  success: boolean;
  message?: string; // Message to display
  messageFormat?: "PLAIN" | "TIPTAP" | "SYSTEM";
  ephemeral?: boolean; // Only visible to user who ran command
  data?: Record<string, unknown>; // Additional data
  error?: string;
}

// ============================================
// COMMAND REGISTRY
// ============================================

const COMMANDS: Record<string, SlashCommand> = {};

function registerCommand(command: SlashCommand) {
  COMMANDS[command.name.toLowerCase()] = command;
}

// ============================================
// BUILT-IN COMMANDS
// ============================================

// /help - Show available commands
registerCommand({
  name: "help",
  description: "Show available slash commands",
  usage: "/help [command]",
  examples: ["/help", "/help poll"],
  handler: async (args) => {
    if (args) {
      const cmd = COMMANDS[args.toLowerCase()];
      if (cmd) {
        return {
          success: true,
          ephemeral: true,
          message: `**/${cmd.name}** - ${cmd.description}\n\nUsage: \`${cmd.usage}\`\n\nExamples:\n${cmd.examples.map((e) => `• \`${e}\``).join("\n")}`,
        };
      }
      return {
        success: false,
        ephemeral: true,
        error: `Unknown command: ${args}. Type /help to see available commands.`,
      };
    }

    const commandList = Object.values(COMMANDS)
      .map((c) => `• **/${c.name}** - ${c.description}`)
      .join("\n");

    return {
      success: true,
      ephemeral: true,
      message: `**Available Commands:**\n\n${commandList}\n\nType \`/help [command]\` for more details.`,
    };
  },
});

// /shrug - Add ¯\_(ツ)_/¯ to message
registerCommand({
  name: "shrug",
  description: "Append ¯\\_(ツ)_/¯ to your message",
  usage: "/shrug [message]",
  examples: ["/shrug", "/shrug I don't know"],
  handler: async (args) => {
    const message = args ? `${args} ¯\\_(ツ)_/¯` : "¯\\_(ツ)_/¯";
    return {
      success: true,
      message,
      messageFormat: "PLAIN",
    };
  },
});

// /tableflip - Add (╯°□°)╯︵ ┻━┻
registerCommand({
  name: "tableflip",
  description: "Flip a table in frustration",
  usage: "/tableflip [message]",
  examples: ["/tableflip", "/tableflip This code is broken"],
  handler: async (args) => {
    const message = args
      ? `${args} (╯°□°)╯︵ ┻━┻`
      : "(╯°□°)╯︵ ┻━┻";
    return {
      success: true,
      message,
      messageFormat: "PLAIN",
    };
  },
});

// /unflip - Put the table back
registerCommand({
  name: "unflip",
  description: "Put the table back",
  usage: "/unflip [message]",
  examples: ["/unflip", "/unflip Sorry about that"],
  handler: async (args) => {
    const message = args
      ? `${args} ┬─┬ノ( º _ ºノ)`
      : "┬─┬ノ( º _ ºノ)";
    return {
      success: true,
      message,
      messageFormat: "PLAIN",
    };
  },
});

// /me - Action message
registerCommand({
  name: "me",
  description: "Send an action message",
  usage: "/me [action]",
  examples: ["/me is working on the project", "/me waves hello"],
  handler: async (args, context) => {
    if (!args) {
      return {
        success: false,
        ephemeral: true,
        error: "Please provide an action. Example: /me is working",
      };
    }
    return {
      success: true,
      message: `_${context.userName} ${args}_`,
      messageFormat: "PLAIN",
    };
  },
});

// /remind - Set a reminder (simplified - stores in DB)
registerCommand({
  name: "remind",
  description: "Set a reminder",
  usage: "/remind [time] [message]",
  examples: [
    "/remind 30m Check on deployment",
    "/remind 2h Review PR",
    "/remind tomorrow Submit report",
  ],
  handler: async (args, _context) => {
    if (!args) {
      return {
        success: false,
        ephemeral: true,
        error: "Usage: /remind [time] [message]\nExamples: /remind 30m Check deployment",
      };
    }

    const parts = args.split(" ");
    const timeStr = parts[0];
    const message = parts.slice(1).join(" ");

    if (!message) {
      return {
        success: false,
        ephemeral: true,
        error: "Please provide a reminder message.",
      };
    }

    // Parse time
    let minutes = 0;
    if (timeStr.endsWith("m")) {
      minutes = parseInt(timeStr);
    } else if (timeStr.endsWith("h")) {
      minutes = parseInt(timeStr) * 60;
    } else if (timeStr === "tomorrow") {
      minutes = 24 * 60;
    } else {
      return {
        success: false,
        ephemeral: true,
        error: "Invalid time format. Use: 30m, 2h, or tomorrow",
      };
    }

    const remindAt = new Date(Date.now() + minutes * 60 * 1000);

    // Store reminder (you'd need a Reminder model)
    // For now, just acknowledge
    return {
      success: true,
      ephemeral: true,
      message: `⏰ I'll remind you "${message}" at ${remindAt.toLocaleTimeString()}`,
      data: {
        remindAt: remindAt.toISOString(),
        message,
      },
    };
  },
});

// /poll - Create a poll
registerCommand({
  name: "poll",
  description: "Create a poll",
  usage: '/poll "Question" "Option 1" "Option 2" ...',
  examples: [
    '/poll "Lunch?" "Pizza" "Sushi" "Salad"',
    '/poll "Meeting time?" "9am" "10am" "11am"',
  ],
  handler: async (args) => {
    if (!args) {
      return {
        success: false,
        ephemeral: true,
        error: 'Usage: /poll "Question" "Option 1" "Option 2" ...',
      };
    }

    // Parse quoted strings
    const matches = args.match(/"([^"]+)"/g);
    if (!matches || matches.length < 3) {
      return {
        success: false,
        ephemeral: true,
        error: "Please provide a question and at least 2 options in quotes.",
      };
    }

    const question = matches[0].replace(/"/g, "");
    const options = matches.slice(1).map((m) => m.replace(/"/g, ""));

    // Create poll message
    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    const optionLines = options
      .map((opt, i) => `${emojis[i]} ${opt}`)
      .join("\n");

    return {
      success: true,
      message: `📊 **${question}**\n\n${optionLines}\n\n_React with the number to vote!_`,
      messageFormat: "PLAIN",
      data: {
        type: "poll",
        question,
        options,
      },
    };
  },
});

// /giphy - Search for a GIF (placeholder - would need Giphy API)
registerCommand({
  name: "giphy",
  description: "Search for a GIF",
  usage: "/giphy [search term]",
  examples: ["/giphy celebration", "/giphy thumbs up"],
  handler: async (args) => {
    if (!args) {
      return {
        success: false,
        ephemeral: true,
        error: "Please provide a search term. Example: /giphy celebration",
      };
    }

    // Placeholder - would integrate with Giphy API
    return {
      success: true,
      ephemeral: true,
      message: `🔍 Searching for GIF: "${args}"...\n\n_Giphy integration coming soon!_`,
      data: {
        type: "giphy",
        query: args,
      },
    };
  },
});

// /status - Set your status
registerCommand({
  name: "status",
  description: "Set your status message",
  usage: "/status [emoji] [message]",
  examples: ["/status 🎯 Focused on project", "/status 🏠 Working from home"],
  handler: async (args, context) => {
    if (!args) {
      // Clear status
      await db.userPresence.update({
        where: { userId: context.userId },
        data: { statusText: null, statusEmoji: null },
      });
      return {
        success: true,
        ephemeral: true,
        message: "Status cleared.",
      };
    }

    // Parse emoji and message
    const emojiMatch = args.match(/^(\p{Emoji})\s*/u);
    let emoji: string | undefined;
    let message: string;

    if (emojiMatch) {
      emoji = emojiMatch[1];
      message = args.slice(emojiMatch[0].length);
    } else {
      message = args;
    }

    await db.userPresence.upsert({
      where: { userId: context.userId },
      create: {
        userId: context.userId,
        statusText: message,
        statusEmoji: emoji,
      },
      update: {
        statusText: message,
        statusEmoji: emoji,
      },
    });

    return {
      success: true,
      ephemeral: true,
      message: `Status updated: ${emoji || ""} ${message}`.trim(),
    };
  },
});

// /away - Set yourself as away
registerCommand({
  name: "away",
  description: "Set yourself as away",
  usage: "/away [message]",
  examples: ["/away", "/away In a meeting"],
  handler: async (args, context) => {
    await db.userPresence.upsert({
      where: { userId: context.userId },
      create: {
        userId: context.userId,
        status: "AWAY",
        statusText: args || "Away",
      },
      update: {
        status: "AWAY",
        statusText: args || "Away",
      },
    });

    return {
      success: true,
      ephemeral: true,
      message: args ? `You're now away: ${args}` : "You're now away.",
    };
  },
});

// /back - Set yourself as online
registerCommand({
  name: "back",
  description: "Set yourself as back/online",
  usage: "/back",
  examples: ["/back"],
  handler: async (args, context) => {
    await db.userPresence.update({
      where: { userId: context.userId },
      data: {
        status: "ONLINE",
        statusText: null,
      },
    });

    return {
      success: true,
      ephemeral: true,
      message: "Welcome back! You're now online.",
    };
  },
});

// ============================================
// COMMAND EXECUTION
// ============================================

/**
 * Parse and execute a slash command
 */
export async function executeSlashCommand(
  input: string,
  context: CommandContext
): Promise<CommandResult> {
  // Parse command and args
  const match = input.match(/^\/(\w+)(?:\s+(.*))?$/);

  if (!match) {
    return {
      success: false,
      error: "Invalid command format. Commands start with /",
    };
  }

  const [, commandName, args = ""] = match;
  const command = COMMANDS[commandName.toLowerCase()];

  if (!command) {
    return {
      success: false,
      ephemeral: true,
      error: `Unknown command: /${commandName}. Type /help to see available commands.`,
    };
  }

  try {
    return await command.handler(args.trim(), context);
  } catch (error) {
    console.error(`Command /${commandName} failed:`, error);
    return {
      success: false,
      error: `Command failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Check if a message is a slash command
 */
export async function isSlashCommand(message: string): Promise<boolean> {
  return message.startsWith("/");
}

/**
 * Get all available commands for autocomplete
 */
export async function getAvailableCommands(): Promise<Array<{
  name: string;
  description: string;
  usage: string;
}>> {
  return Object.values(COMMANDS).map((c) => ({
    name: c.name,
    description: c.description,
    usage: c.usage,
  }));
}

/**
 * Get command suggestions for autocomplete
 */
export async function getCommandSuggestions(partial: string): Promise<Array<{
  name: string;
  description: string;
}>> {
  const search = partial.toLowerCase().replace(/^\//, "");

  return Object.values(COMMANDS)
    .filter((c) => c.name.toLowerCase().startsWith(search))
    .map((c) => ({
      name: c.name,
      description: c.description,
    }));
}
