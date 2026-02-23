#include <pebble.h>
#include <messages.h>
#include <settings.h>

static Settings settings = {
  .vibrate = true,
  .apiKeySet = false,
  .apiProvider = "openai",
  .claudeApiKeySet = false,
  .geminiApiKeySet = false,
  .confirmTranscription = false,
  .invertColors = false,
  .deepseekApiKeySet = false,
  .showModelName = false,
  .grokApiKeySet = false
};

void on_settings_received(DictionaryIterator *iter) {
  Tuple *vibrate_tuple = dict_find(iter, AppKeyVibrate);

  if (vibrate_tuple) {
    settings.vibrate = (vibrate_tuple->value->int32 == 1);
  }

  Tuple *apiKey_tuple = dict_find(iter, AppKeyApiKey);

  if (apiKey_tuple) {
    settings.apiKeySet = strlen(apiKey_tuple->value->cstring) != 0;
  }

  Tuple *provider_tuple = dict_find(iter, AppKeyApiProvider);
  if (provider_tuple) {
    strncpy(settings.apiProvider, provider_tuple->value->cstring, SETTINGS_API_PROVIDER_MAX_LEN - 1);
    settings.apiProvider[SETTINGS_API_PROVIDER_MAX_LEN - 1] = '\0';
  }

  Tuple *claude_api_key_tuple = dict_find(iter, AppKeyClaudeApiKey);
  if (claude_api_key_tuple) {
    settings.claudeApiKeySet = strlen(claude_api_key_tuple->value->cstring) != 0;
  }

  Tuple *gemini_api_key_tuple = dict_find(iter, AppKeyGeminiApiKey);
  if (gemini_api_key_tuple) {
    settings.geminiApiKeySet = strlen(gemini_api_key_tuple->value->cstring) != 0;
  }

  Tuple *deepseek_api_key_tuple = dict_find(iter, AppKeyDeepseekApiKey);
  if (deepseek_api_key_tuple) {
    settings.deepseekApiKeySet = strlen(deepseek_api_key_tuple->value->cstring) != 0;
  }

  Tuple *grok_api_key_tuple = dict_find(iter, AppKeyGrokApiKey);
  if (grok_api_key_tuple) {
    settings.grokApiKeySet = strlen(grok_api_key_tuple->value->cstring) != 0;
  }

  Tuple *confirm_transcription_tuple = dict_find(iter, AppKeyConfirmTranscription);
  if (confirm_transcription_tuple) {
    settings.confirmTranscription = (confirm_transcription_tuple->value->int32 == 1);
  }

  Tuple *invert_colors_tuple = dict_find(iter, AppKeyInvertColors);
  if (invert_colors_tuple) {
    settings.invertColors = (invert_colors_tuple->value->int32 == 1);
  }
  
  Tuple *show_model_name_tuple = dict_find(iter, AppKeyShowModelName);
  if (show_model_name_tuple) {
    settings.showModelName = (show_model_name_tuple->value->int32 == 1);
  }
 
  persist_write_data(SETTINGS_KEY, &settings, sizeof(settings));
}

void init_settings() {
  persist_read_data(SETTINGS_KEY, &settings, sizeof(settings));
}

Settings get_settings() {
  return settings;
}

void save_settings(Settings new_settings) {
    settings = new_settings;
    persist_write_data(SETTINGS_KEY, &settings, sizeof(settings));
}