# <img src="src/icon128.png" width="48" height="48" align="center"> Audio Summary Plugin

A modern Google Chrome extension that leverages OpenAI's GPT-4o to provide concise or detailed summaries of any webpage, with integrated Text-to-Speech (TTS) for hands-free consumption.

## 🚀 Features

- **Dual Summary Modes**:
  - **Short Summary**: A high-density, 2-3 sentence overview of the core message.
  - **Full Summary**: A comprehensive 3-5 paragraph breakdown of all key points.
- **Audio Playback**: Listen to your summaries using high-quality system voices.
- **Background Persistence**: Audio continues playing even if you switch tabs or close the extension popup.
- **Session Persistence**: The last generated summary stays in the textbox until you create a new one.
- **Dark Mode UI**: A sleek, eye-friendly interface designed for modern browsing.
- **Customizable Voices**: Choose your preferred system voice (defaults to macOS Samantha) with a built-in test feature.
- **Secure**: Your OpenAI API key is stored locally in your browser's secure storage.

## 🛠 Installation

1. **Clone or Download** this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click the **Load unpacked** button.
5. Select the root folder of this project (the folder containing `manifest.json`).

## ⚙️ Configuration

1. After installation, click the extension icon in your toolbar.
2. Click the **⚙️ Settings (API Key)** link at the bottom of the popup.
3. Enter your **OpenAI API Key**. You can generate one at the [OpenAI Platform](https://platform.openai.com/api-keys).
4. (Optional) Select your **Preferred Voice** from the dropdown and use the **Test** button to hear a sample.
5. Click **Save Settings**.

## 📖 How to Use

1. Navigate to any website you want to summarize.
2. Click the **Audio Summary Plugin** icon in your Chrome toolbar.
3. Choose either **Short Summary** or **Full Summary**.
4. Once the summary appears, click **🔊 Read Aloud** to listen.
5. Click **🛑 Stop Reading** at any time to silence the audio.

## 📄 License

This project is open-source and available for personal use.

---
*Note: This extension requires an active OpenAI API key with available credits to function.*