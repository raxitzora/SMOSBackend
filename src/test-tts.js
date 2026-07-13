import "dotenv/config";

import { textToSpeech } from "./services/speech.service.js";

const result = await textToSpeech(
  "Hello Raxit, welcome to SMOS."
);

console.log(result);