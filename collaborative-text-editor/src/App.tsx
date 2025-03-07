import { createRoom, ParticipantEvent, Room } from "@superviz/room";
import { v4 as generateId } from "uuid";

import QuillCursors from "quill-cursors";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import { QuillBinding } from "y-quill";
import * as Y from "yjs";
import { setColors } from "./setColors";

import { SuperVizYjsProvider } from "@superviz/yjs";

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

const ydoc = new Y.Doc();
const provider = new SuperVizYjsProvider(ydoc);

Quill.register("modules/cursors", QuillCursors);

const App = () => {
  // States ::
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

      room.addComponent(provider);

      room.subscribe(ParticipantEvent.PARTICIPANT_UPDATED, (participant) => {

        if (!participant.slot?.index) return;

        provider.awareness?.setLocalStateField("participant", {
          id: participant.id,
          slot: participant.slot,
          name: participant.name,
        });
      });

      const updateStyles = () => {
        const states = provider.awareness?.getStates();
        const idsList = setColors(states, ids);

        setIds(new Set(idsList));
      };

      provider.once("connect", updateStyles);
      provider.awareness?.once("change", updateStyles);
      provider.awareness?.on("update", updateStyles);

      const style = document.createElement("style");
      style.id = "sv-yjs-quill";
      document.head.appendChild(style);


    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, []);

  useEffect(() => {
    if (!provider || !quillRef.current) return;

    const binding = new QuillBinding(
      ydoc.getText("quill"),
      quillRef.current.getEditor(),
      provider.awareness
    );

    return () => {
      binding.destroy();
    };
  }, [ydoc, provider]);

  useEffect(() => {
    initialize();
  }, [initialize]);


  return (
    <div className="p-5 h-full bg-gray-200 flex flex-col gap-5">
      <div className="bg-[#1e1e1e] shadow-none h-[90%] overflow-auto rounded-sm">
        <ReactQuill
          placeholder="// Connect to the room to start collaborating"
          ref={quillRef}
          theme="snow"
          modules={{
            cursors: true,
            toolbar: [
              [{ header: [1, 2, false] }],
              ["bold", "italic", "underline"],
              ["image", "code-block"],
            ],
            history: {
              userOnly: true,
            },
          }}
        />{" "}
      </div>
    </div>
  );
};

export default App;
