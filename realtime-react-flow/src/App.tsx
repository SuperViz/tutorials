import { createRoom, Room } from "@superviz/room";
import { Comments, HTMLPin, MousePointers } from '@superviz/collaboration'
import { v4 as generateId } from "uuid";

import { useCallback, useEffect, useRef } from "react";
import { Realtime, type Channel } from "@superviz/realtime/client";


import ReactFlow, {
  useNodesState,
  Controls,
  Background,
  ConnectionLineType,
  addEdge,
  useEdgesState,
  ConnectionMode,
  Connection,
  useViewport,
  Node,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

type Edge = {
  type: ConnectionLineType;
  animated: boolean;
  source: string | null;
  target: string | null;
  sourceHandle: string | null;
  targetHandle: string | null;
};

const initialNodes = [
  { id: "1", position: { x: 381, y: 265 }, data: { label: "Start" } },
  { id: "2", position: { x: 556, y: 335 }, data: { label: "Action" } },
  { id: "3", position: { x: 701, y: 220 }, data: { label: "Process" } },
  { id: "4", position: { x: 823, y: 333 }, data: { label: "End" } },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: ConnectionLineType.SmoothStep,
    animated: true,
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: ConnectionLineType.SmoothStep,
    animated: true,
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: ConnectionLineType.SmoothStep,
    animated: true,
  },
];


const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

const Children = () => {
  const channelRef = useRef<Channel | null>(null);
  const roomRef = useRef<Room | null>(null);
  const initializedRef = useRef(false);
  const commentsRef = useRef<Comments | null>(null);
  const mousePointersRef = useRef<MousePointers | null>(null);

  const { x, y, zoom } = useViewport();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const initialize = useCallback(async () => {
    if (initializedRef.current) return;

    initializedRef.current = true;

    try {
      const participantId = generateId();
      const realtime = new Realtime(DEVELOPER_TOKEN, {
        participant: { 
          id: participantId
        },
      });

      channelRef.current = await realtime.connect("react-flow-nodes-sync");
      channelRef.current!.subscribe<{ edge: Edge }>(
        "new-edge",
        ({ data, participantId: senderId }) => {
          if (senderId === participantId) return;
  
          setEdges((eds) => addEdge(data.edge, eds));
        }
      );
  
      channelRef.current!.subscribe<{ node: Node }>(
        "node-drag",
        ({ data, participantId: senderId }) => {
          if (senderId === participantId) return;
  
          setNodes((nds) =>
            nds.map((node) =>
              node.id === data.node.id ? { ...node, ...data.node } : node
            )
          );
        }
      );

      const room = await createRoom({
        developerToken: DEVELOPER_TOKEN,
        roomId: "ROOM_ID",
        participant: {
          id: participantId,
          name: "Participant",
        },
        group: {
          id: "GROUP_ID",
          name: "GROUP_NAME",
        },
      });

      mousePointersRef.current = new MousePointers('react-flow-container')
      const pin = new HTMLPin('react-flow-container', { 
        dataAttributeName: "data-id",
        dataAttributeValueFilters: [/.*null-(target|source)$/],
      })

      commentsRef.current = new Comments(pin, {
        buttonLocation: 'comments'
      })



      room.addComponent(commentsRef.current)
      room.addComponent(mousePointersRef.current)

      roomRef.current = room;
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, []);

  const onDragOver = useCallback(
    (event: React.DragEvent<HTMLButtonElement | HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    []
  );

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      channelRef.current?.publish("node-drag", { node });
    },
    [channelRef]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge: Edge = {
        ...connection,
        type: ConnectionLineType.SmoothStep,
        animated: true,
      };

      setEdges((eds) => addEdge(edge, eds));

      channelRef.current!.publish("new-edge", {
        edge,
      });
    },
    [setEdges]
  );

  useEffect(() => {
    if(!mousePointersRef.current) return;

    mousePointersRef.current.transform({
      translate: {
        x: x,
        y: y,
      },
      scale: zoom,
    });
  }, [x, y, zoom]);

  useEffect(() => {
    initialize();

    return () => { 
      if(roomRef.current) { 
        roomRef.current.leave();
      }

      if(channelRef.current) { 
        channelRef.current.disconnect()
      }
    }
  }, []);
  

  return (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col">
      <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">React Flow + SuperViz</h1>
        <div id="comments" className="flex gap-2"></div>
      </header>
      <main className="flex-1 w-full h-full">
        <div id="react-flow-container" className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onNodeDrag={onNodeDrag}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            connectionMode={ConnectionMode.Loose}
          >
            <Controls showFitView={false} />
            <Background />
          </ReactFlow>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ReactFlowProvider>
      <Children />
    </ReactFlowProvider>
  )
}

export default App;
