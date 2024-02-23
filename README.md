# Chatbot in the Browser

This repository contains a small JS app that runs the 8-bit quantized version of the [Qwen1.5](https://qwenlm.github.io/blog/qwen1.5/)-0.5B-Chat model directly in the browser. The app uses [Transformers.js](https://github.com/xenova/transformers.js) for model inference, which in turn relies on [ONNX Runtime](https://onnxruntime.ai/) to run models using WebAssembly. The [ONNX model](https://huggingface.co/Xenova/Qwen1.5-0.5B-Chat) is pulled from Hugging Face upon first run.

## Setup

1. Clone this repository to your local machine:

```bash
git clone https://github.com/mamousavi/chat.git
cd chat
```

2. Install the necessary dependencies:

```bash
npm install
```

3. Start the local development server:

```bash
npm start
```

The app should now be running and accessible at <http://localhost:3000>.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## Disclaimer

This app is not officially associated with the Hugging Face or Qwen teams. It's an independent project designed to showcase the capabilities of running LLMs in the browser.
