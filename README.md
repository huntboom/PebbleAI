# PebbleAI - AI-Powered Voice Assistant for Pebble Time

This project provides an AI-powered voice assistant for the Pebble Time watch. The assistant listens for your voice input, sends the transcriptions to either OpenAI's GPT, Anthropic's Claude, or Google's Gemini API, and displays the AI's response on the watch.

## Rebble Store
This app can be installed directly from the [Rebble Store](https://apps.rebble.io/en_US/application/64853961143b6504611fbc06).

## Code Overview

The project is split into several main files:

1. **main.c**: This is the main file for the Pebble watchapp, which is responsible for handling the user interface and dictation sessions. It uses Pebble's SDK to create a window, initiate dictation, and handle scrolling and button presses.

2. **api.js**: This JavaScript file runs on the smartphone. It handles the communication with either the OpenAI, Claude, or Gemini API, sending the transcriptions received from the watch and sending back the AI's responses.

3. **config.js**: This file manages the configuration options for the app, including API provider selection, API keys, and other settings.

4. **index.js**: This file handles the communication between the Pebble watch and the smartphone, routing messages and managing the conversation flow.

## Getting Started

To use this project, you need to have a Rebble Subscription for the voice transcriptions to work and an API key for your chosen provider (OpenAI, Claude, or Gemini).

### Installation

There are three ways to install PebbleAI (formerly known as PebbleGPT) on your Pebble Time watch:

1. **Rebble Store (Recommended for most users):**
   The easiest way to install PebbleAI is directly from the [Rebble Store](https://apps.rebble.io/en_US/application/64853961143b6504611fbc06). Simply search for "PebbleAI" in the store and install it on your watch.

2. **Direct Installation from GitHub:**
   If you prefer not to use the Rebble Store, you can install a precompiled version:
   - Download the latest `.pbw` file from the [Releases section](https://github.com/huntboom/PebbleGPT/releases) of the GitHub repository.
   - Install it onto your Pebble Time watch using the Pebble app on your phone.

3. **Manual Build and Installation:**
   For developers or users who want to modify the app:
   - Clone the [PebbleGPT repository](https://github.com/huntboom/PebbleGPT).
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

In the app settings, you can configure:

1. API Provider (OpenAI, Claude, or Gemini)
2. API Key for the selected provider
3. Model selection (for OpenAI)
4. System prompt
5. Temperature setting
6. Vibration on response

Make sure to set up the correct API key for your chosen provider before using the app.

## Contributing

Contributions to PebbleGPT are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
