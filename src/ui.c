#include <pebble.h>
#include <settings.h>
#include <settings_menu.h>

static Window *s_main_window;
static TextLayer *s_output_layer;
static ScrollLayer *s_scroll_layer;
static ClickHandler select_click_handler;

static void scroll_text_up(ClickRecognizerRef recognizer, void *context) {
  scroll_layer_scroll_up_click_handler(recognizer, s_scroll_layer);
}

static void scroll_text_down(ClickRecognizerRef recognizer, void *context) {
  scroll_layer_scroll_down_click_handler(recognizer, s_scroll_layer);
}

static void click_config_provider(void *context) {
  window_single_repeating_click_subscribe(BUTTON_ID_UP, 100, scroll_text_up);
  window_single_repeating_click_subscribe(BUTTON_ID_DOWN, 100, scroll_text_down);
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_long_click_subscribe(BUTTON_ID_SELECT, 700, NULL, show_settings_menu);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  // Get the current settings
  Settings current_settings = get_settings();

  s_scroll_layer = scroll_layer_create(bounds);
  scroll_layer_set_click_config_onto_window(s_scroll_layer, window);

  s_output_layer = text_layer_create(GRect(4, 4, bounds.size.w - 8, 10000));
  text_layer_set_text_alignment(s_output_layer, GTextAlignmentCenter);
  text_layer_set_font(s_output_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));

  // Set window and text colors based on the invertColors setting
  if (current_settings.invertColors) {
    window_set_background_color(window, GColorWhite);
    text_layer_set_text_color(s_output_layer, GColorBlack);
  } else {
    window_set_background_color(window, GColorBlack);
    text_layer_set_text_color(s_output_layer, GColorWhite);
  }

  text_layer_set_background_color(s_output_layer, GColorClear);

  scroll_layer_add_child(s_scroll_layer, text_layer_get_layer(s_output_layer));

  window_set_click_config_provider(window, click_config_provider);
  
  layer_add_child(window_layer, scroll_layer_get_layer(s_scroll_layer));

  text_layer_enable_screen_text_flow_and_paging(s_output_layer, 2);

  scroll_layer_set_paging(s_scroll_layer, true);
}

static void window_unload(Window *window) {
  text_layer_destroy(s_output_layer);
  scroll_layer_destroy(s_scroll_layer);
}

void init_ui(ClickHandler on_select_click) {
  select_click_handler = on_select_click;
  s_main_window = window_create();
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(s_main_window, true);
}

void cleanup_ui() {
  window_destroy(s_main_window);
}

void scroll_to_top() {
  GPoint offset = GPointZero;
  scroll_layer_set_content_offset(s_scroll_layer, offset, true);
}

void set_text(char* text) {
  text_layer_set_text(s_output_layer, text);
  
  GSize content_size = text_layer_get_content_size(s_output_layer);
  scroll_layer_set_content_size(s_scroll_layer, content_size);
  
  scroll_to_top();
}

void short_vibe() {
  static const uint32_t segments[] = { 100 };
  VibePattern pat = { segments, 1 };
  vibes_enqueue_custom_pattern(pat);
}

void update_ui_colors() {
    Settings current_settings = get_settings();
    window_set_background_color(s_main_window, current_settings.invertColors ? GColorWhite : GColorBlack);
    text_layer_set_text_color(s_output_layer, current_settings.invertColors ? GColorBlack : GColorWhite);
    layer_mark_dirty(window_get_root_layer(s_main_window));
}