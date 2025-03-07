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
  console.log("Current config:", JSON.stringify(config));
  return config;
}

function makeApiRequest(prompt, onResponse, onError) {
  var config = getConfig();
  console.log("Making API request with provider:", config[API_PROVIDER]);
  
  if (config[API_PROVIDER] === "openai") {
    console.log("OpenAI selected, checking API key...");
    if (!config.apiKey) {
      console.log("OpenAI API key not found");
      onError("OpenAI API key not set");
      return;
    }
    console.log("OpenAI API key found, making request");
    makeOpenAIRequest(prompt, onResponse, onError);
  } else if (config[API_PROVIDER] === "claude") {
    console.log("Claude selected, checking API key...");
    if (!config.claudeApiKey) {
      console.log("Claude API key not found");
      onError("Claude API key not set");
      return;
    }
    console.log("Claude API key found, making request");
    makeClaudeRequest(prompt, onResponse, onError);
  } else if (config[API_PROVIDER] === "gemini") {
    console.log("Gemini selected, checking API key...");
    if (!config.geminiApiKey) {
      console.log("Gemini API key not found");
      onError("Gemini API key not set");
      return;
    }
    console.log("Gemini API key found, making request");
    makeGeminiRequest(prompt, onResponse, onError);
  } else if (config[API_PROVIDER] === "deepseek") {
    console.log("DeepSeek selected, checking API key...");
    if (!config.deepseekApiKey) {
      console.log("DeepSeek API key not found");
      onError("DeepSeek API key not set");
      return;
    }
    console.log("DeepSeek API key found, making request");
    makeDeepSeekRequest(prompt, onResponse, onError);
  } else {
    console.log("Invalid provider:", config[API_PROVIDER]);
    onError("Invalid API provider");
  }
}

function makeOpenAIRequest(prompt, onResponse, onError) {
  console.log("Starting OpenAI request");
  var config = getConfig();

  var method = "POST";
  var url = "https://api.openai.com/v1/chat/completions";

  var request = new XMLHttpRequest();

  request.onload = function () {
    console.log("OpenAI response received, status:", this.status);
    try {
      var responseBody = JSON.parse(this.responseText);
      console.log("OpenAI response parsed:", JSON.stringify(responseBody));

      if (responseBody.error) {
        console.log("OpenAI error:", responseBody.error.message);
        onError(responseBody.error.message);
        return;
      }

      var chatCompletion = responseBody.choices[0].message.content;
      messages.push({ role: "assistant", content: chatCompletion });
      
      // Add model name prefix if enabled
      if (config.showModelName) {
        chatCompletion = "OpenAI: " + chatCompletion;
      }
      
      onResponse(chatCompletion);
    } catch (e) {
      console.log("Failed to parse OpenAI response:", e.message);
      onError("Failed to parse response: " + e.message);
    }
  };

  request.onerror = function() {
    console.log("Network error in OpenAI request");
    onError("Network error");
  };

  console.log("Opening request to OpenAI");
  request.open(method, url);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Authorization", "Bearer " + config.apiKey);

  if (messages.length === 0 && config.systemPrompt) {
    console.log("Adding system prompt");
    messages.push({ role: "system", content: config.systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  var requestBody = {
    model: config.model || "gpt-3.5-turbo",
    messages: messages,
    temperature: parseFloat(config.temperature) || 1,
  };

  console.log("Temperature value:", config.temperature);
  console.log("Parsed temperature:", parseFloat(config.temperature));
  console.log("Final request body:", JSON.stringify(requestBody));

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
        
        // Add model name prefix if enabled
        if (config.showModelName) {
          chatCompletion = "Claude: " + chatCompletion;
        }
        
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
        
        // Add model name prefix if enabled
        if (config.showModelName) {
          chatCompletion = "Gemini: " + chatCompletion;
        }
        
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
        
        // Add model name prefix if enabled
        if (config.showModelName) {
          chatCompletion = "DeepSeek: " + chatCompletion;
        }
        
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
    console.log("Webview closed without response");
    return;
  }

  console.log("Raw webview response:", e.response);
  var configData = clay.getSettings(e.response);
  console.log("Clay settings:", JSON.stringify(configData));
  
  // Create a mapping of numeric keys to string keys
  var keyMapping = {
    "3": "apiKey",
    "4": "model",
    "5": "systemPrompt",
    "6": "temperature",
    "7": "vibrate",
    "8": "apiProvider",
    "9": "claudeApiKey",
    "10": "geminiApiKey",
    "11": "confirmTranscription",
    "12": "invertColors",
    "13": "deepseekApiKey",
    "14": "showModelName"
  };
  
  var configValues = {};
  Object.keys(configData).forEach(function(key) {
    var mappedKey = keyMapping[key] || key;
    // Special handling for temperature
    if (mappedKey === 'temperature') {
      configValues[mappedKey] = parseFloat(configData[key]) / 10;
    } else {
      configValues[mappedKey] = configData[key];
    }
  });

  console.log("Saving config:", JSON.stringify(configValues));
  localStorage.setItem(CONFIG_KEY, JSON.stringify(configValues));
  console.log("Config saved successfully");
});

Pebble.addEventListener("appmessage", function (e) {
  console.log("Received app message:", JSON.stringify(e.payload));
  
  function onError(errorText) {
    console.log("Error occurred:", errorText);
    Pebble.sendAppMessage({ AppKeyResponse: "Error: " + errorText });
  }

  function onResponse(responseText) {
    console.log("Received API response");
    Pebble.sendAppMessage({ AppKeyResponse: responseText });
  }

  if (e.payload.AppKeyTranscription) {
    console.log("Received transcription:", e.payload.AppKeyTranscription);
    makeApiRequest(e.payload.AppKeyTranscription, onResponse, onError);
  }
});
