# Step-by-Step Tutorial: Building a Collaborative Code Editor with SuperViz, Monaco Editor, and Yjs

In this tutorial, we'll walk through the process of creating a collaborative code editor using the SuperViz SDK, Yjs for real-time shared state, and the Monaco Editor as the code editor interface. With SuperViz, we can enable multiple participants to collaborate on a codebase in real-time, seeing each other's edits and selections live.

## We’ll use the **SuperViz SDK** to manage participant sessions, **Yjs** to handle the collaborative data structures, and **Monaco Editor** for an intuitive code editing experience. Let’s get started!

## Step 1: Set Up Your React Application

To start, we need to set up a new React project where we will integrate SuperViz, Yjs, and Monaco Editor.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest collaborative-text-editpr -- --template react-ts
cd collaborative-text-editpr
```

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/sdk @superviz/yjs @monaco-editor/react yjs uuid monaco-editor y-monaco y-protocols
```

- **@superviz/sdk:** SDK for leveraging real-time collaboration features.
- **@superviz/yjs:** SuperViz Yjs adapter for integrating Yjs with SuperViz.
- **@monaco-editor/react:** Monaco Editor React wrapper to embed the Monaco Editor in the application.
- **yjs:** A CRDT (Conflict-Free Replicated Data Type) library that enables collaborative editing.
- **uuid:** A library for generating unique participant identifiers.
- **monaco-editor:** The Monaco Editor library for code editing.
- **y-monaco:** Yjs bindings for Monaco Editor.
- **y-protocols:** Yjs protocol definitions for CRDT operations (a dependency of Monaco).

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

## Step 2: Implement the Main Application

Now, let’s implement the main logic to initialize the SuperViz room, manage collaborative state using Yjs, and set up Monaco Editor for real-time code editing.

### 1. Import Required Modules

Open `src/App.tsx` and start by importing all the necessary libraries.

```tsx
import { v4 as generateId } from "uuid";
import * as Y from "yjs";
import { SuperVizYjsProvider } from "../../../superviz/packages/yjs/src/index";
import { MonacoBinding } from "y-monaco";
import SuperVizRoom, {
  type LauncherFacade,
  type Participant,
} from "@superviz/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { setColors } from "./setColors";
```

**Explanation:**

- Import necessary components from React, SuperViz SDK and UUID for managing state, initializing SuperViz and generating unique identifiers.
- Import Yjs and Monaco Editor components for real-time collaboration and code editing.
- Import the `SuperVizYjsProvider` and `MonacoBinding` components for integrating Yjs with SuperViz and Monaco Editor.
- Import the `setColors` function to set CSS of each participant's cursor.

### 2. Define Constants

Define constants for the API key, room ID, and player ID.

```tsx
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const ROOM_ID = "collaborative-code-editor";
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

- **Y.Doc**: The Yjs document stores the collaborative state. It will be used both to initialize the Monaco Binding awareness and to initialize the SuperVizYjsProvider.
- **SuperVizYjsProvider**: A provider that connects Yjs with the SuperViz environment, enabling real-time collaboration.

### 4. Initialize SuperViz Room

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
- **editor:** A state variable to store the Monaco Editor instance.
- **ids:** A set to store the unique identifiers of participants collaborating.
- **room:** A reference to the SuperViz room instance.

### 5. Initialize SuperViz Room

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
      id: "code-editor-group",
      name: "Collaborative Code Editor",
    },
    environment: "dev",
    debug: true,
  });

  superviz.addComponent(provider);
}, []);
```

**Explanation:**

- **initialize:** An asynchronous function that initializes the SuperViz room and checks if it's already initialized to prevent duplicate setups.
- **SuperVizRoom:** Configures the room, participant, and group details for the session.

