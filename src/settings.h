#include <pebble.h>

// Persistent storage key
#define SETTINGS_KEY 1

typedef struct Settings {
  bool vibrate;
  bool apiKeySet;
  char apiProvider[10];
  bool claudeApiKeySet;
  bool geminiApiKeySet; 
  bool confirmTranscription;
  bool invertColors;
  bool showModelName;
} Settings;

void on_settings_received(DictionaryIterator *iter);

void init_settings();

Settings get_settings();
void save_settings(Settings new_settings);