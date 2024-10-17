# Step-by-Step Tutorial: Building a Collaborative Text Editor with SuperViz, Quill.js, and Yjs

In this tutorial, we'll walk through the process of creating a collaborative text editor using the SuperViz SDK, Yjs for real-time shared state, and the Quill.js as the rich text editor interface. With SuperViz, we can enable multiple participants to collaborate on a document in real-time, seeing each other's edits and selections live.

## We’ll use the **SuperViz SDK** to manage participant sessions, **Yjs** to handle the collaborative data structures, and **Quill.js** for a richt text editing experience. Let’s get started!

## Step 1: Set Up Your React Application

To start, we need to set up a new React project where we will integrate SuperViz, Yjs, and Quill.js.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest collaborative-text-editor -- --template react-ts
cd collaborative-text-editpr
```

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/sdk @superviz/yjs react-quill-new yjs uuid quill-cursors y-quill y-protocols
```

- **@superviz/sdk:** SDK for leveraging real-time collaboration features.
- **@superviz/yjs:** SuperViz Yjs adapter for integrating Yjs with SuperViz.
- **react-quill-new:** Quill.js React wrapper to embed a rich text editor in the application.
- **yjs:** A CRDT (Conflict-Free Replicated Data Type) library that enables collaborative editing.
- **uuid:** A library for generating unique participant identifiers.
- **quill-cursors:** Quill.js plugin for displaying remote cursors.
- **y-quill:** Yjs binding for Quill.js.
- **y-protocols:** Yjs protocol definitions for CRDT operations (a dependency of Quill.js).

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

## Step 2: Implement the Main Application

Now, let’s implement the main logic to initialize the SuperViz room, manage collaborative state using Yjs, and set up Quill.js for real-time code editing.

### 1. Import Required Modules

Open `src/App.tsx` and start by importing all the necessary libraries.

```tsx
import { v4 as generateId } from "uuid";
import * as Y from "yjs";
import { SuperVizYjsProvider } from "../../../superviz/packages/yjs/src/index";
import SuperVizRoom, {
  type LauncherFacade,
  type Participant,
} from "@superviz/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { setColors } from "./setColors";
import ReactQuill, { Quill } from "react-quill-new";
import { QuillBinding } from "y-quill";
import QuillCursors from "quill-cursors";
import "react-quill-new/dist/quill.snow.css";
```

**Explanation:**

- Import necessary components from React, SuperViz SDK and UUID for managing state, initializing SuperViz and generating unique identifiers.
- Import Yjs and Quill.js components for real-time collaboration and code editing.
- Import the `SuperVizYjsProvider` and `QuillBinding` components for integrating Yjs with SuperViz and Quill.js.
- Import the `setColors` function to set CSS of each participant's cursor.
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

### 3. Create Yjs Document and Provider

Define the Yjs document and create a SuperViz provider for Yjs, which will enable real-time collaboration.

```tsx
const ydoc = new Y.Doc();
const provider = new SuperVizYjsProvider(ydoc);
```

**Explanation:**

- **Y.Doc**: The Yjs document stores the collaborative state. It will be used both to initialize the Quill Binding awareness and to initialize the SuperVizYjsProvider.
- **SuperVizYjsProvider**: A provider that connects Yjs with the SuperViz environment, enabling real-time collaboration.

### 4. Register Quill Modules

```tsx
Quill.register("modules/cursors", QuillCursors);
```

**Explanation:**

- **Quill.register**: To fully customize Quill's behavior and functionality, you need to register modules. In this case, we register the Quill Cursors module to enable remote cursor support in the rich text editor.

### 5. Initialize SuperViz Room

Set up the main `App` component and initialize state variables.

```tsx
export default function App() {
  const initialized = useRef(false);
  const [editor, setEditor] = useState<any>(null);
  const [ids, setIds] = useState(new Set<number>());
  const room = useRef<LauncherFacade>();

```

**Explanation:**

- **initialized:** A state variable to track whether the SuperViz environment has been set up.
- **editor:** A state variable to store the Quill.js instance.
- **ids:** A set to store the unique identifiers of participants collaborating.
- **room:** A reference to the SuperViz room instance.

