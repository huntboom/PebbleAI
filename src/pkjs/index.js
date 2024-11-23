var Clay = require("pebble-clay");

// Configuration keys
var CONFIG_KEY = "config";
var API_KEY = "apiKey";
var MODEL = "model";
var SYSTEM_PROMPT = "systemPrompt";
var TEMPERATURE = "temperature";
var API_PROVIDER = "apiProvider";

// Maintain conversation history
var messages = [];

// Clay configuration
var clayConfig = [
  {
    type: "heading",
    defaultValue: "PebbleGPT Configuration",
  },
  {
    type: "text",
    defaultValue:
      "To use ChatGPT you will need " +
      "your <a href='https://platform.openai.com/account/api-keys'>own OpenAI API key</a> and " +
      "<a href='https://help.rebble.io/setup-subscription/#1'>a Rebble subscription</a> (for voice transcription).",
  },
  {
    type: "select",
    messageKey: "apiProvider",
    defaultValue: "openai",
    label: "API Provider",
    options: [
      {
        label: "OpenAI",
        value: "openai",
      },
      {
        label: "Claude",
        value: "claude",
      },
      {
        label: "Gemini",
        value: "gemini",
      },
    ],
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Required for OpenAI",
      },
      {
        type: "input",
        messageKey: "apiKey",
        label: "OpenAI API key",
      },
    ],
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Required for Claude",
      },
      {
        type: "input",
        messageKey: "claudeApiKey",
        label: "Claude API key",
      },
    ],
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Required for Gemini",
      },
      {
        type: "input",
        messageKey: "geminiApiKey",
        label: "Gemini API key",
      },
    ],
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Optional",
      },
      {
        type: "input",
        messageKey: "systemPrompt",
        label: "System prompt",
        description:
          "Any context for your queries – something about yourself, or how you want GPT to respond. For example: <em>Respond with one sentence.</em>",
      },
      {
        type: "select",
        messageKey: "model",
        defaultValue: "gpt-3.5-turbo",
        label: "Model",
        options: [
          {
            label: "GPT-3.5 Turbo",
            value: "gpt-3.5-turbo",
          },
          {
            label: "GPT-4",
            value: "gpt-4",
          },
        ],
      },
      {
        type: "slider",
        messageKey: "temperature",
        defaultValue: 1,
        label: "Temperature",
        description: "How creative the responses should be.",
        min: 0,
        max: 2,
        step: 0.1,
      },
      {
        type: 'toggle',
        messageKey: 'vibrate',
        label: 'Vibrate on response',
        defaultValue: true
      },
      {
        type: 'toggle',
        messageKey: 'confirmTranscription',
        label: 'Confirm transcription',
        defaultValue: false
      },
      {
        type: 'toggle',
        messageKey: 'invertColors',
        label: 'Invert colors',
        defaultValue: false
      }
    ],
  },
  {
    type: "submit",
    defaultValue: "Save Settings",
  },
];

var clay = new Clay(clayConfig);

function getConfig() {
  return JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
}

function makeApiRequest(prompt, onResponse, onError) {
  var config = getConfig();
  
  if (config[API_PROVIDER] === "openai") {
    makeOpenAIRequest(prompt, onResponse, onError);
  } else if (config[API_PROVIDER] === "claude") {
    makeClaudeRequest(prompt, onResponse, onError);
  } else if (config[API_PROVIDER] === "gemini") {
    makeGeminiRequest(prompt, onResponse, onError);
  } else {
    onError("Invalid API provider");
  }
}

function makeOpenAIRequest(prompt, onResponse, onError) {
  var config = getConfig();

  if (!config[API_KEY]) {
    onError("OpenAI API key not set");
    return;
  }

  var method = "POST";
  var url = "https://api.openai.com/v1/chat/completions";

  var request = new XMLHttpRequest();

  request.onload = function () {
    try {
      var responseBody = JSON.parse(this.responseText);

      if (responseBody.error) {
        onError(responseBody.error.message);
        return;
      }

      var chatCompletion = responseBody.choices[0].message.content;
      messages.push({ role: "assistant", content: chatCompletion });
      onResponse(chatCompletion);
    } catch (e) {
      onError("Failed to parse response");
    }
  };

  request.onerror = function() {
    onError("Network error");
  };

  request.open(method, url);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Authorization", "Bearer " + config[API_KEY]);

  if (messages.length === 0 && config[SYSTEM_PROMPT]) {
    messages.push({ role: "system", content: config[SYSTEM_PROMPT] });
  }

  messages.push({ role: "user", content: prompt });

  var requestBody = JSON.stringify({
    model: config[MODEL] || "gpt-3.5-turbo",
    messages: messages,
    temperature: config[TEMPERATURE] || 1,
  });

  request.send(requestBody);
}

