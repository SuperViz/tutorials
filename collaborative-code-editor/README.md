# Step-by-Step Tutorial: Building a Collaborative Code Editor with SuperViz, Monaco Editor, and Yjs

In this tutorial, we will guide you through adding real-time synchronization to a productivity tool using SuperViz Collaboration and SuperViz Real-time. Real-time synchronization is a crucial feature for collaborative applications, allowing multiple users to interact with shared content simultaneously and see each other's changes as they happen. With SuperViz, you can build interactive tools that update live, providing a seamless collaborative experience for users.

We'll demonstrate how to integrate a Monaco code editor with real-time synchronization, enabling developers to collaborate on code with real-time updates. This setup allows multiple participants to edit the same document and see each other's cursors and selections in real-time. Let's get started!

---

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate SuperViz for real-time synchronization.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest collaborative-code-editor -- --template react-ts
cd collaborative-code-editor
```

### 2. Install Required Libraries

Next, install the necessary libraries for our collaborative code editor:

```bash
npm install @superviz/room @superviz/yjs @monaco-editor/react yjs y-monaco uuid
```

- **@superviz/room:** Core package for creating and managing SuperViz rooms.
- **@superviz/yjs:** SuperViz provider for YJS, enabling real-time document collaboration.
- **@monaco-editor/react:** React wrapper for Monaco Editor (the same editor that powers VS Code).
- **yjs:** A CRDT implementation for real-time collaboration on shared data.
- **y-monaco:** YJS bindings for Monaco Editor.
- **uuid:** A library for generating unique identifiers.

### 3. Configure tailwind

In this tutorial, we'll use the [Tailwind css](tailwindcss.com) framework. First, install the tailwind package.

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

We then need to configure the template path. Open `tailwind.config.js` in the root of the project and insert the following code.

```javascript
/** @type {import('tailwindcss').Config} */
export default {
content: [
"./index.html",
"./src/**/*.{js,ts,jsx,tsx}",
],
theme: {
extend: {},
},
plugins: [],
}
```

Then we need to add the tailwind directives to the global CSS file. (src/index.css)

```javascript
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

## Step 2: Implement the Collaborative Code Editor

In this step, we'll implement the main application logic to initialize SuperViz, YJS, and Monaco Editor.

### 1. Set Up Required Imports and Utilities

Open `src/App.tsx` and add the necessary imports and utility functions:

```typescript
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
```

**Explanation:**

- **Imports:** Import necessary components from YJS, Monaco, SuperViz, and React.
- **Constants:** Define the API key, room ID, and a unique player ID for the current user.

### 2. Implement Cursor Style Utility

Add a utility function to handle cursor styles for displaying other participants:

```typescript
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
```

**Explanation:**

- **setStyles:** This function generates CSS styles for remote participant cursors and selections in the editor.
- **Styling:** It uses the participant's assigned color to style their cursor and adds their name as a tooltip.

### 3. Set Up YJS Document and Provider

Initialize the YJS document and SuperViz YJS provider:

```typescript
const ydoc = new Y.Doc();
const provider = new SuperVizYjsProvider(ydoc);
```

**Explanation:**

- **ydoc:** Creates a new YJS document that will store shared text.
- **provider:** Creates a SuperViz provider for YJS to handle network communication.

### 4. Create the App Component

Implement the main App component:

```typescript
export default function App() {
  const [editor, setEditor] = useState<any>(null);
  const [ids, setIds] = useState(new Set<number>());

  const room = useRef<Room>();
  const loaded = useRef(false);
```

**Explanation:**

- **editor:** State to store the Monaco editor instance once mounted.
- **ids:** State to keep track of participant IDs already processed for styling.
- **room:** Ref to store the SuperViz room instance.
- **loaded:** Ref to track whether the initialization has been completed.

### 5. Initialize SuperViz and YJS

Create a function to initialize SuperViz and integrate it with YJS:

```typescript
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
```

**Explanation:**

- **initializeSuperViz:** Initializes SuperViz room and sets up integration with YJS.
- **my-participant.updated:** Updates the YJS awareness with participant information when it changes.
- **Style Element:** Creates a style element to inject custom styles for remote cursors.
- **Event Listeners:** Sets up event listeners to update styles when participants connect or their states change.

### 6. Set Up Effect Hooks

Use effect hooks to initialize SuperViz and bind the Monaco editor to YJS:

```typescript
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
```

**Explanation:**

- **First useEffect:** Calls the initialization function when the component mounts and cleans up when unmounted.
- **Second useEffect:** Sets up the binding between Monaco editor and YJS when the editor is available.
- **MonacoBinding:** Creates a binding between the YJS document, the Monaco editor model, and the awareness protocol.

### 7. Render the Monaco Editor

Return the JSX structure for rendering the Monaco editor:

```typescript
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
```

**Explanation:**

- **Container:** A container for the editor with padding and background styling.
- **yRemoteSelectionHead:** A div for properly rendering remote selection heads.
- **Monaco Editor:** The code editor component with default settings and callback for when the editor is mounted.

---

## Step 3: Understanding the Project Structure

Here's a quick overview of how the project structure enables collaborative code editing:

1. **YJS Integration**
   - YJS provides the CRDT (Conflict-free Replicated Data Type) for collaborative text editing.
   - The SuperVizYjsProvider connects YJS to SuperViz's networking layer.
2. **Monaco Editor**
   - Monaco is a powerful code editor that powers VS Code.
   - The y-monaco binding connects the editor to YJS for real-time updates.
3. **Cursor Presence**
   - YJS awareness protocol is used to share cursor positions and selections.
   - CSS styles are dynamically generated to display remote cursors with user names.
4. **SuperViz Room**
   - The SuperViz room manages participants and provides the networking layer.
   - Participant information is synchronized with YJS awareness for cursor identification.

---

### Step 4: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can start editing code in the Monaco editor and collaborate with other users in real-time.

### 2. Test the Application

- **Collaborative Editing:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that changes to the code are reflected in real-time for all users.
- **Cursor Presence:** Verify that you can see other users' cursors and selections with their names displayed.
- **Concurrent Editing:** Test editing the same area of code simultaneously from different windows to verify that changes are merged correctly without conflicts.

### Summary

In this tutorial, we built a collaborative code editor using SuperViz, YJS, and Monaco Editor. We used YJS for real-time document synchronization, Monaco for the code editing experience, and SuperViz to handle the networking and presence aspects. This powerful combination allows multiple developers to collaborate on code in real-time, seeing each other's cursors and edits as they happen.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/collaborative-code-editor) for more details.
