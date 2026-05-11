# 2ТК Груп — сайт для прийому заявок на рекламу

Проєкт реалізований за ТЗ: двосторінковий сайт, форма заявки та інтеграція з Telegram Bot API.

## Технології

- Frontend: HTML / CSS / JavaScript
- Backend: Node.js + Express
- Telegram Bot API

## Структура

```text
2tk-group-site/
├── public/
│   ├── index.html
│   ├── request.html
│   ├── styles.css
│   └── script.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

## Запуск

1. Встановити залежності:

```bash
npm install
```

2. Створити файл `.env` на основі `.env.example`:

```bash
PORT=3000
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_ADMIN_CHAT_ID=ваш_chat_id
TELEGRAM_LINK=https://t.me/ваш_telegram
```

3. Запустити сервер:

```bash
npm start
```

4. Відкрити сайт:

```text
http://localhost:3000
```

## Як отримати Telegram Bot Token

1. В Telegram відкрити @BotFather.
2. Виконати команду `/newbot`.
3. Скопіювати токен у `.env`.

## Як отримати TELEGRAM_ADMIN_CHAT_ID

1. Написати будь-яке повідомлення своєму боту.
2. Відкрити у браузері:

```text
https://api.telegram.org/botВАШ_ТОКЕН/getUpdates
```

3. Знайти поле `chat.id` і вставити його у `.env`.
