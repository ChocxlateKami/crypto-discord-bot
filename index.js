require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// TokenMetrics API function
async function getTokenGrades(symbol) {
    try {
        const response = await axios.get(`https://api.tokenmetrics.com/v2/trader-grades`, {
            headers: {
                'x-api-key': process.env.TOKENMETRICS_API,
                'accept': 'application/json'
            },
            params: {
                symbol: symbol.toUpperCase(),
                limit: 1
            }
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        return null;
    }
}

// Bot ready event
client.once('ready', () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);
});

// Message handling
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Price command
    if (message.content.startsWith('!price ')) {
        const symbol = message.content.split(' ')[1]?.toUpperCase();
        
        if (!symbol) {
            message.reply('Please specify a token symbol: `!price BTC`');
            return;
        }

        const data = await getTokenGrades(symbol);
        
        if (data && data.data && data.data.length > 0) {
            const tokenData = data.data[0];
            const embed = new EmbedBuilder()
                .setTitle(`${symbol} TokenMetrics Analysis`)
                .setColor(0x00ff00)
                .addFields(
    { name: 'TM Trader Grade', value: `${tokenData.TM_TRADER_GRADE || 'N/A'}/100`, inline: true },
    { name: 'TA Grade', value: `${tokenData.TA_GRADE || 'N/A'}/100`, inline: true },
    { name: 'Quant Grade', value: `${tokenData.QUANT_GRADE || 'N/A'}/100`, inline: true },
    { name: '24h Change', value: `${tokenData.TM_TRADER_GRADE_24H_PCT_CHANGE || 'N/A'}%`, inline: true },
    { name: 'Token Name', value: tokenData.TOKEN_NAME || 'N/A', inline: true },
    { name: 'Date', value: tokenData.DATE ? new Date(tokenData.DATE).toLocaleDateString() : 'N/A', inline: true }
)
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } else {
            message.reply(`❌ Could not find data for ${symbol}`);
        }
    }

    // Analysis command  
    if (message.content.startsWith('!analysis ')) {
        const symbol = message.content.split(' ')[1]?.toUpperCase();
        
        if (!symbol) {
            message.reply('Please specify a token symbol: `!analysis BTC`');
            return;
        }

        const data = await getTokenGrades(symbol);
        
        if (data && data.data && data.data.length > 0) {
            const tokenData = data.data[0];
            const embed = new EmbedBuilder()
                .setTitle(`${symbol} TokenMetrics Analysis`)
                .setColor(0xff9900)
                .addFields(
    { name: 'TM Trader Grade', value: `${tokenData.TM_TRADER_GRADE || 'N/A'}/100`, inline: true },
    { name: 'TA Grade', value: `${tokenData.TA_GRADE || 'N/A'}/100`, inline: true },
    { name: 'Quant Grade', value: `${tokenData.QUANT_GRADE || 'N/A'}/100`, inline: true },
    { name: '24h Change', value: `${tokenData.TM_TRADER_GRADE_24H_PCT_CHANGE || 'N/A'}%`, inline: true },
    { name: 'Token Name', value: tokenData.TOKEN_NAME || 'N/A', inline: true },
    { name: 'Date', value: tokenData.DATE ? new Date(tokenData.DATE).toLocaleDateString() : 'N/A', inline: true }
)
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } else {
            message.reply(`❌ Could not find analysis for ${symbol}`);
        }
    }

    // Help command
    if (message.content === '!help') {
        const helpEmbed = new EmbedBuilder()
            .setTitle('🤖 Crypto Bot Commands')
            .setColor(0x0099ff)
            .addFields(
                { name: '!price [symbol]', value: 'Get TokenMetrics trader grade and market data' },
                { name: '!analysis [symbol]', value: 'Get detailed TokenMetrics analysis with all grades' },
                { name: '!help', value: 'Show this help message' }
            )
            .setFooter({ text: 'Powered by TokenMetrics API - Basic Plan' });
        
        message.reply({ embeds: [helpEmbed] });
    }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);