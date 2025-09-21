const express = require("express");
const fetch = require("node-fetch"); // make sure you installed node-fetch
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const webhookUrl = process.env.DISCORD_WEBHOOK;

// Helper to fetch Roblox avatar safely
async function getAvatarUrl(userId) {
  try {
    const robloxApi = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`;
    const res = await fetch(robloxApi);
    const data = await res.json();
    return data?.data?.[0]?.imageUrl || "";
  } catch (err) {
    console.warn("Failed to fetch Roblox avatar:", err.message);
    return "";
  }
}

app.post("/modcall", async (req, res) => {
  const data = req.body;

  // Get the avatar URL
  const avatarUrl = await getAvatarUrl(data.userId);

  // Construct embed
  const embed = {
    title: "🚨 Mod Call",
    description: `@Admin\n**${data.username}** is calling a mod in **${data.gameName}**!`,
    color: 0xff0000,
    fields: [
      { name: "Reason", value: data.reason || "N/A", inline: false },
      { name: "Display Name", value: data.displayName || "N/A", inline: true },
      { name: "Username", value: data.username || "N/A", inline: true },
      { name: "UserId", value: (data.userId || "N/A").toString(), inline: true },
      { name: "JobId", value: data.jobId || "N/A", inline: false },
    ],
    thumbnail: { url: avatarUrl },
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
          url: `https://www.roblox.com/games/${data.placeId}?launchData=${encodeURIComponent(
            JSON.stringify({ jobId: data.jobId })
          )}`,
        },
      ],
    },
  ];

  // Send webhook with fetch
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed], components }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Discord webhook failed:", response.status, text);
      return res.status(500).json({ success: false, error: text });
    }

    console.log("Mod call sent successfully!");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to send Discord webhook:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
