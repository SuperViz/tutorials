import { useCallback, useEffect, useRef, useState } from "react";
import SuperVizRoom, {
  LauncherFacade,
  MousePointers,
  WhoIsOnline,
} from "@superviz/sdk";
import {
  Realtime,
  type RealtimeMessage,
  type Channel,
} from "@superviz/realtime/client";
import { v4 as generateId } from "uuid";
import { NoteNode } from "./components/note-node";
import { Note } from "./common/types";

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const ROOM_ID = "video-huddle-application";
const PARTICIPANT_ID = generateId();

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const superviz = useRef<LauncherFacade | null>(null);
  const channel = useRef<Channel | null>(null);

  const initialize = useCallback(async () => {
    if (initialized) return;

    const url = new URL(window.location.href);
    const name = url.searchParams.get("name") || "Anonymous";

    superviz.current = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: {
        id: PARTICIPANT_ID,
        name,
      },
      group: {
        id: "realtime-sync",
        name: "realtime-sync",
      },
    });

    const realtime = new Realtime(apiKey, {
      participant: {
        id: PARTICIPANT_ID,
        name,
      },
    });

    channel.current = await realtime.connect("realtime-sync");

    channel.current.subscribe("note-change", (event: RealtimeMessage) => {
      const note = event.data as Note;

      if (event.participantId === PARTICIPANT_ID || !note) return;

      setNotes((previous) => {
        return previous.map((n) => {
          if (n.id === note.id) {
            return note;
          }

          return n;
        });
      });
    });

    const mousePointers = new MousePointers("mouse-container");
    const whoIsOnline = new WhoIsOnline();
    superviz.current.addComponent(mousePointers);
    superviz.current.addComponent(realtime);
    superviz.current.addComponent(whoIsOnline);

    setInitialized(true);
    setNotes([
      {
        id: "note-1",
        title: `Unicorn's Shopping List`,
        content: "Rainbow sprinkles, cloud fluff, and pixie dust",
        x: 20,
        y: 50,
      },
      {
        id: "note-2",
        title: `Zombie's To-Do List`,
        content: "Find brains, practice groaning, shuffle aimlessly",
        x: 20,
        y: 50,
      },
      {
        id: "note-3",
        title: `Alien's Earth Observations`,
        content:
          "Humans obsessed with cat videos and avocado toast. Fascinating!",
        x: 20,
        y: 50,
      },
    ]);
  }, [initialized, setNotes]);

  const handleNoteChange = useCallback((note: Note) => {
    setNotes((prevNotes) => {
      return prevNotes.map((n) => {
        if (n.id === note.id) {
          return note;
        }

        return n;
      });
    });

    if (channel.current) {
      channel.current.publish("note-change", note);
    }
  }, []);

  useEffect(() => {
    initialize();
  });

  return (
    <>
      <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col">
        <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold">Real-Time Sync</h1>
        </header>
        <main
          id="mouse-container"
          className="flex-1 p-20 flex w-full gap-2 items-center justify-center overflow-hidden bg-canvas-background"
        >
          {notes.map((note, index) => (
            <NoteNode key={index} note={note} onChange={handleNoteChange} />
          ))}
        </main>
      </div>
    </>
  );
}
