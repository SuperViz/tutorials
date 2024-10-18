# Step-by-Step Tutorial: How to build real-time collaboration features into Autodesk APS

In this tutorial, we will guide you through adding real-time presence features to an [Autodesk Viewer application](https://aps.autodesk.com/) using SuperViz. Real-time presence allows multiple users to interact with a 3D model collaboratively, seeing each other's actions and comments in real time. This feature is particularly useful for design review sessions, collaborative planning, and any scenario where real-time feedback on 3D models is essential.

We'll demonstrate how to set up an Autodesk Viewer with SuperViz, enabling participants to share their presence in a 3D space, leave comments, and interact with the model collaboratively. This setup will allow multiple participants to join a session, see each other's positions and interactions within the 3D model, and add contextual comments. Let's get started!

---

### Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate SuperViz and Autodesk Viewer.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest presence-autodesk-app -- --template react-ts
cd presence-autodesk-app
```

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/sdk @superviz/autodesk-viewer-plugin uuid
```

- **@superviz/sdk:** SDK for integrating real-time collaboration features, including presence.
- **@superviz/autodesk-viewer-plugin:** Plugin for adding SuperViz presence features to an Autodesk Viewer application.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key, Autodesk client ID, and client secret. These credentials will be used to authenticate your application with SuperViz and Autodesk services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
VITE_AUTODESK_CLIENT_ID=YOUR_AUTODESK_CLIENT_ID
VITE_AUTODESK_CLIENT_SECRET=YOUR_AUTODESK_CLIENT_SECRET
```

---

### Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and Autodesk Viewer, and handle real-time presence and comments.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the collaborative environment.

```tsx
import { v4 as generateId } from "uuid";
import { useCallback, useEffect, useRef } from "react";
import SuperVizRoom, { Comments } from "@superviz/sdk";
import { Presence3D, AutodeskPin } from "@superviz/autodesk-viewer-plugin";
```

**Explanation:**

- **Imports:** Import necessary components from React, SuperViz SDK, and Autodesk Viewer Plugin for managing state, initializing SuperViz, and enabling real-time presence and comments.

### 2. Define Constants

Define constants for the API key, Autodesk credentials, and room ID.

```tsx
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const clientId = import.meta.env.VITE_AUTODESK_CLIENT_ID as string;
const clientSecret = import.meta.env.VITE_AUTODESK_CLIENT_SECRET as string;
const documentId = `urn:${btoa(
  "urn:adsk.objects:os.object:e8d17563-1a4e-4471-bd72-a0a7e8d719bc/fileifc.ifc"
)}`;

const ROOM_ID = "presence-autodesk";
const PLAYER_ID = generateId();
```

**Explanation:**

- **apiKey:** Retrieves the SuperViz API key from environment variables.
- **clientId & clientSecret:** Autodesk credentials needed to authenticate and access Autodesk services.
- **documentId:** Encodes and sets the document ID for the 3D model to be loaded in the Autodesk Viewer.
- **ROOM_ID & PLAYER_ID:** Defines the room ID for the SuperViz session and generates a unique player ID.

### 3. Create the App Component

Set up the main `App` component and initialize references for the Autodesk Viewer.

```tsx
export default function App() {
  const autodeskViewer = useRef<Autodesk.Viewing.GuiViewer3D | null>(null);

  useEffect(() => {
    initializeAutodesk();
  }, []);
```

**Explanation:**

- **autodeskViewer:** A ref to store the Autodesk Viewer instance.
- **useEffect:** Calls the `initializeAutodesk` function once when the component mounts, setting up the Autodesk Viewer.

### 4. Initialize SuperViz

Create a function to initialize the SuperViz environment and integrate presence and comments.

```tsx
const initializeSuperViz = useCallback(async () => {
  const superviz = await SuperVizRoom(apiKey, {
    roomId: ROOM_ID,
    participant: {
      id: PLAYER_ID,
      name: "player-name",
    },
    group: {
      id: "presence-autodesk",
      name: "presence-autodesk",
    },
  });

  const presence = new Presence3D(autodeskViewer.current!);
  superviz.addComponent(presence);

  const pinAdapter = new AutodeskPin(autodeskViewer.current!);
  const comments = new Comments(pinAdapter, {
    buttonLocation: "top-right",
  });
  superviz.addComponent(comments);
}, []);
```

**Explanation:**

- **initializeSuperViz:** An asynchronous function that initializes the SuperViz room, adds the presence and commenting components to the Autodesk Viewer.
- **Presence3D:** Manages real-time presence in the 3D model, showing where each participant is looking or interacting.
- **AutodeskPin & Comments:** Allows participants to pin comments to specific locations in the 3D model, facilitating collaborative review sessions.

### 5. Handle Document Loading Success

Create a function to handle the successful loading of the Autodesk document.

```tsx
const onDocumentLoadSuccess = useCallback(
  async (document: Autodesk.Viewing.Document) => {
    const viewable = document.getRoot().getDefaultGeometry();

    if (!viewable) return;

    try {
      await autodeskViewer.current!.loadDocumentNode(document, viewable, {
        applyScaling: "meters",
      });

      await initializeSuperViz();
    } catch (error) {
      console.log("Document loaded failed", error);
    }
  },
  [initializeSuperViz]
);
```

**Explanation:**

- **onDocumentLoadSuccess:** Handles the successful loading of the 3D model, loading the document into the viewer and initializing SuperViz.
- **initializeSuperViz:** Called after the document is successfully loaded to set up presence and comments.

### 6. Handle Document Loading Failure

Create a function to handle document loading failures.

```tsx
const onDocumentLoadFailure = () => {
  console.log("Document loaded failed");
};
```

**Explanation:**

- **onDocumentLoadFailure:** Logs an error if the document fails to load into the Autodesk Viewer.

### 7. Initialize Autodesk Viewer

Create a function to initialize the Autodesk Viewer with the necessary credentials and configurations.

```tsx
const initializeAutodesk = useCallback(async () => {
  const viewerElement = document.getElementById("viewer")!;

  const response = await fetch(
    "https://developer.api.autodesk.com/authentication/v2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "data:read bucket:read",
      }).toString(),
    }
  );

  const data = await response.json();

  const options = {
    env: "AutodeskProduction2",
    api: "streamingV2",
    accessToken: data.access_token,
  };

  window.Autodesk.Viewing.Initializer(options, async () => {
    const viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerElement);
    await viewer.start();

    viewer.setTheme("dark-theme");
    viewer.setQualityLevel(false, false);
    viewer.setGhosting(false);
    viewer.setGroundShadow(false);
    viewer.setGroundReflection(false);
    viewer.setOptimizeNavigation(true);
    viewer.setProgressiveRendering(true);

    autodeskViewer.current = viewer;
    window.Autodesk.Viewing.Document.load(
      documentId,
      onDocumentLoadSuccess,
      onDocumentLoadFailure
    );
  });
}, [onDocumentLoadSuccess]);
```

**Explanation:**

- **initializeAutodesk:** Fetches an access token from Autodesk, initializes the Autodesk Viewer, and loads the specified document. If successful, it sets up the Autodesk Viewer with optimized settings for the session.

---

### Step 3: Render the Application

Finally, return the JSX structure for rendering the Autodesk Viewer and the SuperViz-powered interface.

```tsx
return (
  <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col">
    <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
      <h1 className="text-white text-2xl font-bold">
        SuperViz Presence Autodesk
      </h1>
    </header>
    <main className="w-full h-full flex items-center justify-center relative">
      <div
        id="viewer"
        className="w-full h-full overflow-hidden absolute top-0 left-0 w-full! h-full! z-0"
      ></div>
    </main>
  </div>
);
```

**Explanation:**

- **Viewer Container:** The `viewer` div is where the Autodesk Viewer will be rendered, filling the entire screen. This is where users will interact with the 3D model and collaborate in real time.

---

### Step 4: Understanding the Project Structure

Here's a quick overview of how the project structure supports real-time presence and commenting in an Autodesk Viewer application:

1. **`App.tsx`**
   - Initializes the SuperViz environment.
   - Sets up the Autodesk Viewer with real-time presence and commenting features.
   - Handles the loading of 3D models and integration of collaborative tools.
2. **Autodesk Viewer**
   - Renders the 3D model, allowing users to navigate, inspect, and collaborate in a shared virtual space.
3. **SuperViz Components**
   - **Presence3D:** Displays real-time presence information, showing where each participant is looking or interacting in the 3D model.
   - **AutodeskPin & Comments:** Enables users to add comments to specific locations in the 3D model, enhancing collaborative review sessions.

---

### Step 5: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm start
```

This command will start the development server and open your application in the default web browser. You can interact with the 3D model and see real-time presence and comments from other participants.

### 2. Test the Application

- **Real-Time Presence:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that presence information is updated in real-time.
- **Collaborative Interaction:** Test the commenting feature by adding comments to the 3D model and observing how they appear for other participants.

### Summary

In this tutorial, we integrated real-time presence and commenting features into an Autodesk Viewer application using SuperViz. We configured a React application to handle 3D model viewing, enabling multiple users to collaborate seamlessly in a shared virtual space. This setup can be extended and customized to fit various scenarios where real-time collaboration on 3D models is required.

### Additional Resources

- **SuperViz SDK Documentation:** Explore [SuperViz SDK](https://docs.superviz.com/sdk/realtime/channel) for more features and advanced configurations.
- **Autodesk Viewer Documentation:** Refer to Autodesk Viewer Documentation for additional insights into building applications with Autodesk Viewer.
- **React Documentation:** Check out React Documentation for more information on building React applications.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/presence-autodesk) for more details.
