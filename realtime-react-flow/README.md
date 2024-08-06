# Step-by-Step Tutorial: Learn how to add real-time synchronization to a React Flow application

In this tutorial, we will demonstrate how to set up a basic flowchart using React Flow and SuperViz to handle real-time synchronization. This setup allows multiple users to interact with nodes and edges in a flowchart simultaneously. Whenever a participant makes changes, such as adding new nodes or dragging existing ones, other participants will see those updates instantly. This is similar to collaborative platforms like Miro or Figma, where users can co-create diagrams and processes in real-time. Let's dive in!

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate the React Flow and SuperViz SDK for real-time collaboration.

### 1. Create a New React Project

First, create a new React application using Create React App with TypeScript.

```bash
npx create-react-app realtime-react-flow --template typescript
cd realtime-react-flow
```

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/react-sdk reactflow uuid
```

- **@superviz/react-sdk:** SuperViz SDK for integrating real-time collaboration features.
- **reactflow:** A library for building interactive flowcharts and diagrams.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

## Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and handle real-time synchronization in a React Flow application.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using the `SuperVizRoomProvider` to manage the collaborative environment.

```tsx
import { SuperVizRoomProvider } from '@superviz/react-sdk';
import { v4 as generateId } from 'uuid';
import Room from './Room';
import { ReactFlowProvider } from 'reactflow';

const developerKey = import.meta.env.VITE_SUPERVIZ_API_KEY;
const participantId = generateId();

export default function App() {
  return (
    <SuperVizRoomProvider
      developerKey={developerKey}
      group={{
        id: 'react-flow-tutorial',
        name: 'react-flow-tutorial',
      }}
      participant={{
        id: participantId,
        name: 'Participant',
      }}
      roomId='react-flow-tutorial'
    >
      <ReactFlowProvider>
        <Room participantId={participantId} />
      </ReactFlowProvider>
    </SuperVizRoomProvider>
  );
}
```

**Explanation:**

- **SuperVizRoomProvider:** This component wraps the application to enable real-time features and provides configuration for group and participant details.
- **developerKey:** Retrieves the developer key from environment variables to authenticate with SuperViz.
- **ReactFlowProvider:** Wraps the Room component to provide React Flow's context, which manages the state of the flowchart.
- **Room Component:** Contains the logic for rendering the flowchart and handling real-time interactions.

---

### Step 3: Create the Room Component

The Room component will be responsible for integrating React Flow with SuperViz, allowing users to collaborate on the flowchart in real-time.

### Step-by-Step Breakdown of the Room Component

Let's break down the Room component step-by-step to understand how it enables real-time collaboration using React Flow and SuperViz.

### 1. Import Necessary Modules

First, import the required modules and components from both `reactflow` and `@superviz/react-sdk`.

```tsx
import { useCallback, useEffect, MouseEvent, useRef } from "react";
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
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Comments,
  MousePointers,
  Realtime,
  useComments,
  useHTMLPin,
  useMouse,
  useRealtime,
  WhoIsOnline,
} from "@superviz/react-sdk";
```

**Explanation:**

- **ReactFlow Imports:** Provide flowchart components and utilities to create interactive diagrams.
- **SuperViz SDK Imports:** Includes tools for real-time collaboration, such as comments, mouse pointers, and synchronization.

### 2. Define Initial Nodes and Edges

Define the initial state of nodes and edges for the flowchart.

```tsx
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
```

**Explanation:**

- **initialNodes:** An array of objects defining each node's position and label in the flowchart.
- **initialEdges:** An array of objects defining connections between nodes, using a smooth step connection line with animation.

### 3. Define the Room Component

Create the `Room` component with properties to manage the participant ID.

```tsx
type Props = {
  participantId: string;
};

