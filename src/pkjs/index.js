var Clay = require("pebble-clay");

// Set to true to enable console logging (e.g. in development).
var DEBUG = false;
function log() {
  if (DEBUG && typeof console !== "undefined" && console.log) {
    console.log.apply(console, arguments);
  }
}

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
    defaultValue: "PebbleAI Configuration",
  },
  {
    type: "text",
    defaultValue:
      "To use PebbleAI you will need to provide your own API keys for the providers you want to use. " +
      "<br><br>" +
      "Please note that many API providers require users to add credits to their account before the API becomes usable. " +
      "Free tiers and credit availability vary by provider. " +
      "<br><br>" +
      "Voice dictation requires an active Rebble subscription. " +
      "You can subscribe at <a href='https://auth.rebble.io/account/'>auth.rebble.io</a>." +
      "<br><br>" +
      "You can get your API keys from the following links:" +
      "<ul>" +
      "<li><a href='https://platform.openai.com/account/api-keys'>OpenAI</a></li>" +
      "<li><a href='https://console.anthropic.com/settings/keys'>Claude</a></li>" +
      "<li><a href='https://aistudio.google.com/apikey'>Gemini</a></li>" +
      "<li><a href='https://platform.deepseek.com/api_keys'>DeepSeek</a></li>" +
      "<li><a href='https://console.x.ai/team/69c2fdaa-660d-4ced-ae27-ee80c8bd2e9b/api-keys'>Grok</a></li>" +
      "</ul>",
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
      {
        label: "DeepSeek",
        value: "deepseek",
      },
      {
        label: "Grok",
        value: "grok",
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
        defaultValue: "Required for DeepSeek",
      },
      {
        type: "input",
        messageKey: "deepseekApiKey",
        label: "DeepSeek API key",
      },
    ],
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Required for Grok",
      },
      {
        type: "input",
        messageKey: "grokApiKey",
        label: "Grok API key",
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
        label: "System prompt (for OpenAI)",
        description:
          "Any context for your queries – something about yourself, or how you want GPT to respond. For example: <em>Respond with one sentence.</em>",
      },
      {
        type: "select",
        messageKey: "model",
        defaultValue: "gpt-5-nano",
        label: "Model",
        options: [
          {
            label: "GPT-5-nano",
            value: "gpt-5-nano",
          },
	  {
            label: "GPT-5-mini",
            value: "gpt-5-mini",
          },
	
          {
            label: "GPT-4o-mini",
            value: "gpt-4o-mini",
          },
          {
            label: "GPT-4.1-mini",
            value: "gpt-4.1-mini",
          },
          {
            label: "GPT-4.1-nano",
            value: "gpt-4.1-nano",
          },

	{
            label: "GPT-3.5-turbo",
            value: "gpt-3.5-turbo",
          },
        ],
      },
      {
        type: "slider",
        messageKey: "temperature",
        defaultValue: 1,
        label: "Temperature (for OpenAI)",
        description: "How creative the responses should be.",
        min: 0,
        max: 2,
        step: 0.1,
        attributes: {
          precision: 1,
          type: 'number'
        }
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
      },
      {
        type: 'toggle',
        messageKey: 'showModelName',
        label: 'Display Model Name at start of messages',
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
  var config = JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
  log("Current config:", JSON.stringify(config));
  return config;
}

// Provider config: key name in config object, request function.
var PROVIDER_CONFIG = {
  openai:   { key: "apiKey",         fn: makeOpenAIRequest },
  claude:   { key: "claudeApiKey",    fn: makeClaudeRequest },
  gemini:   { key: "geminiApiKey",    fn: makeGeminiRequest },
  deepseek: { key: "deepseekApiKey",  fn: makeDeepSeekRequest },
  grok:     { key: "grokApiKey",      fn: makeGrokRequest }
};

function makeApiRequest(prompt, onResponse, onError) {
  var config = getConfig();
  var provider = config[API_PROVIDER];
  var pc = PROVIDER_CONFIG[provider];

  log("Making API request with provider:", provider);

  if (!pc) {
    log("Invalid provider:", provider);
    onError("Invalid API provider");
    return;
  }
  if (!config[pc.key]) {
    log(provider, "API key not found");
    onError(provider + " API key not set");
    return;
  }
  log(provider, "API key found, making request");
  pc.fn(prompt, onResponse, onError);
}

