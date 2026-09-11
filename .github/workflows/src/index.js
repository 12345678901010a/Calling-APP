import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export default function App() {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);

  // Initialize PeerJS
  useEffect(() => {
    const peer = new Peer();
    peer.on("open", (id) => {
      setPeerId(id);
      console.log("Your Peer ID:", id);
    });

    peer.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        });
    });

    peerInstance.current = peer;
    return () => peer.destroy();
  }, []);

  // Start a call
  const startCall = () => {
    if (!peerInstance.current) return;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        const call = peerInstance.current.call(remotePeerId, stream);
        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
        setIsCalling(true);
      });
  };

  // Send a message
  const sendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, inputMessage]);
      setInputMessage("");
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
        Discord Clone (WebRTC + AI)
      </h1>
      <div style={{ marginBottom: "16px" }}>
        <p>
          Your Peer ID: <strong>{peerId}</strong>
        </p>
        <input
          type="text"
          placeholder="Enter remote Peer ID"
          value={remotePeerId}
          onChange={(e) => setRemotePeerId(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginRight: "8px",
          }}
        />
        <button
          onClick={startCall}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isCalling ? "Calling..." : "Start Call"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <div>
          <h2 style={{ fontWeight: "bold" }}>You</h2>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            style={{ width: "300px", height: "200px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>
        <div>
          <h2 style={{ fontWeight: "bold" }}>Remote</h2>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: "300px", height: "200px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "8px",
            borderRadius: "4px",
            height: "100px",
            overflowY: "auto",
          }}
        >
          {messages.map((msg, i) => (
            <p key={i} style={{ fontSize: "14px", margin: "4px 0" }}>
              {msg}
            </p>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type a message"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginTop: "8px",
            width: "100%",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "8px 16px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginTop: "8px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
