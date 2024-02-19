import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/module.esm.min.js';
import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.min.mjs';
import { against, when } from 'https://unpkg.com/match-iz@3/dist/index.mjs';

const worker = new Worker('worker.js', { type: 'module' });
const chatCompletions = Comlink.wrap(worker);

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

    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...Alpine.raw(this.messages),
    ];

    await chatCompletions.create(
      'Xenova/Qwen1.5-0.5B-Chat',
      messages,
      Comlink.proxy(
        against(
          when({ status: 'progress' }, ({ file, loaded, total }) => {
            this.files[file] = { loaded, total };
          }),
          when({ status: 'ready' }, () => {
            this.ready = true;
          }),
          when({ status: 'update' }, ({ output }) => {
            if (this.messages.at(-1).role === 'user') {
              this.messages.push({ role: 'assistant', content: output });
            } else {
              this.messages.at(-1).content = output;
            }
          }),
        ),
      ),
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
