import ollama from "ollama";

const MODEL = process.env.OLLAMA_MODEL || "qwen3:1.7b";

/**
 * Chat with Ollama
 */
export const chatWithLLM = async (messages) => {
  console.log("Inside chatWithLLM()");
console.log("Model:", MODEL);
console.log("Messages Count:", messages.length);
  try {
        console.log("Sending request to Ollama...");
        console.log("Received response from Ollama");


    const response = await ollama.chat({
      model: MODEL,

      messages,

      stream: false,
    });
        console.log("Ollama finished.");


    return {
      content: response.message.content,
      model: response.model,
      promptTokens:
        response.prompt_eval_count || 0,
      completionTokens:
        response.eval_count || 0,
      totalTokens:
        (response.prompt_eval_count || 0) +
        (response.eval_count || 0),
    };
  } catch (error) {
    console.error(
      "LLM Error:",
      error.message
    );

    throw new Error(
      "Unable to generate AI response."
    );
  }
};

/**
 * Check whether Ollama is running
 */
export const checkLLMHealth =
  async () => {
    try {
      await ollama.list();

      return true;
    } catch {
      return false;
    }
  };