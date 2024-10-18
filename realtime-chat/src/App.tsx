import { v4 as generateId } from "uuid";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  Realtime,
  type RealtimeMessage,
  type Channel,
} from "@superviz/realtime/client";
import { IoMdSend } from "react-icons/io";

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;

type Message = {
  participantName: string;
  message: string;
};

export default function App() {
  const url = new URL(window.location.href);
  const name = url.searchParams.get("name") || "Anonymous";

  const participant = useRef({
    id: generateId(),
    name: name,
  });
  const channel = useRef<Channel | null>(null);
  const initialized = useRef(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<RealtimeMessage<Message>[]>([]);

  const initialize = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;

    const realtime = new Realtime(apiKey, {
      participant: participant.current,
    });

    channel.current = await realtime.connect("message-topic");

    channel.current.subscribe<Message>("message", (data) => {
      setMessages((prev) =>
        [...prev, data].sort((a, b) => a.timestamp - b.timestamp)
      );
    });
  }, [initialized]);

  const sendMessage = useCallback(() => {
    if (!channel.current) return;

    channel.current.publish("message", {
      message,
      participantName: participant.current!.name,
    });

    setMessage("");
  }, [message, channel.current]);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div className="w-full h-full bg-[#e9e5ef] flex items-center justify-center flex-col">
      <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">Realtime Chat</h1>
      </header>
      <main className="flex-1 flex w-full flex-col justify-between overflow-hidden">
        <div className="bg-[#e9e5ef] w-full p-2 overflow-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.participantId === participant.current!.id
                  ? "justify-end"
                  : "justify-start"
              } w-full flex mb-2`}
            >
              <div
                className={`${
                  message.participantId === participant.current!.id
                    ? "bg-[#f29ee8]"
                    : "bg-[#baa9ff]"
                } text-black p-2 rounded-lg max-w-xs`}
              >
                <div
                  className={`${
                    message.participantId === participant.current!.id
                      ? "text-right"
                      : "text-left"
                  } text-xs text-[#57535f]`}
                >
                  {message.participantId === participant.current!.id
                    ? "You"
                    : message.data.participantName}
                </div>
                {message.data.message}
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 flex items-center justify-between gap-2 w-full h-[58px]">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="bg-purple-400 text-white px-4 py-2 rounded-full disabled:opacity-50"
            onClick={sendMessage}
            disabled={!message || !channel.current}
          >
            <IoMdSend />
          </button>
        </div>
      </main>
    </div>
  );
}
