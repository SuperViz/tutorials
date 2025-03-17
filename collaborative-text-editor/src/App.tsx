/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as generateId } from "uuid";
import * as Y from "yjs";
import { SuperVizYjsProvider } from "@superviz/yjs";
import { createRoom, type Room, type Participant } from "@superviz/room";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ReactQuill, { Quill } from "react-quill-new";
import { QuillBinding } from "y-quill";
import QuillCursors from "quill-cursors";
import "react-quill-new/dist/quill.snow.css";

// Constants
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const ROOM_ID = "collaborative-text-editor";
const PLAYER_ID = generateId();

Quill.register("modules/cursors", QuillCursors);

function setStyles(
  states: Map<number, Record<string, any>>,
  ids: Set<number>
): number[] {
  const stylesheet = document.getElementById("sv-yjs-quill");
  let styles = "";

  const idsList = [];
  for (const [id, state] of states) {
    if (ids.has(id) || !state.participant) continue;
    idsList.push(id);

    styles += `
      #ql-cursor-${id} {
        --presence-color: ${state.participant.slot.color};
        --sv-text-color: ${state.participant.slot.textColor};
      }
    `;
  }

  stylesheet!.innerText = styles;
  return idsList;
}

export default function App() {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(() => new SuperVizYjsProvider(ydoc), [ydoc]);

  const [ids, setIds] = useState(new Set<number>());

  const room = useRef<Room>();
  const quillRef = useRef<ReactQuill | null>(null);
  const loaded = useRef(false);
  const initializeSuperViz = useCallback(async () => {
    if (loaded.current) return;
    loaded.current = true;

    room.current = await createRoom({
      developerToken: apiKey,
      roomId: ROOM_ID,
      participant: {
        id: PLAYER_ID,
        name: "Name " + Math.floor(Math.random() * 10),
      },
      group: {
        id: "text-editor",
        name: "text-editor",
      },
    });


    room.current.subscribe("my-participant.updated", (data: Participant) => {
      if (!data.slot?.index) return;

      provider.awareness?.setLocalStateField("participant", {
        id: data.id,
        slot: data.slot,
        name: data.name,
      });
    });

    const style = document.createElement("style");
    style.id = "sv-yjs-quill";
    document.head.appendChild(style);

    const updateStyles = () => {
      const states = provider.awareness?.getStates();
      const idsList = setStyles(states, ids);
      setIds(new Set(idsList));
    };

    provider.on("connect", updateStyles);
    provider.awareness?.on("update", updateStyles);
    provider.awareness?.once("change", updateStyles);



    room.current.addComponent(provider);
  }, [provider.awareness]);

  useEffect(() => {
    initializeSuperViz();

    return () => {
      if (room.current) {
        room.current.removeComponent(provider);
        room.current.leave();
      }
    };
  }, [initializeSuperViz, provider]);

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

  return (
    <div className="p-5 h-full bg-gray-200 flex flex-col gap-5">
      <div className="bg-[#1e1e1e] shadow-none h-[90%] overflow-auto rounded-sm">
        <ReactQuill
          className="h-full"
          placeholder="Start typing..."
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
}