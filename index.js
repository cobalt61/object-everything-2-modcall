const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const webhookUrl = process.env.WEBHOOK_URL;

app.post("/modcall", (req, res) => {
  console.log("Received modcall:", req.body);

  // TODO: forward to Discord using webhookUrl
  // for now, just confirm back
  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