### 6. Initialize SuperViz Room

Next, create the initialize function to set up the SuperViz room and connect it with the Yjs provider.

```tsx
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
      id: "text-editor-group",
      name: "Collaborative Text Editor",
    },
    debug: true,
  });

  superviz.addComponent(provider);
}, []);
```

**Explanation:**

- **initialize:** An asynchronous function that initializes the SuperViz room and checks if it's already initialized to prevent duplicate setups.
- **SuperVizRoom:** Configures the room, participant, and group details for the session.

### 7. Handle Participant Updates and Styles

To manage the appearance of participants' cursors and selections, we need to track and update the participant states. The rest of the `initialize` function will handle this:

```tsx
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
  provider.awareness?.on("update", updateStyles);
  provider.awareness?.once("change", updateStyles);

  const style = document.createElement("style");
  style.id = "sv-yjs-quill";
  document.head.appendChild(style);

  return superviz;
)
```

**Explanation:**

- **participant.updated**: This event is triggered when the local participant data changes. It will help us keep track of their color, so we can propagate it to other participants through the provider awareness.
- **updateStyles**: A function to update the CSS styles when participants colors changes.
- **provider events**: Listens for events so the application can the styles in oportune moments: once the participant enters the room, once they form the initial list of changes and every time someone in the room announces an update.
- **style**: Creates a new style element to store the CSS styles for each participant.

### 8. Define the cursor and selection styles

Define the CSS styles for the cursor and selection of each participant referencing the Quill.js cursors module classes.

```tsx
* {
  box-sizing: border-box;
  border: 0;
  margin: 0 !important;
  padding: 0;
}

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

- **presence-color:** A color used to represent each participant's cursor and selection. Is defined inside the SuperViz SDK.
- **sv-text-color:** A color that has a nice contrast with the presence-color. Is defined inside the SuperViz SDK.
  **ql-cursor-selections:** The class that represents the selection of a participant in Quill.js.
  **ql-cursor-caret-container:** The class that represents the cursor of a participant in Quill.js.
  **ql-cursor-flag:** The class that represents the flag of a participant in Quill.js.

### 9. Define the setColors Function

Create a `src/setColors` file and inside it create a function to set the CSS styles for each participant's cursor and selection every time there is an update.

```tsx
export function setColors(
  states: Map<number, Record<string, any>>,
  ids: Set<number>
): number[] {
  const stylesheet = document.getElementById("sv-yjs-quill");
  if (!stylesheet) return [];

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

  stylesheet.innerText = styles;

  return idsList;
}
```

**Explanation:**

- **states:** A map of participant states. Comes from the provider awareness.
- **ids:** A set of participant client IDs.

For each participant, the function adds to the stylesheet the classes and styles for the cursor and selection, taking the colors from the state that each participant set for themselves.

---

### Step 3: Set Up Quill.js and Collaborative Binding

#### 1. Set Up the Editor Component

Render the Quill.js and bind it to the Yjs document for real-time collaborative editing.

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
}, [editor]);
```

**Explanation:**

- **QuillBinding**: Binds the Quill.js model to Yjs, allowing real-time collaboration on the editor's content.
  **quillRef.current**: The Quill.js instance.
- **provider.awareness**: Shares participants' awareness data (e.g., cursor position).

#### 2. Render the Application

The application renders the editor inside a container with styles to accommodate collaborative features like remote cursors.

```tsx
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
```

**Explanation:**

- **Editor**: Renders Quill.js in snow theme and initializes it with a default message and a few basic modules.

---

### Step 4: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can interact with the code editor and see what other participants are typing in real-time.

### 2. Test the Application

- **Real-Time Collaboration**: Open multiple instances of the application to test collaboration. You should see live updates of the code as participants type, along with their cursors and selections.

### Summary

In this tutorial, we built a collaborative code editor using SuperViz, Yjs, and Quill.js. We enabled real-time synchronization of code and provided visual feedback for participants' edits and selections. The combination of SuperViz and Yjs provides a powerful tool for real-time collaborative experiences.

For further exploration, you can customize this setup to support various programming languages and collaborative scenarios.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/collaborative-code-editor) for more details.
