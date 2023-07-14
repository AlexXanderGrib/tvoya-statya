import { articles } from "./articles";

const ids = Object.freeze(Object.keys(articles));

function getRandomArticle() {
  const id = ids[Math.floor(Math.random() * ids.length)];
  const name = articles[id];

  return { id, name };
}

export default {
  async fetch(request: Request): Promise<Response> {
    const input: any = await request.json();

    if (input.inline_query) {
      return serialize(processInlineQuery(input.inline_query));
    }

    if (!input.message || !input.message.text) {
      return new Response();
    }

    if (input.message.text.startsWith("/myarticle")) {
      return serialize(processCommand(input.message));
    }

    if (input.message.text === "/help" || input.message.text === "/start") {
      return serialize(processHelp(input.message));
    }

    return new Response();
  }
};

function serialize(values: Record<string, string | number | boolean>) {
  const json = JSON.stringify(values);
  return new Response(json, {
    headers: { "Content-Type": "application/json" }
  });
}

type Message = {
  message_id: number;
  message_thread_id: number;
  chat: { id: number };
};

type InlineQuery = {
  id: string;
};

function processInlineQuery(query: InlineQuery) {
  const article = getRandomArticle();
  return {
    method: "answerInlineQuery",
    inline_query_id: query.id,
    cache_time: 300,
    is_personal: true,
    results: JSON.stringify([
      {
        id: Math.random().toString().slice(2),
        type: "article",
        title: "Твоя статья УК РФ",
        description: "Отправить статью",
        input_message_content: {
          message_text: `<b><u>📕 Моя статья УК РФ:</u></b>
<code>${article.id}</code> - <tg-spoiler>${article.name}</tg-spoiler>`,
          parse_mode: "HTML"
        },
        thumb_url:
          "https://novgaz-rzn.ru/images/upload/ee360f8f913b4d0cbb6ea54b745fea7d.jpg",
        thumb_width: 1024,
        thumb_height: 682,
        reply_markup: {
          inline_keyboard: [
            [{ switch_inline_query_current_chat: ":?", text: "Узнать свою" }],
            // [{ url: "https://t.me/bochkin_sup", text: "" }]
          ]
        }
      },
    ])
  };
}

function processCommand(message: Message) {
  const article = getRandomArticle();
  return {
    method: "sendMessage",
    text: `<b><u>📕 Твоя статья УК РФ:</u></b>
<code>${article.id}</code> - <tg-spoiler>${article.name}</tg-spoiler>`,
    parse_mode: "HTML",
    reply_to_message_id: message.message_id,
    chat_id: message.chat.id,
    message_thread_id: message.message_thread_id,
    allow_sending_without_reply: false,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ switch_inline_query_current_chat: "", text: "Узнать свою" }]
      ]
    })
  };
}

function processHelp(message: Message) {
  return {
    method: "sendMessage",
    text: "Чтобы узнать свою статью напишите команду /myarticle или используйте кнопку.",
    message_thread_id: message.message_thread_id,
    reply_to_message_id: message.message_id,
    chat_id: message.chat.id,
    allow_sending_without_reply: false,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ switch_inline_query_current_chat: "", text: "Узнать статью" }]
      ]
    })
  };
}