### 6. Handle Participant Updates and Styles

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
  style.id = "sv-yjs-monaco";
  document.head.appendChild(style);

  return superviz;
)
```

**Explanation:**

- **participant.updated**: This event is triggered when the local participant data changes. It will help us keep track of their color, so we can propagate it to other participants through the provider awareness.
- **updateStyles**: A function to update the CSS styles when participants colors changes.
- **provider events**: Listens for events so the application can the styles in oportune moments: once the participant enters the room, once they form the initial list of changes and every time someone in the room announces an update.
- **style**: Creates a new style element to store the CSS styles for each participant.

### 7. Define the cursor and selection styles

Define the CSS styles for the cursor and selection of each participant referencing Monaco classes and id.

```tsx
* {
  box-sizing: border-box;
  border: 0;
  margin: 0 !important;
  padding: 0;
}

#monaco-editor {
  width: 100%;
  height: 600px;
  border: 1px solid #ccc;
}

.yRemoteSelection {
  background-color: var(--presence-color);
  opacity: 0.5;
}

.yRemoteSelectionHead {
  position: absolute;
  background-color: var(--presence-color);
  height: 200%;
  bottom: 0;
  width: 2px;
  box-sizing: border-box;
}

.yRemoteSelectionHead:after {
  position: absolute;
  content: " ";
  font-size: 10px;
  padding: 2px;
  font-family: sans-serif;
  font-weight: bold;
  background-color: var(--presence-color);
  color: var(--sv-text-color);
  border-radius: 4px;
  left: 0px;
  bottom: 60%;
}
```

**Explanation:**

- **presence-color:** A color used to represent each participant's cursor and selection. Is defined inside the SuperViz SDK.
- **sv-text-color:** A color that has a nice contrast with the presence-color. Is defined inside the SuperViz SDK.
- **yRemoteSelection:** The CSS class for the remote selection of text.
- **yRemoteSelectionHead:** The CSS class for the remote selection head.

### 8. Define the setColors Function

Create a `src/setColors` file and inside it create a function to set the CSS styles for each participant's cursor and selection every time there is an update.

```tsx
export function setColors(
  states: Map<number, Record<string, any>>,
  ids: Set<number>
): number[] {
  const stylesheet = document.getElementById("sv-yjs-monaco");
  if (!stylesheet) return [];

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

  stylesheet.innerText = styles;

  return idsList;
}
```

**Explanation:**

- **states:** A map of participant states. Comes from the provider awareness.
- **ids:** A set of participant client IDs.

For each participant, the function adds to the stylesheet the classes and styles for the cursor and selection, taking the colors from the state that each participant set for themselves.

---

### Step 3: Set Up Monaco Editor and Collaborative Binding

#### 1. Set Up the Editor Component

Render the Monaco Editor and bind it to the Yjs document for real-time collaborative editing.

```tsx
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
```

**Explanation:**

- **MonacoBinding**: Binds the Monaco Editor model to Yjs, allowing real-time collaboration on the editor's content.
- **provider.awareness**: Shares participants' awareness data (e.g., cursor position).

#### 2. Render the Application

The application renders the editor inside a container with styles to accommodate collaborative features like remote cursors.

```tsx
return (
  <div className="p-5 h-full bg-gray-200 flex flex-col gap-5">
    <div className="bg-[#1e1e1e] shadow-none h-[90%] overflow-auto rounded-sm">
      <div className="yRemoteSelectionHead"></div>
      <Editor
        defaultValue="// Connect to the room to start collaborating"
        defaultLanguage="typescript"
        onMount={(editor) => setEditor(editor)}
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
```

**Explanation:**

- **Editor**: Renders Monaco Editor in a dark theme and initializes it with a default message.
- **onMount**: Sets up the editor instance for further use in collaborative bindings.

---

### Step 4: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can interact with the code editor and see what other participants are typing in real-time.gfcbn

### 2. Test the Application

- **Real-Time Collaboration**: Open multiple instances of the application to test collaboration. You should see live updates of the code as participants type, along with their cursors and selections.

### Summary

In this tutorial, we built a collaborative code editor using SuperViz, Yjs, and Monaco Editor. We enabled real-time synchronization of code and provided visual feedback for participants' edits and selections. The combination of SuperViz and Yjs provides a powerful tool for real-time collaborative experiences.

For further exploration, you can customize this setup to support various programming languages and collaborative scenarios.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/collaborative-code-editor) for more details.
