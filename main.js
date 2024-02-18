import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/module.esm.min.js';
import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.min.mjs';

const worker = Comlink.wrap(new Worker('worker.js', { type: 'module' }));

Alpine.data('app', () => ({
  messages: [],
  prompt: '',
  files: {},
  ready: false,
  get loaded() {
    return sum(pluck(Object.values(this.files), 'loaded'));
  },
  get loadedStr() {
    return formatBytes(this.loaded);
  },
  get total() {
    return sum(pluck(Object.values(this.files), 'total'));
  },
  get totalStr() {
    return formatBytes(this.total);
  },
  get progress() {
    return !this.total ? 0 : (this.loaded / this.total) * 100;
  },
  async generate() {
    this.messages.push({ role: 'user', content: this.prompt });
    this.prompt = '';

    if (!this.ready) {
      await worker.init(
        'Xenova/Qwen1.5-0.5B-Chat',
        Comlink.proxy(({ status, file, loaded, total }) => {
          if (status === 'progress') this.files[file] = { loaded, total };
          if (status === 'ready') this.ready = true;
        }),
      );
    }

    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...Alpine.raw(this.messages),
    ];

    await worker.exec(
      messages,
      Comlink.proxy((output) => {
        if (this.messages.at(-1).role === 'user') {
          this.messages.push({ role: 'assistant', content: output });
        } else {
          this.messages.at(-1).content = output;
        }
      }),
    );
  },
}));

const pluck = (arr, key) => arr.map((obj) => obj[key]);
const sum = (arr) => arr.reduce((acc, val) => acc + val, 0);
const formatBytes = (number) =>
  number.toLocaleString('en', {
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'narrow',
    notation: 'compact',
  });

Alpine.start();
