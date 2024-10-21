import process from "node:process";

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send(
    JSON.stringify({
      uptime: process.uptime(),
    })
  );
});

app.post("/notify", (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      status: "error",
      message: "Missing body",
    });
  }

  const { channel, message, msToWait, roomId } = req.body;

  if (!channel || !message || !msToWait || !roomId) {
    return res.status(400).send({
      status: "error",
      message: "Missing required fields: channel, message, msToWait, roomId",
    });
  }

  setTimeout(async () => {
    const response = await fetch(
      `https://api.superviz.com/realtime/${channel}/publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          client_id: process.env.VITE_SUPERVIZ_CLIENT_ID,
          secret: process.env.VITE_SUPERVIZ_SECRET_KEY,
        },
        body: JSON.stringify({
          name: "new-notification",
          data: message,
        }),
      }
    );

    console.log(
      `Sending data to ${channel}, message: ${message}`,
      response.status
    );
  }, msToWait);

  res.send({
    status: "success",
    message: "Notification scheduled",
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
