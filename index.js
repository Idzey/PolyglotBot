import { Telegraf } from 'telegraf';
import { session } from 'telegraf/session';
import axios from 'axios';
import { Mongo } from "@telegraf/session/mongodb";
import { token } from "./config.js";

const store = Mongo({
    url: "mongodb://127.0.0.1:27017",
    database: "telegraf-bot",
});

const bot = new Telegraf(token);
bot.use(session({ store }));

const languages = {
    "ru": "Русский 🇷🇺",
    "fr": "France 🇫🇷",
    "en": "English 🇬🇧",
    "de": "Deutschland 🇩🇪"
}
bot.start(ctx => {
    ctx.reply(`Добро пожаловать, ${ctx.chat.username}!`);

    setTimeout(() => ctx.reply(`Выберите язык на который хотите перевести`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Русский 🇷🇺", callback_data: "ru" }, { text: "English 🇬🇧", callback_data: "en" }],
                [{ text: "France 🇫🇷", callback_data: "fr" }, { text: "Deutschland 🇩🇪", callback_data: "de" }],
            ]
        }
    }), 1000);
});

bot.help(ctx => ctx.reply("Просто отправь мне текст сообщением"));

bot.command('language', (ctx) => {
    ctx.reply(`Выберите язык на который хотите перевести`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Русский 🇷🇺", callback_data: "ru" }, { text: "English 🇬🇧", callback_data: "en" }],
                [{ text: "France 🇫🇷", callback_data: "fr" }, { text: "Deutschland 🇩🇪", callback_data: "de" }],
            ]
        }
    });
});

bot.on('message', async (ctx) => {
    let res = await axios.get("https://ftapi.pythonanywhere.com/translate", {
        params: {
            dl: await store.get(ctx.message.chat.id),
            text: ctx.text
        }
    });
    let words = res.data['destination-text'];
    ctx.reply(words);
});

bot.on("callback_query", async (ctx) => {
    await store.set(ctx.update.callback_query.from.id, ctx.update.callback_query.data);
    ctx.reply(`Выбран язык: ${languages[ctx.update.callback_query.data]}. Отправьте текст, который хотите перевести`);
});

bot.launch();