export default function Room({ participantId }: Props) {
  const subscribed = useRef(false);
```

**Explanation:**

- **Props Type:** Defines the expected properties for the `Room` component, including the `participantId`.
- **subscribed Ref:** A ref to track whether the component has subscribed to real-time events, ensuring it only subscribes once.

### 4. Set Up Real-Time Hooks and Utilities

Initialize the SuperViz SDK hooks and utilities to manage comments, real-time updates, and mouse transformations.

```tsx
// Managing comments
const { openThreads, closeThreads } = useComments();

// Managing real-time updates
const { isReady, subscribe, unsubscribe, publish } = useRealtime("default");

// Managing mouse pointers
const { transform } = useMouse();

// Pinning functionality for comments
const { pin } = useHTMLPin({
  containerId: "react-flow-container",
  dataAttributeName: "data-id",
  dataAttributeValueFilters: [/.*null-(target|source)$/],
});
```

**Explanation:**

- **useComments:** Provides functions to open and close comment threads.
- **useRealtime:** Offers real-time event handling methods like `subscribe`, `unsubscribe`, and `publish`.
- **useMouse:** Allows transformations based on mouse movements.
- **useHTMLPin:** Enables the pinning of comments to specific HTML elements within the application.

### 5. Initialize State for Nodes and Edges

Manage the state of nodes and edges using React Flow's hooks.

```tsx
const { x, y, zoom } = useViewport();
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
```

**Explanation:**

- **useViewport:** Provides the current viewport state, including the `x` and `y` translation and `zoom` level.
- **useNodesState:** Manages the state of nodes with initial values and handles changes.
- **useEdgesState:** Manages the state of edges with initial values and handles changes.

### 6. Handle Edge Connections

Define a callback function for handling new edge connections in the flowchart.

```tsx
const onConnect = useCallback(
  (connection: Connection) => {
    const edge = {
      ...connection,
      type: ConnectionLineType.SmoothStep,
      animated: true,
    };

    setEdges((eds) => addEdge(edge, eds));

    publish("new-edge", {
      edge,
    });
  },
  [setEdges, publish]
);
```

**Explanation:**

- **onConnect:** Handles the creation of new edges, updating the state and publishing the changes to all participants.
- **addEdge:** Adds a new edge to the current state.

### 7. Handle Node Dragging

Create a callback for handling node dragging events and publish the changes.

```tsx
const onNodeDrag = useCallback(
  (_: MouseEvent, node: Node) => {
    publish("node-drag", { node });
  },
  [publish]
);
```

**Explanation:**

- **onNodeDrag:** Publishes node position updates as they are dragged, allowing other participants to see the changes.

### 8. Handle Drag Over Events

Prevent the default behavior for drag-over events to enable custom dragging interactions.

```tsx
const onDragOver = useCallback(
  (event: React.DragEvent<HTMLButtonElement | HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  },
  []
);
```

**Explanation:**

- **onDragOver:** Sets the drag effect to "move" to provide visual feedback during drag operations.

### 9. Update Viewport on Mouse Movement

Adjust the viewport based on mouse movements to keep the flowchart aligned.

```tsx
useEffect(() => {
  transform({
    translate: {
      x: x,
      y: y,
    },
    scale: zoom,
  });
}, [x, y, zoom, transform]);
```

**Explanation:**

- **useEffect:** Transforms the viewport position and scale when the mouse moves, ensuring all participants have a synchronized view.

### 10. Set Data Attribute for SuperViz Pinning

Assign a data attribute to the React Flow container for SuperViz pinning.

```tsx
useEffect(() => {
  const element = document.querySelector(".react-flow__pane");

  if (!element) return;

  element.setAttribute("data-superviz-id", "plane");
}, []);
```

**Explanation:**

- **data-superviz-id:** Allows SuperViz to identify elements that can have pins attached, facilitating comment features.

### 11. Subscribe to Real-Time Events

Set up subscriptions to listen for real-time events and synchronize state changes.

```tsx
useEffect(() => {
  if (subscribed.current) return;

  const centerNodes = () => {
    const centerButton = document.querySelector(
      ".react-flow__controls-fitview"
    ) as HTMLButtonElement;
    centerButton?.click();
  };

  centerNodes();

  // Subscribe to new-edge events
  subscribe("new-edge", ({ data, participantId: senderId }) => {
    if (senderId === participantId) return;

    setEdges((eds) => addEdge(data.edge, eds));
  });

  // Subscribe to node-drag events
  subscribe(
    "node-drag",
    ({
      data,
      participantId: senderId,
    }: {
      data: { node: Node };
      participantId: string;
    }) => {
      if (senderId === participantId) return;

      setNodes((nds) =>
        nds.map((node) =>
          node.id === data.node.id ? { ...node, ...data.node } : node
        )
      );
    }
  );

  subscribed.current = true;
}, [isReady, setEdges, setNodes, unsubscribe, subscribe, participantId]);
```

**Explanation:**

- **subscribe:** Listens for specific events (`new-edge`, `node-drag`) and updates the local state based on incoming data.
- **unsubscribe:** Clean up subscriptions when no longer needed.

### 12. Render the Room Component

Finally, render the Room component with React Flow and SuperViz features.

```tsx
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
          onNodeDrag={onNodeDrag}
          edges={edges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onDragOver={onDragOver}
          connectionMode={ConnectionMode.Loose}
        >
          <Controls showFitView={false} />
          <Background />
        </ReactFlow>
      </div>

      {/* SuperViz Components */}
      <Realtime />
      <WhoIsOnline position="comments" />
      <Comments
        pin={pin}
        position="left"
        buttonLocation="comments"
        onPinActive={openThreads}
        onPinInactive={closeThreads}
      />
      <MousePointers elementId="react-flow-container" />
    </main>
  </div>
);
```

**Explanation:**

- **ReactFlow:** Displays the flowchart with nodes, edges, and interaction handlers.
- **Realtime:** Manages real-time synchronization of state across participants.
- **WhoIsOnline:** Shows a list of online participants in the session.
- **Comments:** Provides the ability to add and view contextual comments.
- **MousePointers:** Displays real-time mouse pointers for all participants.

---

## Step 4: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm start
```

This command will start the development server and open your application in the default web browser. You can interact with the flowchart and see updates in real-time across multiple participants.

### 2. Test the Application

- **Collaborative Flowchart:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that changes made by one participant are reflected in real-time for others.
- **Real-Time Updates:** Test the responsiveness of the application to see if it syncs correctly with actions performed by other users.

### Summary

In this tutorial, we built a collaborative flowchart application using React Flow and SuperViz for real-time synchronization. We configured a React application to handle node and edge interactions, enabling multiple users to collaborate seamlessly on a shared diagram. This setup can be extended and customized to fit various scenarios where real-time collaboration and workflow visualization are required.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/realtime-react-flow) for more details.