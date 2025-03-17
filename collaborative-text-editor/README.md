# Step-by-Step Tutorial: Building a Collaborative Text Editor with SuperViz, Quill.js, and Yjs

In this tutorial, we'll walk through the process of creating a collaborative text editor using the SuperViz SDK, Yjs for real-time shared state, and Quill.js as the rich text editor interface. With SuperViz, we can enable multiple participants to collaborate on a document in real-time, seeing each other's edits and selections live.

## We'll use **SuperViz** to manage participant sessions, **Yjs** to handle the collaborative data structures, and **Quill.js** for a rich text editing experience. Let's get started!

## Step 1: Set Up Your React Application

To start, we need to set up a new React project where we will integrate SuperViz, Yjs, and Quill.js.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest collaborative-text-editor -- --template react-ts
cd collaborative-text-editor
```

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/room @superviz/yjs react-quill-new yjs uuid quill-cursors y-quill
```

- **@superviz/room:** SDK for leveraging real-time collaboration features.
- **@superviz/yjs:** SuperViz Yjs adapter for integrating Yjs with SuperViz.
- **react-quill-new:** Quill.js React wrapper to embed a rich text editor in the application.
- **yjs:** A CRDT (Conflict-Free Replicated Data Type) library that enables collaborative editing.
- **uuid:** A library for generating unique participant identifiers.
- **quill-cursors:** Quill.js plugin for displaying remote cursors.
- **y-quill:** Yjs binding for Quill.js.

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

## Step 2: Implement the Main Application

Now, let's implement the main logic to initialize the SuperViz room, manage collaborative state using Yjs, and set up Quill.js for real-time text editing.

### 1. Import Required Modules

Open `src/App.tsx` and start by importing all the necessary libraries.

```tsx
import { v4 as generateId } from "uuid";
import * as Y from "yjs";
import { SuperVizYjsProvider } from "@superviz/yjs";
import { createRoom, type Room, type Participant } from "@superviz/room";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ReactQuill, { Quill } from "react-quill-new";
import { QuillBinding } from "y-quill";
import QuillCursors from "quill-cursors";
import "react-quill-new/dist/quill.snow.css";
```

**Explanation:**

- Import necessary components from React, SuperViz SDK and UUID for managing state, initializing SuperViz and generating unique identifiers.
- Import Yjs and Quill.js components for real-time collaboration and text editing.
- Import the `SuperVizYjsProvider` and `QuillBinding` components for integrating Yjs with SuperViz and Quill.js.
- Import the css file for the snow theme that we'll use later.

### 2. Define Constants

Define constants for the API key, room ID, and player ID.

```tsx
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const ROOM_ID = "collaborative-text-editor";
const PLAYER_ID = generateId();
```

**Explanation:**

- **apiKey:** Retrieves the SuperViz API key from environment variables.
- **ROOM_ID:** Defines the room ID for the SuperViz session.
- **PLAYER_ID:** Generates a unique player ID using the `uuid` library.

### 3. Register Quill Modules

```tsx
Quill.register("modules/cursors", QuillCursors);
```

**Explanation:**

- **Quill.register**: To fully customize Quill's behavior and functionality, you need to register modules. In this case, we register the Quill Cursors module to enable remote cursor support in the rich text editor.

### 4. Define the setStyles Function

Create a function to set the CSS styles for each participant's cursor and selection.

```tsx
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
```

**Explanation:**

- **states:** A map of participant states from the provider awareness.
- **ids:** A set of participant client IDs we've already processed.
- For each participant, the function adds to the stylesheet the classes and styles for the cursor and selection, taking the colors from the state that each participant set for themselves.

### 5. Initialize the App Component

Set up the main `App` component and initialize state variables using React hooks.

```tsx
export default function App() {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(() => new SuperVizYjsProvider(ydoc), [ydoc]);

  const [ids, setIds] = useState(new Set<number>());

  const room = useRef<Room>();
  const quillRef = useRef<ReactQuill | null>(null);
  const loaded = useRef(false);
```

**Explanation:**

- **ydoc:** A Yjs document created with useMemo to ensure it's only created once.
- **provider:** The SuperVizYjsProvider that connects Yjs with the SuperViz environment.
- **ids:** A state to track participants we've already processed.
- **room:** A reference to store the SuperViz room instance.
- **quillRef:** A reference to the Quill editor instance.
- **loaded:** A flag to ensure initialization happens only once.

### 6. Initialize SuperViz Room

Next, create the initialization function to set up the SuperViz room and connect it with the Yjs provider.

```tsx
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
```

**Explanation:**

- **initializeSuperViz:** An asynchronous function that initializes the SuperViz room if it hasn't been initialized already.
- **createRoom:** Creates a new SuperViz room with the specified parameters.
- **my-participant.updated:** This event is triggered when the local participant data changes. It updates the awareness field with participant information so other users can see it.
- **style:** Creates a style element to store CSS for participant cursors.
- **updateStyles:** Updates the CSS styles when participant awareness changes.
- **Event listeners:** Sets up event listeners for connection, updates, and changes.
- **room.current.addComponent:** Adds the Yjs provider as a component to the SuperViz room.

### 7. Set Up Component Lifecycle

```tsx
useEffect(() => {
  initializeSuperViz();

  return () => {
    if (room.current) {
      room.current.removeComponent(provider);
      room.current.leave();
    }
  };
}, [initializeSuperViz, provider]);
```

**Explanation:**

- Calls the initialization function when the component mounts.
- Cleans up by removing the provider and leaving the room when the component unmounts.

### 8. Set Up Quill.js and Collaborative Binding

```tsx
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
```

**Explanation:**

- **QuillBinding:** Binds the Quill.js editor to the Yjs document for real-time collaboration.
- The binding is created when both the provider and the Quill editor are available.
- Clean-up function destroys the binding when the component unmounts.

### 9. Render the Application

```tsx
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
```

**Explanation:**

- Renders the Quill editor with the snow theme.
- Configures the editor with toolbar options and cursor support.
- Sets up the container with appropriate styles.

### 10. Define the cursor and selection styles

Add these CSS styles to your application to properly display participant cursors:

```css
.ql-cursor-selections .ql-cursor-selection-block {
  background-color: var(--presence-color) !important;
  opacity: 0.4;
}

.ql-cursor-caret-container .ql-cursor-caret {
  background-color: var(--presence-color) !important;
}

.ql-cursor-flag {
  background-color: var(--presence-color) !important;
  color: var(--sv-text-color) !important;
}
```

**Explanation:**

- **presence-color:** A color used to represent each participant's cursor and selection, defined inside the SuperViz SDK.
- **sv-text-color:** A color that has a nice contrast with the presence-color, defined inside the SuperViz SDK.
- These styles target Quill.js cursor elements to customize their appearance based on participant colors.

---

### Step 3: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can interact with the text editor and see what other participants are typing in real-time.

### 2. Test the Application

- **Real-Time Collaboration**: Open multiple instances of the application to test collaboration. You should see live updates of the text as participants type, along with their cursors and selections.
- Each participant will receive a random name and a unique color for their cursor and selections.

### Summary

In this tutorial, we built a collaborative text editor using SuperViz, Yjs, and Quill.js. We enabled real-time synchronization of text and provided visual feedback for participants' edits and selections. The combination of SuperViz and Yjs provides a powerful tool for real-time collaborative experiences.

For further exploration, you can customize this setup to support various formatting options and collaborative scenarios.
