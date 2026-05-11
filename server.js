require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Telegram Bot
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;

if (!botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN не знайдено в .env файлі!');
    process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

// Підтвердження запуску бота
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

bot.on('webhook_error', (error) => {
    console.error('Webhook error:', error);
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'гость';
    
    bot.sendMessage(chatId, 
        `🤝 *Вітаю, ${firstName}!*\n\n` +
        `Я бот компанії *2ТК Груп*.\n` +
        `Допомагаю приймати заявки на рекламу в Telegram.\n\n` +
        `📝 *Щоб залишити заявку:*\n` +
        `1. Перейдіть на наш сайт\n` +
        `2. Заповніть форму\n` +
        `3. Ми зв'яжемося з вами найближчим часом\n\n` +
        `💬 *Питання?* Напишіть нам прямо тут!`,
        { parseMode: 'Markdown' }
    );
});

// API endpoint для відправки заявки в Telegram
app.post('/api/submit-order', async (req, res) => {
    try {
        const { name, telegram, budget, description } = req.body;
        
        // Валідація
        if (!name || !telegram || !budget || !description) {
            return res.status(400).json({ 
                success: false, 
                error: 'Будь ласка, заповніть всі поля форми' 
            });
        }
        
        // Формуємо повідомлення для адміна
        const adminMessage = 
            `📢 *НОВА ЗАЯВКА НА РЕКЛАМУ* 📢\n\n` +
            `👤 *Ім'я:* ${name}\n` +
            `📱 *Telegram:* @${telegram.replace('@', '')}\n` +
            `💰 *Бюджет:* ${budget}\n` +
            `📝 *Опис завдання:*\n${description}\n\n` +
            `🕐 *Час заявки:* ${new Date().toLocaleString('uk-UA')}`;
        
        // Відправляємо адміну
        if (adminChatId) {
            await bot.sendMessage(adminChatId, adminMessage, { parseMode: 'Markdown' });
        } else {
            console.warn('ADMIN_CHAT_ID не налаштовано');
        }
        
        // Автовідповідь користувачу (якщо вказано telegram username)
        try {
            const userMessage = 
                `🤝 *Дякуємо за заявку, ${name}!*\n\n` +
                `Вашу заявку отримано. Наш менеджер зв'яжеться з вами найближчим часом.\n\n` +
                `📌 *Деталі вашої заявки:*\n` +
                `Бюджет: ${budget}\n` +
                `Опис: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}\n\n` +
                `💡 *Цікаві факти:*\n` +
                `• Реклама в Telegram дає до 70% відкриттів\n` +
                `• Середній чек: 2000-5000 грн\n\n` +
                `Залишились питання? Напишіть нам!`;
            
            // Спроба відправити повідомлення користувачу
            const cleanTelegram = telegram.replace('@', '');
            bot.sendMessage(`@${cleanTelegram}`, userMessage, { parseMode: 'Markdown' })
                .catch(err => console.log('Не вдалося відправити повідомлення користувачу:', err.message));
        } catch (userErr) {
            console.log('Помилка автовідповіді:', userErr.message);
        }
        
        res.json({ 
            success: true, 
            message: 'Заявку успішно відправлено! Ми зв’яжемося з вами найближчим часом.' 
        });
        
    } catch (error) {
        console.error('Помилка при обробці заявки:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Виникла помилка. Спробуйте пізніше або напишіть нам напряму в Telegram.' 
        });
    }
});

// Віддача HTML сторінок
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'order.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
    console.log(`🤖 Telegram бот активовано`);
});