function finishChatResponse(content, providerLabel, config, onResponse) {
  var display = content;
  if (config && config.showModelName && providerLabel) {
    display = providerLabel + ": " + content;
  }
  onResponse(display);
}

function makeOpenAIRequest(prompt, onResponse, onError) {
  log("Starting OpenAI request");
  var config = getConfig();

  var method = "POST";
  var url = "https://api.openai.com/v1/chat/completions";

  var request = new XMLHttpRequest();

  request.onload = function () {
    log("OpenAI response received, status:", this.status);
    try {
      var responseBody = JSON.parse(this.responseText);
      log("OpenAI response parsed:", JSON.stringify(responseBody));

      if (responseBody.error) {
        log("OpenAI error:", responseBody.error.message);
        onError(responseBody.error.message);
        return;
      }

      var chatCompletion = responseBody.choices[0].message.content;
      messages.push({ role: "assistant", content: chatCompletion });
      finishChatResponse(chatCompletion, "OpenAI", config, onResponse);
    } catch (err) {
      log("Failed to parse OpenAI response:", err.message);
      onError("Failed to parse response: " + err.message);
    }
  };

  request.onerror = function () {
    log("Network error in OpenAI request");
    onError("Network error");
  };

  log("Opening request to OpenAI");
  request.open(method, url);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Authorization", "Bearer " + config.apiKey);

  if (messages.length === 0 && config.systemPrompt) {
    log("Adding system prompt");
    messages.push({ role: "system", content: config.systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  var requestBody = {
    model: config.model || "gpt-5-nano",
    messages: messages,
    temperature: parseFloat(config.temperature) || 1,
  };

  log("Temperature value:", config.temperature);
  log("Parsed temperature:", parseFloat(config.temperature));
  log("Final request body:", JSON.stringify(requestBody));

  request.send(JSON.stringify(requestBody));
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
        finishChatResponse(chatCompletion, "Claude", config, onResponse);
      } catch (err) {
        onError("Failed to parse response");
      }
    } else {
      try {
        var errorBody = JSON.parse(this.responseText);
        onError(errorBody.error ? errorBody.error.message : "Unknown error");
      } catch (err) {
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

  // Build messages for Claude: include prior conversation, then current user prompt.
  var claudeMessages = [];
  if (messages.length === 0 || messages[0].role !== "user") {
    claudeMessages.push({ role: "user", content: prompt });
  } else {
    claudeMessages = messages.slice();
    claudeMessages.push({ role: "user", content: prompt });
  }

  var requestBody = JSON.stringify({
    model: "claude-sonnet-4-20250514",
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
  var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  request.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      try {
        var responseBody = JSON.parse(this.responseText);
        var chatCompletion = responseBody.candidates[0].content.parts[0].text;
        messages.push({ role: "model", content: chatCompletion });
        finishChatResponse(chatCompletion, "Gemini", config, onResponse);
      } catch (err) {
        onError("Failed to parse response");
      }
    } else {
      try {
        var errorBody = JSON.parse(this.responseText);
        onError(errorBody.error ? errorBody.error.message : "Unknown error");
      } catch (err) {
        onError("Failed to parse error response");
      }
    }
  };

  request.onerror = function () {
    onError("Network error");
  };

  request.open("POST", url + "?key=" + config.geminiApiKey);
  request.setRequestHeader("Content-Type", "application/json");

  messages.push({ role: "user", content: prompt });

  // Build contents from conversation history (Gemini format: alternating user/model parts).
  var contents = [];
  var i;
  for (i = 0; i < messages.length; i++) {
    var m = messages[i];
    if (m.role === "system") { continue; }
    var role = m.role === "user" ? "user" : "model";
    contents.push({
      role: role,
      parts: [{ text: m.content }]
    });
  }

  var requestBody = JSON.stringify({
    contents: contents,
    generationConfig: {
      temperature: config[TEMPERATURE] || 1,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    }
  });

  request.send(requestBody);
}

function makeDeepSeekRequest(prompt, onResponse, onError) {
  var config = getConfig();

  var request = new XMLHttpRequest();
  var url = "https://api.deepseek.com/chat/completions";

  request.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      try {
        var responseBody = JSON.parse(this.responseText);
        var chatCompletion = responseBody.choices[0].message.content;
        messages.push({ role: "assistant", content: chatCompletion });
        finishChatResponse(chatCompletion, "DeepSeek", config, onResponse);
      } catch (err) {
        onError("Failed to parse response");
      }
    } else {
      try {
        var errorBody = JSON.parse(this.responseText);
        onError(errorBody.error ? errorBody.error.message : "Unknown error");
      } catch (err) {
        onError("Failed to parse error response");
      }
    }
  };

  request.onerror = function () {
    onError("Network error");
  };

  request.open("POST", url);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Authorization", "Bearer " + config.deepseekApiKey);

  if (messages.length === 0 && config.systemPrompt) {
    messages.push({ role: "system", content: config.systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  var requestBody = {
    model: "deepseek-chat",
    messages: messages,
    temperature: parseFloat(config.temperature) || 1,
    stream: false
  };

  request.send(JSON.stringify(requestBody));
}

function makeGrokRequest(prompt, onResponse, onError) {
  var config = getConfig();

  var request = new XMLHttpRequest();
  var url = "https://api.x.ai/v1/chat/completions";

  request.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      try {
        var responseBody = JSON.parse(this.responseText);
        var chatCompletion = responseBody.choices[0].message.content;
        messages.push({ role: "assistant", content: chatCompletion });
        finishChatResponse(chatCompletion, "Grok", config, onResponse);
      } catch (err) {
        onError("Failed to parse response");
      }
    } else {
      try {
        var errorBody = JSON.parse(this.responseText);
        onError(errorBody.error ? errorBody.error.message : "Unknown error");
      } catch (err) {
        onError("Failed to parse error response");
      }
    }
  };

  request.onerror = function () {
    onError("Network error");
  };

  request.open("POST", url);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Authorization", "Bearer " + config.grokApiKey);

  if (messages.length === 0 && config.systemPrompt) {
    messages.push({ role: "system", content: config.systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  var requestBody = {
    model: "grok-2-latest",
    messages: messages,
    temperature: parseFloat(config.temperature) || 1,
  };

  request.send(JSON.stringify(requestBody));
}

function resetMessages() {
  messages = [];
}

// Pebble Event Listeners
Pebble.addEventListener("ready", function (e) {
  log("PebbleKit JS ready!");
  resetMessages();
  Pebble.sendAppMessage({ AppKeyReady: true });
});

// Config message keys in same order as package.json pebble.messageKeys (keys 3–15).
var CONFIG_MESSAGE_KEYS = [
  "apiKey", "model", "systemPrompt", "temperature", "vibrate", "apiProvider",
  "claudeApiKey", "geminiApiKey", "confirmTranscription", "invertColors",
  "deepseekApiKey", "showModelName", "grokApiKey"
];

function buildKeyMapping() {
  var map = {};
  CONFIG_MESSAGE_KEYS.forEach(function (name, i) {
    map[String(i + 3)] = name;
  });
  return map;
}

Pebble.addEventListener("webviewclosed", function (e) {
  if (e && !e.response) {
    log("Webview closed without response");
    return;
  }

  log("Raw webview response:", e.response);
  var configData = clay.getSettings(e.response);
  log("Clay settings:", JSON.stringify(configData));

  var keyMapping = buildKeyMapping();
  var configValues = {};
  Object.keys(configData).forEach(function (key) {
    var mappedKey = keyMapping[key] || key;
    if (mappedKey === "temperature") {
      configValues[mappedKey] = parseFloat(configData[key]) / 10;
    } else {
      configValues[mappedKey] = configData[key];
    }
  });

  log("Saving config:", JSON.stringify(configValues));
  localStorage.setItem(CONFIG_KEY, JSON.stringify(configValues));
  resetMessages();
  log("Config saved successfully");
});

Pebble.addEventListener("appmessage", function (e) {
  log("Received app message:", JSON.stringify(e.payload));

  function onError(errorText) {
    log("Error occurred:", errorText);
    Pebble.sendAppMessage({ AppKeyResponse: "Error: " + errorText });
  }

  function onResponse(responseText) {
    log("Received API response");
    Pebble.sendAppMessage({ AppKeyResponse: responseText });
  }

  if (e.payload.AppKeyTranscription) {
    log("Received transcription:", e.payload.AppKeyTranscription);
    makeApiRequest(e.payload.AppKeyTranscription, onResponse, onError);
  }
});
