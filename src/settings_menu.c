#include "settings_menu.h"
#include "settings.h"
#include "ui.h"
#include "messages.h"

static Window *s_main_window;
static MenuLayer *s_menu_layer;

typedef enum {
    SETTING_VIBRATE,
    SETTING_CONFIRM_TRANSCRIPTION,
    SETTING_INVERT_COLORS,
    SETTING_PROVIDER,
    SETTING_SUBMIT,
    NUM_SETTINGS
} SettingType;

static char* setting_names[] = {
    "Vibrate",
    "Confirm Transcription",
    "Invert Colors",
    "Provider",
    "Save Settings"
};

/* Provider cycle order; must match display names. */
static const char* const s_providers[] = { "openai", "claude", "gemini", "deepseek", "grok" };
#define NUM_PROVIDERS ((int)(sizeof(s_providers) / sizeof(s_providers[0])))

static const char* get_provider_display_name(const char* provider) {
    if (!provider) return "?";
    if (strcmp(provider, "openai") == 0) return "OpenAI";
    if (strcmp(provider, "claude") == 0) return "Claude";
    if (strcmp(provider, "gemini") == 0) return "Gemini";
    if (strcmp(provider, "deepseek") == 0) return "DeepSeek";
    if (strcmp(provider, "grok") == 0) return "Grok";
    return provider;
}

static void get_next_provider(char* out, size_t out_size) {
    Settings s = get_settings();
    int i;
    for (i = 0; i < NUM_PROVIDERS; i++) {
        if (strcmp(s.apiProvider, s_providers[i]) == 0) {
            int next = (i + 1) % NUM_PROVIDERS;
            strncpy(out, s_providers[next], out_size - 1);
            out[out_size - 1] = '\0';
            return;
        }
    }
    strncpy(out, s_providers[0], out_size - 1);
    out[out_size - 1] = '\0';
}

static uint16_t get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *context) {
    return NUM_SETTINGS;
}

static void draw_row_callback(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index, void *context) {
    Settings current_settings = get_settings();
    bool is_selected = false;

    switch(cell_index->row) {
        case SETTING_VIBRATE:
            is_selected = current_settings.vibrate;
            break;
        case SETTING_CONFIRM_TRANSCRIPTION:
            is_selected = current_settings.confirmTranscription;
            break;
        case SETTING_INVERT_COLORS:
            is_selected = current_settings.invertColors;
            break;
        case SETTING_PROVIDER:
            menu_cell_basic_draw(ctx, cell_layer, setting_names[cell_index->row],
                get_provider_display_name(current_settings.apiProvider), NULL);
            return;
        case SETTING_SUBMIT:
            /* Submit row: label only, no toggle */
            menu_cell_basic_draw(ctx, cell_layer, setting_names[cell_index->row], NULL, NULL);
            return;
    }

    menu_cell_basic_draw(ctx, cell_layer, setting_names[cell_index->row], NULL, NULL);

    GRect bounds = layer_get_bounds(cell_layer);
    GPoint p = GPoint(bounds.size.w - 30, bounds.size.h / 2);

    graphics_context_set_stroke_color(ctx, menu_cell_layer_is_highlighted(cell_layer) ? GColorWhite : GColorBlack);
    graphics_draw_circle(ctx, p, 8);
    if (is_selected) {
        graphics_context_set_fill_color(ctx, menu_cell_layer_is_highlighted(cell_layer) ? GColorWhite : GColorBlack);
        graphics_fill_circle(ctx, p, 6);
    }
}

static void select_callback(struct MenuLayer *menu_layer, MenuIndex *cell_index, void *callback_context) {
    Settings current_settings = get_settings();
    char next_provider_buf[SETTINGS_API_PROVIDER_MAX_LEN];

    switch(cell_index->row) {
        case SETTING_VIBRATE:
            current_settings.vibrate = !current_settings.vibrate;
            break;
        case SETTING_CONFIRM_TRANSCRIPTION:
            current_settings.confirmTranscription = !current_settings.confirmTranscription;
            break;
        case SETTING_INVERT_COLORS:
            current_settings.invertColors = !current_settings.invertColors;
            break;
        case SETTING_PROVIDER:
            get_next_provider(next_provider_buf, sizeof(next_provider_buf));
            strncpy(current_settings.apiProvider, next_provider_buf, SETTINGS_API_PROVIDER_MAX_LEN - 1);
            current_settings.apiProvider[SETTINGS_API_PROVIDER_MAX_LEN - 1] = '\0';
            save_settings(current_settings);
            send_to_phone(AppKeyApiProvider, current_settings.apiProvider);
            menu_layer_reload_data(menu_layer);
            update_ui_colors();
            return;
        case SETTING_SUBMIT:
            save_settings(current_settings);
            send_to_phone(AppKeyApiProvider, current_settings.apiProvider);
            window_stack_pop(true);
            update_ui_colors();
            return;
    }

    save_settings(current_settings);
    menu_layer_reload_data(menu_layer);
    update_ui_colors();
}

static void window_load(Window *window) {
    Layer *window_layer = window_get_root_layer(window);
    GRect bounds = layer_get_bounds(window_layer);

    s_menu_layer = menu_layer_create(bounds);
    menu_layer_set_click_config_onto_window(s_menu_layer, window);
    menu_layer_set_callbacks(s_menu_layer, NULL, (MenuLayerCallbacks) {
        .get_num_rows = get_num_rows_callback,
        .draw_row = draw_row_callback,
        .select_click = select_callback,
    });
    layer_add_child(window_layer, menu_layer_get_layer(s_menu_layer));
}

static void window_unload(Window *window) {
    menu_layer_destroy(s_menu_layer);
    window_destroy(window);
    s_main_window = NULL;
}

void show_settings_menu() {
    if(!s_main_window) {
        s_main_window = window_create();
        window_set_window_handlers(s_main_window, (WindowHandlers) {
            .load = window_load,
            .unload = window_unload,
        });
    }
    window_stack_push(s_main_window, true);
}
