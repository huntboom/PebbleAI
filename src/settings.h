#ifndef SETTINGS_H
#define SETTINGS_H

#include <pebble.h>

// Persistent storage key
#define SETTINGS_KEY 1

#define SETTINGS_API_PROVIDER_MAX_LEN 16

typedef struct {
  bool vibrate;
  bool apiKeySet;
  char apiProvider[SETTINGS_API_PROVIDER_MAX_LEN];
  bool claudeApiKeySet;
  bool geminiApiKeySet;
  bool confirmTranscription;
  bool invertColors;
  bool deepseekApiKeySet;
  bool showModelName;
  bool grokApiKeySet;
} Settings;

void on_settings_received(DictionaryIterator *iter);

void init_settings();

Settings get_settings();
void save_settings(Settings new_settings);

#endif