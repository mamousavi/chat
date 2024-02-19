import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.0';
import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.min.mjs';

class ChatCompletions {
  #generatorPromise;

  #getGenerator(modelName, progress_callback) {
    if (!this.#generatorPromise) {
      this.#generatorPromise = pipeline('text-generation', modelName, {
        progress_callback,
      });
    }

    return this.#generatorPromise;
  }

  async create(modelName, messages, cb) {
    const generator = await this.#getGenerator(modelName, cb);

    const text = generator.tokenizer.apply_chat_template(messages, {
      tokenize: false,
      add_generation_prompt: true,
    });

    await generator(text, {
      max_new_tokens: 128,
      do_sample: false,
      callback_function: (beams) =>
        cb({
          status: 'update',
          output: generator.tokenizer.decode(
            beams[0].output_token_ids.slice(beams[0].input.size),
            { skip_special_tokens: true },
          ),
        }),
    });
  }
}

const chatCompletions = new ChatCompletions();
Comlink.expose(chatCompletions);