function makeClaudeRequest(prompt, onResponse, onError) {
  var config = getConfig();

  if (!config.claudeApiKey) {
    onError("Claude API key not set");
    return;
  }

  var request = new XMLHttpRequest();
  var url = "https://api.anthropic.com/v1/messages";

  request.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      try {
        var responseBody = JSON.parse(this.responseText);
        var chatCompletion = responseBody.content[0].text;
        messages.push({ role: "assistant", content: chatCompletion });
        onResponse(chatCompletion);
      } catch (e) {
        onError("Failed to parse response");
      }
    } else {
      try {
        var errorBody = JSON.parse(this.responseText);
        onError(errorBody.error ? errorBody.error.message : "Unknown error");
      } catch (e) {
        onError("Failed to parse error response");
      }
    }
  };

  request.onerror = function () {
    onError("Network error");
  };

  request.open("POST", url);
  request.setRequestHeader("x-api-key", config.claudeApiKey);
  request.setRequestHeader("anthropic-version", "2023-06-01");
  request.setRequestHeader("content-type", "application/json");

  var claudeMessages = [];
  if (messages.length === 0 || messages[0].role !== "user") {
    claudeMessages.push({ role: "user", content: prompt });
  } else {
    claudeMessages = messages.slice();
    claudeMessages.push({ role: "user", content: prompt });
  }

  var requestBody = JSON.stringify({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1024,
    messages: claudeMessages
  });

  request.send(requestBody);
}

function makeGeminiRequest(prompt, onResponse, onError) {
  var config = getConfig();

  if (!config.geminiApiKey) {
    onError("Gemini API key not set");
    return;
  }

  var request = new XMLHttpRequest();
  var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  request.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      try {
        var responseBody = JSON.parse(this.responseText);
        var chatCompletion = responseBody.candidates[0].content.parts[0].text;
        messages.push({ role: "model", content: chatCompletion });
        onResponse(chatCompletion);
      } catch (e) {
        onError("Failed to parse response");
      }
    } else {
      try {
        var errorBody = JSON.parse(this.responseText);
        onError(errorBody.error ? errorBody.error.message : "Unknown error");
      } catch (e) {
        onError("Failed to parse error response");
      }
    }
  };

  request.onerror = function () {
    onError("Network error");
  };

  request.open("POST", url + "?key=" + config.geminiApiKey);
  request.setRequestHeader("Content-Type", "application/json");

  var requestBody = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: config[TEMPERATURE] || 1,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    }
  });

  request.send(requestBody);
}

function resetMessages() {
  messages = [];
}

// Pebble Event Listeners
Pebble.addEventListener("ready", function (e) {
  console.log("PebbleKit JS ready!");
  resetMessages();
  Pebble.sendAppMessage({ AppKeyReady: true });
});

Pebble.addEventListener("webviewclosed", function (e) {
  if (e && !e.response) {
    return;
  }

  var configData = clay.getSettings(e.response);
  var configValues = Object.keys(configData).reduce(function (result, key) {
    result[key] = configData[key];
    return result;
  }, {});

  localStorage.setItem(CONFIG_KEY, JSON.stringify(configValues));
});

Pebble.addEventListener("appmessage", function (e) {
  function onError(errorText) {
    Pebble.sendAppMessage({ AppKeyResponse: "Error: " + errorText });
  }

  function onResponse(responseText) {
    Pebble.sendAppMessage({ AppKeyResponse: responseText });
  }

  if (e.payload.AppKeyTranscription) {
    makeApiRequest(e.payload.AppKeyTranscription, onResponse, onError);
  }
});
