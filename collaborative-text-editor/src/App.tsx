/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as generateId } from "uuid";

import * as Y from "yjs";

import { SuperVizYjsProvider } from "@superviz/yjs";

import SuperVizRoom, {
  type LauncherFacade,
  type Participant,
} from "@superviz/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { setColors } from "./setColors";

import ReactQuill, { Quill } from "react-quill-new";
import { QuillBinding } from "y-quill";
import QuillCursors from "quill-cursors";

// import "react-quill-new/dist/quill.snow.css";

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;

const ROOM_ID = "collaborative-text-editor";
const PLAYER_ID = generateId();

const ydoc = new Y.Doc();
const provider = new SuperVizYjsProvider(ydoc);

Quill.register("modules/cursors", QuillCursors);

export default function App() {
  const initialized = useRef(false);
  const [ids, setIds] = useState(new Set<number>());
  const room = useRef<LauncherFacade>();
  const quillRef = useRef<ReactQuill | null>(null);

  const initialize = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;

    const superviz = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: {
        id: PLAYER_ID,
        name: "player-name",
      },
      group: {
        id: "chess-game",
        name: "chess-game",
      },
      environment: "dev",
      debug: true,
    });

    superviz.addComponent(provider);

    superviz.subscribe("participant.updated", (data: Participant) => {
      if (!data.slot?.index) return;

      provider.awareness?.setLocalStateField("participant", {
        id: data.id,
        slot: data.slot,
        name: data.name,
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

    return superviz;
  }, [initialized, ids]);

  useEffect(() => {
    (async () => {
      room.current = await initialize();
    })();
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
}
