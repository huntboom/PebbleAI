#include <pebble.h>
#include <messages.h>

static MessageHandler *inbox_message_handlers;
static uint8_t inbox_message_handler_count;

void send_to_phone(AppKey key, char* value) {
  DictionaryIterator *out_iter;
  AppMessageResult result = app_message_outbox_begin(&out_iter);

  if (result != APP_MSG_OK) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error preparing outbound message: %d", (int)result);
    return;
  }
  
  dict_write_cstring(out_iter, key, value);
  result = app_message_outbox_send();

  if (result != APP_MSG_OK) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending transcription to PebbleKit JS: %d", (int)result);
  }
}

static void call_message_handlers(DictionaryIterator *iterator, void *context) {
  for (uint8_t i = 0; i < inbox_message_handler_count; i++) {
    MessageHandler handler = inbox_message_handlers[i];
    (*handler)(iterator);
  }
}

void _init_messages(MessageHandler message_handlers[], int message_handler_count) {
  inbox_message_handler_count = message_handler_count;
  inbox_message_handlers = message_handlers;
  app_message_register_inbox_received(call_message_handlers);
  /* Inbound/outbound buffer sizes; increase if long API responses are truncated */
  app_message_open(4096, 4096);
}
