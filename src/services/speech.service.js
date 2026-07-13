import fs from "fs";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ===========================================
   Speech To Text
=========================================== */

export const speechToText = async (audioPath) => {
  try {
    const transcription =
      await groq.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: "whisper-large-v3-turbo",
        response_format: "verbose_json",
      });

    return transcription.text;
  } catch (error) {
    console.error("Speech transcription error:", error);
    throw new Error("Speech transcription failed.");
  } finally {
    // Remove uploaded temporary file
    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  }
};

/* ===========================================
   Text To Speech (Placeholder)
=========================================== */

export const textToSpeech = async (text) => {
  return {
    text,
  };
};