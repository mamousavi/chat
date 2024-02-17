import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.0';
import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.mjs';

let generator;

Comlink.expose({
  init: async (modelName, progress_callback) => {
    generator = await pipeline('text-generation', modelName, {
      progress_callback,
    });
  },
  exec: async (messages, cb) => {
    const text = generator.tokenizer.apply_chat_template(messages, {
      tokenize: false,
      add_generation_prompt: true,
    });

    await generator(text, {
      max_new_tokens: 128,
      do_sample: false,
      callback_function: (beams) =>
        cb(
          generator.tokenizer.decode(
            beams[0].output_token_ids.slice(beams[0].input.size),
            { skip_special_tokens: true },
          ),
        ),
    });
  },
});
