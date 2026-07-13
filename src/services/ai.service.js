import pool from "../config/db.js";
import { runAgent } from "../integrations/ai/agent.service.js";

/* ===========================================
   Create Chat
=========================================== */

export const createChat = async (userId) => {
  const result = await pool.query(
    `
    INSERT INTO ai_chats
    (
      user_id,
      title
    )
    VALUES
    (
      $1,
      'New Chat'
    )
    RETURNING *
    `,
    [userId]
  );

  return result.rows[0];
};

/* ===========================================
   Get Chats
=========================================== */

export const getChats = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM ai_chats
    WHERE user_id = $1
    ORDER BY updated_at DESC
    `,
    [userId]
  );

  return result.rows;
};

/* ===========================================
   Get Chat Messages
=========================================== */

export const getChatMessages = async (
  userId,
  chatId
) => {
  const chat = await pool.query(
    `
    SELECT id
    FROM ai_chats
    WHERE id = $1
    AND user_id = $2
    `,
    [chatId, userId]
  );

  if (!chat.rows.length) {
    throw new Error("Chat not found.");
  }

  const result = await pool.query(
    `
    SELECT
      role,
      content
    FROM ai_messages
    WHERE chat_id = $1
    ORDER BY created_at ASC
    `,
    [chatId]
  );

  return result.rows;
};

/* ===========================================
   Delete Chat
=========================================== */

export const deleteChat = async (
  userId,
  chatId
) => {
  const result = await pool.query(
    `
    DELETE FROM ai_chats
    WHERE id = $1
    AND user_id = $2
    RETURNING *
    `,
    [chatId, userId]
  );

  return result.rows[0];
};

/* ===========================================
   Chat
=========================================== */

export const chat = async ({
  userId,
  chatId,
  message,
  inputType = "text",
}) => {

  console.log("================================");
  console.log("AI CHAT");
  console.log("================================");
  console.log("User:", userId);
  console.log("Chat:", chatId);
  console.log("Input:", inputType);
  console.log("Message:", message);

  /* -----------------------
     Create Chat
  ------------------------ */

  if (!chatId) {
    console.log("Creating new chat...");

    const newChat =
      await createChat(userId);

    chatId = newChat.id;

    console.log("Chat Created:", chatId);
  }

  /* -----------------------
     Load History
  ------------------------ */

  console.log("Loading history...");

  const history =
    await getChatMessages(
      userId,
      chatId
    );

  console.log(
    `History Messages: ${history.length}`
  );

  /* -----------------------
     AI Agent
  ------------------------ */

  console.log("Running Agent...");

  const response =
    await runAgent({
      userId,
      message,
      history,
    });

  console.log("Agent Finished");

  /* -----------------------
     Save User Message
  ------------------------ */

  await pool.query(
    `
    INSERT INTO ai_messages
    (
      chat_id,
      role,
      content,
      input_type
    )
    VALUES
    (
      $1,
      'user',
      $2,
      $3
    )
    `,
    [
      chatId,
      message,
      inputType,
    ]
  );

  /* -----------------------
     Save Assistant Message
  ------------------------ */

await pool.query(
  `
  INSERT INTO ai_messages
  (
    chat_id,
    role,
    content,
    model,
    prompt_tokens,
    completion_tokens,
    total_tokens,
    input_type
  )
  VALUES
  (
    $1,
    'assistant',
    $2,
    $3,
    $4,
    $5,
    $6,
    'text'
  )
  `,
  [
    chatId,
    response.content,
    response.model,
    response.promptTokens,
    response.completionTokens,
    response.totalTokens,
  ]
);

  /* -----------------------
     Rename Chat
  ------------------------ */

  const count = await pool.query(
    `
    SELECT COUNT(*)
    FROM ai_messages
    WHERE chat_id = $1
    AND role = 'user'
    `,
    [chatId]
  );

  if (
    Number(count.rows[0].count) === 1
  ) {
    await pool.query(
      `
      UPDATE ai_chats
      SET
        title = $1,
        updated_at = NOW()
      WHERE id = $2
      `,
      [
        message.slice(0, 50),
        chatId,
      ]
    );
  } else {
    await pool.query(
      `
      UPDATE ai_chats
      SET updated_at = NOW()
      WHERE id = $1
      `,
      [chatId]
    );
  }

  console.log("AI Finished Successfully");
  console.log("================================");

  return {
    chatId,

    reply: response.content,

    model: response.model,

    usage: {
      promptTokens:
        response.promptTokens,

      completionTokens:
        response.completionTokens,

      totalTokens:
        response.totalTokens,
    },
  };
};