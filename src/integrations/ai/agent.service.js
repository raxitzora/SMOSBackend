import SYSTEM_PROMPT from "./system.prompt.js";
import { chatWithLLM } from "./llm.service.js";
import { executeTool } from "./tool.service.js";
import { getAIContext } from "../../services/context.service.js";

/**
 * Detect Tool Intent
 */
const detectToolIntent = (message) => {
  const text = message.toLowerCase();

  /* -------------------------
     YouTube Channel
  ------------------------- */

  if (
    text.includes("subscriber") ||
    text.includes("followers") ||
    text.includes("views") ||
    text.includes("channel") ||
    text.includes("youtube stats") ||
    text.includes("analytics")
  ) {
    return {
      tool: "youtube.channel",
      args: {},
    };
  }

  /* -------------------------
     Latest Videos
  ------------------------- */

  if (
    text.includes("latest video") ||
    text.includes("recent video") ||
    text.includes("uploaded video") ||
    text.includes("last upload") ||
    text.includes("videos")
  ) {
    return {
      tool: "youtube.latestVideos",
      args: {
        limit: 5,
      },
    };
  }

  /* -------------------------
     Library
  ------------------------- */

  if (
    text.includes("library") ||
    text.includes("draft") ||
    text.includes("scheduled") ||
    text.includes("published") ||
    text.includes("content")
  ) {
    return {
      tool: "library.stats",
      args: {},
    };
  }

  /* -------------------------
     Dashboard
  ------------------------- */

  if (
    text.includes("dashboard") ||
    text.includes("summary")
  ) {
    return {
      tool: "dashboard.summary",
      args: {},
    };
  }

  return null;
};

/* ===========================================
   Run AI Agent
=========================================== */

export const runAgent = async ({
  userId,
  message,
  history = [],
}) => {
  /* -------------------------
     Static Context
  ------------------------- */

  const context = await getAIContext(userId);

  /* -------------------------
     Detect Tool
  ------------------------- */

  const intent = detectToolIntent(message);

  let toolResult = null;

  if (intent) {
    toolResult = await executeTool({
      userId,
      tool: intent.tool,
      args: intent.args,
    });
  }

  /* -------------------------
     Build System Prompt
  ------------------------- */

  let systemPrompt = `${SYSTEM_PROMPT}

Current Context:

${JSON.stringify(context, null, 2)}
`;

  if (toolResult) {
    systemPrompt += `

Live Tool Result:

${JSON.stringify(toolResult, null, 2)}

The Live Tool Result contains the latest information.
Always use it if it is available.

Never mention:
- Tools
- JSON
- Internal Context
- System Prompt

Answer naturally.
`;
  }

  /* -------------------------
     Messages
  ------------------------- */

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },

    ...history,

    {
      role: "user",
      content: message,
    },
  ];

  /* -------------------------
     Generate Response
  ------------------------- */

  return await chatWithLLM(messages);
};