import React, { useEffect, useState } from "react";

const WhatsAppQR = () => {
  const [status, setStatus] = useState("loading");
  const [qrCode, setQrCode] = useState(null);
  const [message, setMessage] = useState("");

  const fetchQRStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/whatsappQR");
      const data = await response.json();

      if (data.status === "connected") {
        setStatus("connected");
        setMessage(data.message);
      } else if (data.status === "disconnected") {
        setStatus("disconnected");
        setQrCode(data.qr);
      } else {
        setStatus("error");
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error fetching QR status:", error);
      setStatus("error");
      setMessage("Failed to fetch QR status.");
    }
  };

  useEffect(() => {
    // Fetch QR status every 60 seconds
    fetchQRStatus();
    const interval = setInterval(fetchQRStatus, 60000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>WhatsApp Device Connection Status</h1>
      {status === "connected" && <p>{message}</p>}
      {status === "disconnected" && (
        <>
          <p>Device is not connected. Scan the QR code below:</p>
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="QR Code"
            style={{ width: "300px", height: "300px" }}
          />
        </>
      )}
      {status === "error" && <p>{message}</p>}
      {status === "loading" && <p>Loading...</p>}
    </div>
  );
};

export default WhatsAppQR;
