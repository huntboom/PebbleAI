#include <pebble.h>

/** Callback when the select button is pressed (short click). */
typedef void (*ClickHandler)(void);

void init_ui(ClickHandler on_select_click);
void cleanup_ui();

void set_text(char* text);

void scroll_to_top();

void short_vibe();

void update_ui_colors();