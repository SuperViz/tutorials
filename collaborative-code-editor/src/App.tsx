import { v4 as generateId } from "uuid";
import * as Y from "yjs";
import { SuperVizYjsProvider } from "@superviz/yjs";
import { createRoom, Room } from "@superviz/room";
import { MonacoBinding } from "y-monaco";
import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;

const ROOM_ID = "collaborative-code-editor";
const PLAYER_ID = generateId();

function setStyles(
  states: Map<number, Record<string, any>>,
  ids: Set<number>
): number[] {
  const stylesheet = document.getElementById("sv-yjs-monaco");
  let styles = "";

  const idsList = [];
  for (const [id, state] of states) {
    if (ids.has(id) || !state.participant) continue;
    idsList.push(id);

    styles += `
      .yRemoteSelection-${id},
      .yRemoteSelectionHead-${id}  {
        --presence-color: ${state.participant.slot.color};
        }

        .yRemoteSelectionHead-${id}:after {
          content: "${state.participant.name}";
          --sv-text-color: ${state.participant.slot.textColor};
      }
    `;
  }

  stylesheet!.innerText = styles;

  return idsList;
}

const ydoc = new Y.Doc();
const provider = new SuperVizYjsProvider(ydoc);

export default function App() {
  const [editor, setEditor] = useState<any>(null);
  const [ids, setIds] = useState(new Set<number>());

  const room = useRef<Room>();
  const loaded = useRef(false);

  const initializeSuperViz = useCallback(async () => {
    if (loaded.current) return;
    loaded.current = true;

    room.current = await createRoom({
      developerToken: apiKey,
      roomId: ROOM_ID,
      participant: {
        name: "Name " + Math.floor(Math.random() * 10),
        id: PLAYER_ID,
      },
      group: {
        name: "collaborative-code-editor-group",
        id: "collaborative-code-editor-group",
      },
    });

    room.current.subscribe("my-participant.updated", (data) => {
      if (!data.slot?.index) return;

      provider.awareness?.setLocalStateField("participant", {
        id: data.id,
        slot: data.slot,
        name: data.name,
      });
    });

    const style = document.createElement("style");
    style.id = "sv-yjs-monaco";
    document.head.appendChild(style);

    const updateStyles = () => {
      const states = provider.awareness?.getStates();
      const idsList = setStyles(states, ids);

      setIds(new Set(idsList));
    };

    provider.on("connect", updateStyles);
    provider.awareness?.on("update", updateStyles);
    provider.awareness?.on("change", updateStyles);

    room.current.addComponent(provider);
  }, [provider.awareness]);

  useEffect(() => {
    initializeSuperViz();

    return () => {
      room.current?.removeComponent(provider);
      room.current?.leave();
    };
  }, [initializeSuperViz]);

  useEffect(() => {
    if (editor == null) return;

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
