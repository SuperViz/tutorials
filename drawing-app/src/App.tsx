import { v4 as generateId } from "uuid";
import { useCallback, useEffect, useRef, useState } from "react";
import SuperVizRoom, {
  LauncherFacade,
  MousePointers,
  Participant,
  ParticipantEvent,
  WhoIsOnline,
} from "@superviz/sdk";
import {
  Realtime,
  type Channel,
  type RealtimeMessage,
} from "@superviz/realtime/client";
import { Board } from "./components/board";
import { BoardState } from "./types/global.types";
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const ROOM_ID = "drawing-app";
const PLAYER_ID = generateId();

export default function App() {
  const initialized = useRef(false);
  const ready = useRef(false);
  const [fillColor, setFillColor] = useState("#000");
  const [state, setState] = useState<BoardState>({
    rectangles: [],
    circles: [],
    arrows: [],
    scribbles: [],
  });

  const contentRef = useRef<HTMLDivElement | null>(null);
  const channel = useRef<Channel | null>(null);
  const superviz = useRef<LauncherFacade | null>(null);

  useEffect(() => {
    initialize();
  }, []);

  const handleRealtimeMessage = useCallback(
    (message: RealtimeMessage<BoardState>) => {
      if (message.participantId === PLAYER_ID) return;

      setState(message.data);
    },
    []
  );

  const updateState = useCallback((state: BoardState) => {
    setState(state);

    if (channel.current) {
      channel.current.publish("update-state", state);
    }
  }, []);

  const initialize = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;

    const url = new URL(window.location.href);
    const name = url.searchParams.get("name") || "Anonymous";

    superviz.current = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: {
        id: PLAYER_ID,
        name,
      },
      group: {
        id: "drawing-app",
        name: "drawing-app",
      },
    });

    const realtime = new Realtime(apiKey, {
      participant: {
        id: PLAYER_ID,
        name,
      },
    });
    const whoIsOnline = new WhoIsOnline();

    superviz.current?.addComponent(whoIsOnline);

    channel.current = await realtime.connect("board-topic");
    channel.current.subscribe<BoardState>(
      "update-state",
      handleRealtimeMessage
    );

    superviz.current?.subscribe(
      ParticipantEvent.LOCAL_UPDATED,
      (participant: Participant) => {
        setFillColor(participant.slot?.color || "#000");

        if (!ready.current && participant.slot?.index !== 0) {
          ready.current = true;

          const mousePointers = new MousePointers("board-container");
          superviz.current?.addComponent(mousePointers);
        }
      }
    );
  }, [handleRealtimeMessage, ready]);

  return (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col">
      <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">SuperViz Drawing App</h1>
      </header>
      <main
        ref={contentRef}
        className="w-full h-full flex items-center justify-center"
        id="board-container"
      >
        {ready && (
          <Board
            state={state}
            setState={updateState}
            width={contentRef.current?.clientWidth || 0}
            height={contentRef.current?.clientHeight || 0}
            fillColor={fillColor}
          />
        )}
        {!ready && (
          <div className="w-full h-full flex items-center justify-center">
            Loading...
          </div>
        )}
      </main>
    </div>
  );
}
