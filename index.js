const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID; // add this as a secret too

app.post("/modcall", async (req, res) => {
    const data = req.body;

    // Build embed
    const embed = {
        title: "🚨 Mod Call",
        description: `@Admin\n**${data.username}** is calling a mod in **${data.gameName}**!`,
        color: 0xff0000,
        fields: [
            { name: "Reason", value: data.reason, inline: false },
            { name: "Display Name", value: data.displayName, inline: true },
            { name: "Username", value: data.username, inline: true },
            { name: "UserId", value: data.userId.toString(), inline: true },
            { name: "JobId", value: data.jobId, inline: false },
        ],
        thumbnail: {
            url: `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${data.userId}&size=150x150&format=Png&isCircular=true`
        }
    };

    // Button component
    const components = [
        {
            type: 1,
            components: [
                {
                    type: 2,
                    style: 5, // Link button
                    label: "Join the server!",
                    url: `https://www.roblox.com/games/${data.placeId}?launchData=${encodeURIComponent(JSON.stringify({ jobId: data.jobId }))}`
                }
            ]
        }
    ];

    try {
        await axios.post(
            `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`,
            { embeds: [embed], components },
            { headers: { 
                "Authorization": `Bot ${BOT_TOKEN}`, 
                "Content-Type": "application/json" 
            } }
        );
        console.log("Mod call sent!");
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Failed to send Discord message:", err.response?.data || err.message);
        res.status(500).json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
