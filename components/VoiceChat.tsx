"use client";

import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

export default function VoiceChat() {
  const socketRef = useRef<Socket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  const [partial, setPartial] = useState("");
  const [finalText, setFinalText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    console.log("useEffect");
    // Connect to NestJS socket
     const socket = io("https://api-field-voice.balanceapp.co.za", {
        transports: ["websocket"],          // 🚨 MUST HAVE
        upgrade: false,                     // avoid polling upgrade
        path: "/socket.io/",                // explicit Socket.IO path
        withCredentials: false,
      });   
       socketRef.current = socket;

    // Handle events from backend
    socket.on("partial", (text) => setPartial(text));
    socket.on("final", (text) => setFinalText((prev) => prev + " " + text));
    socket.on("pause", (text) => console.log("Pause detected:", text));
    socket.on("ai_response", (text) => setAiResponse(text));
    socket.on("audio-url", (url: string) => {
      console.log("Playing audio:", url);
      const audio = new Audio(url);
      audio.volume = 1.0;
      audio.play().catch((err) => console.error("Playback failed:", err));
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  async function startRecording() {
    setRecording(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const audioContext = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = audioContext;

    await audioContext.audioWorklet.addModule("/worklets/audio-processor.js");

    const source = audioContext.createMediaStreamSource(stream);
    const workletNode = new AudioWorkletNode(audioContext, "audio-processor");
    workletNodeRef.current = workletNode;

    workletNode.port.onmessage = (e) => {
      if (socketRef.current) {
        socketRef.current.emit("audio", e.data);
      }
    };

    source.connect(workletNode);
  }
  function requestAudio(){
    socketRef.current?.emit('handle-request')
  }
  async function stopRecording() {
    setRecording(false);

    audioContextRef.current?.close();
    audioContextRef.current = null;

    workletNodeRef.current = null;
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🎤 Voice Chat</h1>

      {/* PARTIAL TRANSCRIPT */}
      <div className="p-3 bg-gray-100 rounded text-gray-700">
        <strong>Partial:</strong> {partial}
      </div>

      {/* FINAL TRANSCRIPT */}
      <div className="p-3 bg-gray-100 rounded text-gray-700">
        <strong>You said:</strong> {finalText}
      </div>

      {/* AI RESPONSE */}
      <div className="p-3 bg-blue-100 rounded text-gray-700">
        <strong>AI:</strong> {aiResponse}
      </div>

      {/* BUTTONS */}
      <div>
        {!recording ? (
          <button
            onClick={requestAudio}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Start Talking 🎤
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Stop 🔇
          </button>
        )}
      </div>
    </div>
  );
}
