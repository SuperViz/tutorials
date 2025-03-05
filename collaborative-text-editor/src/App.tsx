import { createRoom, ParticipantEvent, Room } from "@superviz/room";
import { v4 as generateId } from "uuid";

import { useCallback, useEffect, useState, useRef } from "react";
import { VideoEvent, VideoHuddle } from "@superviz/video";
import * as Y from "yjs";
import { setColors } from "./setColors";
import ReactQuill, { Quill } from "react-quill-new";
import { QuillBinding } from "y-quill";
import QuillCursors from "quill-cursors";

import { SuperVizYjsProvider } from "@superviz/yjs";

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

const ydoc = new Y.Doc();
const provider = new SuperVizYjsProvider(ydoc);

Quill.register("modules/cursors", QuillCursors);

const App = () => {
  // States ::
  const [participantJoined, setParticipantJoined] = useState(false);
  const [huddleStarted, setHuddleStarted] = useState(false);
  const [ids, setIds] = useState(new Set<number>());
  const quillRef = useRef<ReactQuill | null>(null);

  const roomRef = useRef<Room | null>(null);

  // Initialize ::
  const initialize = useCallback(async () => {
    try {
      const room = await createRoom({
        developerToken: DEVELOPER_TOKEN,
        roomId: "ROOM_ID",
        participant: {
          id: generateId(),
          name: "Name " + Math.floor(Math.random() * 10),
        },
        group: {
          id: "GROUP_ID",
          name: "GROUP_NAME",
        },
        environment: "dev",
      });

      // Store the room instance in the ref
      roomRef.current = room;

      room.subscribe(ParticipantEvent.PARTICIPANT_UPDATED, (participant) => {
        console.log(participant.slot?.index);
        setParticipantJoined(true)
      });


    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const startHuddle = async () => {
    const video = new VideoHuddle({
      participantType: "host",
    });

    video.subscribe(VideoEvent.MY_PARTICIPANT_JOINED, () =>
      setHuddleStarted(true)
    );

    // Use the room instance from the ref
    if (roomRef.current) {
      roomRef.current.addComponent(video);
    }
  };

  return (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col relative">

    </div>
  );
};

export default App;
