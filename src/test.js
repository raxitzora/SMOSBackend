import { chatWithLLM } from "./integrations/ai/llm.service.js";

const test = async () => {
  try {
    const response = await chatWithLLM([
      {
        role: "user",
        content: "Hello, introduce yourself in one sentence.",
      },
    ]);

    console.log(response);

  } catch (error) {
    console.error(error);
  }
};

test();