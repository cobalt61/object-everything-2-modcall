const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const webhookUrl = process.env.WEBHOOK_URL;

app.post("/modcall", async (req, res) => {
  const data = req.body;

  // Construct the embed
  const embed = {
    title: "🚨 Mod Call",
    description: `@Admin\n**${data.username}** is calling a mod in **${data.gameName}**!`,
    color: 0xff0000, // red
    fields: [
      { name: "Reason", value: data.reason, inline: false },
      { name: "Display Name", value: data.displayName, inline: true },
      { name: "Username", value: data.username, inline: true },
      { name: "UserId", value: data.userId.toString(), inline: true },
      { name: "JobId", value: data.jobId, inline: false },
    ],
    thumbnail: {
      url: data.avatarUrl || `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${data.userId}&size=150x150&format=Png&isCircular=true`.imageUrl, // fix if doesn't work
    },
  };

  // Button payload
  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5, // Link button
          label: "Join the server!",
          url: `https://www.roblox.com/games/${data.placeId}?launchData=${encodeURIComponent(JSON.stringify({jobId: data.jobId}))}`
        }
      ]
    }
  ];

  try {
    await axios.post(webhookUrl, {
      embeds: [embed],
      components: components
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
