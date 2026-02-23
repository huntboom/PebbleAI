# PebbleAI - AI-Powered Voice Assistant for Pebble Time

This project provides an AI-powered voice assistant for the Pebble Time watch. The assistant listens for your voice input, sends the transcriptions to an AI provider (OpenAI, Anthropic Claude, Google Gemini, DeepSeek, or Grok), and displays the response on the watch.

## Rebble Store
This app can be installed directly from the [Rebble Store](https://apps.rebble.io/en_US/application/64853961143b6504611fbc06).


## Getting Started

To use this project, you need a Rebble subscription for voice transcription and an API key for your chosen provider (OpenAI, Claude, Gemini, DeepSeek, or Grok).

### Installation

There are three ways to install PebbleAI (formerly known as PebbleAI) on your Pebble Time watch:

1. **Rebble Store (Recommended for most users):**
   The easiest way to install PebbleAI is directly from the [Rebble Store](https://apps.rebble.io/en_US/application/64853961143b6504611fbc06). Simply search for "PebbleAI" in the store and install it on your watch.

2. **Direct Installation from GitHub:**
   If you prefer not to use the Rebble Store, you can install a precompiled version:
   - Download the latest `.pbw` file from the [Releases section](https://github.com/huntboom/PebbleAI/releases) of the GitHub repository.
   - Install it onto your Pebble Time watch using the Pebble app on your phone.

3. **Manual Build and Installation:**
   For developers or users who want to modify the app:
   - Clone the [PebbleAI repository](https://github.com/huntboom/PebbleAI).
   - Import the project to the Pebble SDK.
   - Build the project.
   - Install the resulting `.pbw` file on your Pebble Time.

   For a detailed guide on the manual build process, refer to the Pebble development [documentation](https://developer.rebble.io/developer.pebble.com/tutorials/watchface-tutorial/part1/index.html).

### Usage

To use the voice assistant:

1. Open the PebbleAI app on your Pebble Time.
2. Press the "Select" button to start dictation.
3. Speak your query or command.
4. Wait for the AI's response to be displayed.

### Configuration

You can configure the app in two places:

- **Phone (Pebble app → PebbleAI → Settings):** API provider, API keys, model, system prompt, temperature, vibrate on response, confirm transcription, invert colors, show model name. These are stored on the phone and used for API calls.
- **Watch (in-app settings menu, long-press Select → Save Settings):** Vibrate, confirm transcription, and invert colors. These are stored on the watch. If you change them on the phone and then on the watch, the watch’s values apply until you save again from the phone.

Settings you can configure (phone or watch as above):

1. API Provider (OpenAI, Claude, Gemini, DeepSeek, or Grok)
2. API Key for the selected provider
3. Model selection (for OpenAI)
4. System prompt (for OpenAI)
5. Temperature setting
6. Vibration on response
7. Confirm transcription before sending
8. Light or Dark theme (invert colors)
9. Display model name at start of messages

Make sure to set the correct API key for your chosen provider before using the app.

## Contributing

Contributions to PebbleAI are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
