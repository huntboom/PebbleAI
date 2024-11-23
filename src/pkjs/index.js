var Clay = require("pebble-clay");

// Clay configuration with all the new options
var clayConfig = [
  {
    type: "heading",
    defaultValue: "PebbleGPT Configuration",
  },
  {
    type: "text",
    defaultValue:
      "To use PebbleGPT you will need " +
      "your <a href='https://platform.openai.com/account/api-keys'>own OpenAI API key</a> and " +
      "<a href='https://help.rebble.io/setup-subscription/#1'>a Rebble subscription</a> (for voice transcription).",
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Required",
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
    ],
  },
  {
    type: "submit",
    defaultValue: "Save Settings",
  },
];

var clay = new Clay(clayConfig);

// Initialize when ready
Pebble.addEventListener("ready", function(e) {
  console.log("PebbleKit JS ready!");
  Pebble.sendAppMessage({ "AppKeyReady": true });
});

// Handle configuration changes
Pebble.addEventListener("webviewclosed", function(e) {
  if (e && !e.response) {
    return;
  }

  // Get all settings from Clay
  var configData = clay.getSettings(e.response);
  
  // Store all configuration values
  if (configData) {
    localStorage.setItem("config", JSON.stringify(configData));
  }
});

// Handle messages from the watch
Pebble.addEventListener("appmessage", function(e) {
  console.log("Received message: " + JSON.stringify(e.payload));

  if (e.payload.AppKeyTranscription) {
    makeRequest(e.payload.AppKeyTranscription);
  }
});

function makeRequest(content) {
  var config = JSON.parse(localStorage.getItem("config") || "{}");
  var apiKey = config.apiKey;
  
  if (!apiKey) {
    console.log('API key not provided');
    Pebble.sendAppMessage({ "AppKeyResponse": "Error: API key not configured" });
    return;
  }

  var method = "POST";
  var url = "https://api.openai.com/v1/chat/completions";
  var request = new XMLHttpRequest();

  request.onload = function() {
    console.log("Got response: " + this.responseText);
    
    try {
      var response = JSON.parse(this.responseText);
      if (response.error) {
        Pebble.sendAppMessage({ "AppKeyResponse": "Error: " + response.error.message });
      } else {
        Pebble.sendAppMessage({ "AppKeyResponse": response.choices[0].message.content });
      }
    } catch (error) {
      Pebble.sendAppMessage({ "AppKeyResponse": "Error: Failed to parse response" });
    }
  };

  request.onerror = function() {
    Pebble.sendAppMessage({ "AppKeyResponse": "Error: Network request failed" });
  };

  // Send the request
  request.open(method, url);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Authorization", "Bearer " + apiKey);

  // Prepare messages array with optional system prompt
  var messages = [];
  if (config.systemPrompt) {
    messages.push({ role: "system", content: config.systemPrompt });
  }
  messages.push({ role: "user", content: content });

  var requestBody = JSON.stringify({
    model: config.model || "gpt-3.5-turbo",
    messages: messages,
    temperature: parseFloat(config.temperature || "0.7"),
  });

  request.send(requestBody);
}
