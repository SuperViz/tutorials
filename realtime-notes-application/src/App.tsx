import { useCallback, useEffect, useRef, useState } from "react";
import { createRoom } from "@superviz/room";
import {
  MousePointers,
  WhoIsOnline,
} from "@superviz/collaboration";
import { Realtime, type Channel } from "@superviz/realtime/client";
import { v4 as generateId } from "uuid";
import { NoteNode } from "./components/note-node";
import { Note } from "./common/types";

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

const ROOM_ID = "video-huddle-application";
const PARTICIPANT_ID = generateId();

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const channel = useRef<Channel | null>(null);

  const initialize = useCallback(async () => {
    if (initialized) return;

    try {
      const room = await createRoom({
        developerToken: DEVELOPER_TOKEN,
        roomId: ROOM_ID,
        participant: {
          id: generateId(),
          name: "Participant",
        },
        group: {
          id: "GROUP_ID",
          name: "GROUP_NAME",
        },
      });

      const realtime = new Realtime(DEVELOPER_TOKEN, {
        participant: {
          id: PARTICIPANT_ID,
        },
      });

      channel.current = await realtime.connect("realtime-sync");

      channel.current.subscribe<Note>("note-change", (event) => {
        const note = event.data;



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
      room.addComponent(mousePointers);
      room.addComponent(whoIsOnline);

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
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }



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

    console.log("channel.current", channel.current);

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
