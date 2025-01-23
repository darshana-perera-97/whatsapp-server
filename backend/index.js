const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const csv = require("csv-parser");

let qrCodeImage = ""; // Variable to store the generated QR code

// Create a new WhatsApp client instance
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
    timeout: 60000,
  },
});

// Generate and store the QR code in `qrCodeImage`
client.on("qr", async (qr) => {
  console.log("QR Code generated. Send to the frontend to scan."); // Ensure this logs
  qrCodeImage = await qrcode.toDataURL(qr); // Generate Base64 QR Code
});

// Log a message when the client is ready
client.on("ready", () => {
  console.log("WhatsApp client is ready!");
  qrCodeImage = ""; // Clear the QR code as it's no longer needed
});

// Handle disconnection
client.on("disconnected", (reason) => {
  console.log("Client was logged out:", reason);
});

// Initialize WhatsApp client
client.initialize().catch((error) => {
  console.error("Failed to initialize client:", error);
});

// Set up Express server
const app = express();
app.use(cors());

// API to get the current QR code
app.get("/whatsappQR", (req, res) => {
    if (client.info && client.info.pushname) {
        // Device is connected
        res.status(200).send({
            status: "connected",
            message: `Device is connected as ${client.info.pushname}.`,
        });
    } else if (qrCode) {
        // QR Code is available but not connected
        res.status(200).send({
            status: "disconnected",
            qr: qrCode, // Send the stored QR code
        });
    } else {
        // No QR Code and not connected
        res.status(500).send({
            status: "error",
            message: "QR Code not available. Please try again later.",
        });
    }
});

// Set up Multer for file uploads
const upload = multer({ dest: "uploads/" });

// API endpoint to upload CSV and send messages
app.post("/send-messages", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  const { message } = req.body; // Get the message from the request body

  if (!message) {
    return res.status(400).send("Message is required.");
  }

  const messages = [];

  // Read and parse the CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      const phone = row["designation"]; // Assuming the column name is "designation"
      if (phone) {
        messages.push(phone);
      }
    })
    .on("end", async () => {
      fs.unlinkSync(filePath); // Delete the temporary CSV file after processing

      // Send the provided message to all numbers
      for (const phone of messages) {
        try {
          await client.sendMessage("94" + phone + "@c.us", message); // Send the message
          console.log(`Message sent to ${phone}`);
        } catch (error) {
          console.error(`Failed to send message to ${phone}:`, error);
        }
      }

      res.status(200).send("Messages sent successfully!");
    })
    .on("error", (error) => {
      console.error("Error processing CSV file:", error);
      res.status(500).send("Failed to process CSV file.");
    });
});

// Start the HTTP server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
