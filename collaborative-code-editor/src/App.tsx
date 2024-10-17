/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as generateId } from "uuid";

import * as Y from "yjs";

import { SuperVizYjsProvider } from "@superviz/yjs";

import { MonacoBinding } from "y-monaco";
import SuperVizRoom, {
  type LauncherFacade,
  type Participant,
} from "@superviz/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { setColors } from "./setColors";

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;

const ROOM_ID = "collaborative-code-editor";
const PLAYER_ID = generateId();

const ydoc = new Y.Doc();
const provider = new SuperVizYjsProvider(ydoc);

export default function App() {
  const initialized = useRef(false);
  const [editor, setEditor] = useState<any>(null);
  const [ids, setIds] = useState(new Set<number>());
  const room = useRef<LauncherFacade>();

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
    style.id = "sv-yjs-monaco";
    document.head.appendChild(style);

    return superviz;
  }, [initialized, ids]);

  useEffect(() => {
    (async () => {
      room.current = await initialize();
    })();

    return () => {
      room.current?.removeComponent(provider);
      room.current?.destroy();
    };
  }, [initialize]);

  useEffect(() => {
    if (!provider || editor == null) return;

    const binding = new MonacoBinding(
      ydoc.getText("monaco"),
      editor.getModel()!,
      new Set([editor]),
      provider.awareness
    );
    return () => {
      binding.destroy();
    };
  }, [editor]);

  return (
    <div className="p-5 h-full bg-gray-200 flex flex-col gap-5">
      <div className="bg-[#1e1e1e] shadow-none h-[90%] overflow-auto rounded-sm">
        <div className="yRemoteSelectionHead"></div>
        <Editor
          defaultValue="// Connect to the room to start collaborating"
          defaultLanguage="typescript"
          onMount={(editor) => {
            setEditor(editor);
          }}
          height={"100vh"}
          options={{
            padding: {
              top: 32,
            },
          }}
          theme="vs-dark"
        />
      </div>
    </div>
  );
}
