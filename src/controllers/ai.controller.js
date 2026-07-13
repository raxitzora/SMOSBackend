import {
  chat,
  getChats,
  getChatMessages,
  deleteChat,
} from "../services/ai.service.js";
import fs from "fs/promises";


import {
  speechToText,
  textToSpeech,
} from "../services/speech.service.js";



/**
 * Chat with AI
 */
export const sendMessage = async (
  req,
  res
) => {
  try {
    const { chatId, message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const response = await chat({
      userId: req.user.id,
      chatId,
      message,
    });

    return res.status(200).json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Chat List
 */
export const getAllChats = async (
  req,
  res
) => {
  try {
    const chats = await getChats(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: chats,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Chat Messages
 */
export const getMessages = async (
  req,
  res
) => {
  try {
    const messages =
      await getChatMessages(
        req.user.id,
        req.params.chatId
      );

    return res.status(200).json({
      success: true,
      data: messages,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Chat
 */
export const removeChat = async (
  req,
  res
) => {
  try {
    const deleted =
      await deleteChat(
        req.user.id,
        req.params.chatId
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Chat deleted successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const voiceChat = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required.",
      });
    }

    const { chatId } = req.body;

    /* -------------------------
       Speech -> Text
    ------------------------- */

    const message = await speechToText(
      req.file.path
    );

    /* -------------------------
       AI
    ------------------------- */

    const ai = await chat({
      userId: req.user.id,
      chatId,
      message,
    });

    /* -------------------------
       Text -> Speech
    ------------------------- */

  return res.status(200).json({
    success:true,

    data:{
        ...ai,

        transcript:message,

        audio:voice.audio,
    }
});

    /* -------------------------
       Remove Audio
    ------------------------- */

    await fs.unlink(req.file.path);

    return res.status(200).json({
      success: true,

      data: {
        ...ai,

        transcript: message,

        audio: voice.audio,
      },
    });

  } catch (error) {

    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};