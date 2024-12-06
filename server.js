// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios'); // Ensure axios is imported
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Static array of upcoming Christian holidays for 2025
const upcomingHolidays = [
    { date: '2025-01-06', name: { en: 'Epiphany', zh: '主顯節' } },
    { date: '2025-01-12', name: { en: 'The Baptism of Jesus', zh: '耶穌受洗' } },
    { date: '2025-02-02', name: { en: 'Candlemas', zh: '燭節' } },
    { date: '2025-02-14', name: { en: 'St. Valentine\'s Day', zh: '情人節' } },
    { date: '2025-03-05', name: { en: 'Ash Wednesday', zh: '灰星期三' } },
    { date: '2025-04-13', name: { en: 'Palm Sunday', zh: '棕櫚主日' } },
    { date: '2025-04-17', name: { en: 'Maundy Thursday', zh: '聖餐星期四' } },
    { date: '2025-04-18', name: { en: 'Good Friday', zh: '受難日' } },
    { date: '2025-04-20', name: { en: 'Easter Sunday', zh: '復活節' } },
];

// API endpoint to get upcoming Christian holidays
app.get('/api/upcoming-holidays', (req, res) => {
    const today = new Date();
    const userLanguage = req.query.language || 'en'; // Default to English if no language is provided

    const filteredHolidays = upcomingHolidays
        .filter(holiday => new Date(holiday.date) > today)
        .slice(0, 3) // Get the next 3 holidays
        .map(holiday => ({
            date: holiday.date,
            name: holiday.name[userLanguage] || holiday.name['en'] // Fallback to English if language not found
        }));

    res.json(filteredHolidays);
});

// API endpoint for chat completion
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    const userLanguage = req.body.language; // Get user's preferred language

    if (!userMessage) {
        return res.status(400).json({ message: "Message is required." });
    }

    try {
        // Call the AI service to get a dynamic response based on user's preferred language
        const response = await axios.post('https://api.x.ai/v1/chat/completions', {
            messages: [
                { role: 'system', content: getSystemPrompt(userLanguage) }, // Use a function to get prompt based on language
                { role: 'user', content: userMessage }
            ],
            model: 'grok-beta',
            stream: false,
            temperature: 0.5
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_KEY}`
            }
        });

        const assistantMessage = response.data.choices[0].message.content;
        const formattedResponse = assistantMessage.replace(/(\*|#)/g, '').replace(/<\/?[^>]+(>|$)/g, '');

        res.json({ message: formattedResponse });
    } catch (error) {
        console.error("Error during chat completion:", error.message || error);
        res.status(500).json({ message: "抱歉，發生錯誤。" });
    }
});

// Function to return system prompt based on user's preferred language
function getSystemPrompt(language) {
    switch (language) {
        case 'en':
        case 'en-US':
            return 'You are an assistant responsible for providing comfort and encouragement based on the Bible.';
        case 'zh':
        case 'zh-TW':
            return '你是一個助手，負責提供基於聖經的安慰和鼓勵。';
        default:
            return 'You are an assistant responsible for providing comfort and encouragement based on the Bible.'; // Default to English if unsupported language
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});