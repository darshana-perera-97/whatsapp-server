import React, { useState } from "react";

const CsvUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !message) {
      setResponseMessage("Please provide both a CSV file and a message.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", message); // Add the message to the form data

    try {
      const response = await fetch("http://localhost:5000/send-messages", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setResponseMessage("Messages sent successfully!");
      } else {
        setResponseMessage("Failed to send messages. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setResponseMessage("Error uploading file.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Send Messages via CSV</h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ marginBottom: "10px" }}
      />
      <textarea
        placeholder="Enter your message here"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows="4"
        style={{ display: "block", width: "300px", margin: "10px auto" }}
      />
      <button onClick={handleUpload}>Upload and Send</button>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
};

export default CsvUpload;
