# Step-by-Step Tutorial: How to build real-time collaboration features into Autodesk APS

In this tutorial, we will guide you through adding real-time presence features to an [Autodesk APS Viewer](https://aps.autodesk.com/) application using SuperViz. Real-time presence allows multiple users to interact with a 3D model collaboratively, seeing each other's actions and comments in real time. This feature is particularly useful for design review sessions, collaborative planning, and any scenario where real-time feedback on 3D models is essential.

We'll demonstrate how to set up an Autodesk APS Viewer with SuperViz, enabling participants to share their presence in a 3D space, leave comments, and interact with the model collaboratively. This setup will allow multiple participants to join a session, see each other's positions and interactions within the 3D model, and add contextual comments. Let's get started!

---

## Step 1: Set Up Your React Application

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
npm install @superviz/room @superviz/collaboration @superviz/autodesk-viewer-plugin uuid
```

- **@superviz/room:** Core package for creating and managing SuperViz rooms.
- **@superviz/collaboration:** Contains collaboration components like comments.
- **@superviz/autodesk-viewer-plugin:** Plugin for adding SuperViz presence features to an Autodesk Viewer application.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

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

Create a `.env` file in your project root and add your SuperViz developer key, Autodesk client ID, and client secret. These credentials will be used to authenticate your application with SuperViz and Autodesk services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
VITE_FORGE_CLIENT_ID=YOUR_AUTODESK_CLIENT_ID
VITE_FORGE_CLIENT_SECRET=YOUR_AUTODESK_CLIENT_SECRET
```

---

## Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and Autodesk Viewer, and handle real-time presence and comments.

### 1. Import Required Packages

Open `src/App.tsx` and add the necessary imports for our application:

```typescript
import { createRoom, Room } from "@superviz/room";
import { v4 as generateId } from "uuid";

import { useCallback, useEffect, useRef } from "react";
import { Presence3D, AutodeskPin } from "@superviz/autodesk-viewer-plugin";
import { Comments } from "@superviz/collaboration";

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
const CLIENT_ID = import.meta.env.VITE_FORGE_CLIENT_ID as string
const CLIENT_SECRET = import.meta.env.VITE_FORGE_CLIENT_SECRET as string
const DOCUMENT_ID = `urn:${btoa("urn:adsk.objects:os.object:e8d17563-1a4e-4471-bd72-a0a7e8d719bc/fileifc.ifc")}`
```

**Explanation:**

- **createRoom, Room:** From SuperViz room package for creating and managing rooms.
- **Presence3D, AutodeskPin:** From the Autodesk viewer plugin to add presence and pinning capabilities.
- **Comments:** From the collaboration package to enable contextual comments.
- **Environment Variables:** We're accessing our SuperViz and Forge credentials using environment variables.
- **DOCUMENT_ID:** The URN for the Autodesk model we want to load.

### 2. Create the App Component

Set up the main `App` component with necessary refs:

```typescript
const App = () => {
  const autodeskViewer = useRef<Autodesk.Viewing.GuiViewer3D | null>(null)
  const roomRef = useRef<Room | null>(null);
}
```

**Explanation:**

- **autodeskViewer:** A ref to store the Autodesk Viewer instance.
- **roomRef:** A ref to store the SuperViz room instance.

### 3. Initialize SuperViz

Create a function to initialize the SuperViz environment and integrate presence and comments:

```typescript
// Initialize ::
  const initializeSuperViz = useCallback(async () => {
    try {
      const room = await createRoom({
        developerToken: DEVELOPER_TOKEN,
        roomId: "ROOM_ID",
        participant: {
          id: generateId(),
          name: "Name " + Math.floor(Math.random() * 10),
        },
        group: {
          id: "GROUP_ID",
          name: "GROUP_NAME",
        },
      });

      // Store the room instance in the ref
      roomRef.current = room;

      const presence = new Presence3D(autodeskViewer.current!,{
        isAvatarsEnabled: false
      })
      room.addComponent(presence)

      const pinAdapter = new AutodeskPin(autodeskViewer.current!)
      const comments = new Comments(pinAdapter, {
        buttonLocation: 'top-right',
      })
      room.addComponent(comments)

    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, []);
```

**Explanation:**

- **createRoom:** Creates a new SuperViz room with participant and group information.
- **roomRef.current:** Stores the room instance for later access.
- **Presence3D:** Adds 3D presence to the Autodesk viewer with avatars disabled.
- **AutodeskPin & Comments:** Enables participants to place pins and leave comments on specific parts of the 3D model.

### 4. Handle Document Loading

Create functions to handle document loading success and failure:

```typescript
const onDocumentLoadSuccess = useCallback(async (document: Autodesk.Viewing.Document) => {
    const viewable = document.getRoot().getDefaultGeometry();

    if(!viewable) return

    try {
      await autodeskViewer.current!.loadDocumentNode(document, viewable, {
        applyScaling: 'meters'
      })

      await initializeSuperViz()
    } catch (error) {
      console.log('Document loaded failed', error)
    }

  }, [initializeSuperViz])

  const onDocumentLoadFailure = () => {
    console.log('Document loaded failed')
  }
```

**Explanation:**

- **onDocumentLoadSuccess:** When the document loads successfully, we get the default geometry and load it into the viewer, then initialize SuperViz.
- **onDocumentLoadFailure:** Handles any errors that occur during document loading.

### 5. Initialize Autodesk Viewer

Create a function to initialize the Autodesk Viewer with authentication and configuration:

```typescript
const initializeAutodesk = useCallback(async () => {
    const viewerElement = document.getElementById('viewer')!

    const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'data:read bucket:read',
      }).toString()
    })

    const data = await response.json()

    const options = {
      env: 'AutodeskProduction2',
      api: 'streamingV2',
      accessToken: data.access_token,
    }

    window.Autodesk.Viewing.Initializer(options, async () => {
      const viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerElement)
      await viewer.start()

      viewer.setTheme("dark-theme");
      viewer.setQualityLevel(false, false);
      viewer.setGhosting(false);
      viewer.setGroundShadow(false);
      viewer.setGroundReflection(false);
      viewer.setOptimizeNavigation(true);
      viewer.setProgressiveRendering(true);

      autodeskViewer.current = viewer
      window.Autodesk.Viewing.Document.load(DOCUMENT_ID, onDocumentLoadSuccess, onDocumentLoadFailure);
    })

  }, [onDocumentLoadSuccess])
```

**Explanation:**

- **Authentication:** Fetches an access token from Autodesk's authentication API using our client credentials.
- **Initializing the Viewer:** Sets up the Autodesk Viewer with the access token and configures it with optimized settings.
- **Loading the Document:** Loads the specified model and calls the appropriate success or failure handlers.

### 6. Initialize on Component Mount

Use an effect hook to initialize the Autodesk Viewer when the component mounts:

```typescript
useEffect(() => {
    initializeAutodesk();
  }, [initializeAutodesk]);
```

---

## Step 3: Render the Application

Finally, return the JSX structure for rendering the Autodesk Viewer and the SuperViz-powered interface:

```typescript
return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>SuperViz Presence Autodesk</h1>
      </header>
      <main className='w-full h-full flex items-center justify-center relative'>
        <div id='viewer' className='w-full h-full overflow-hidden absolute top-0 left-0 w-full! h-full! z-0'></div>
      </main>
    </div>
  );
};

export default App;
```

**Explanation:**

- **Viewer Container:** The `viewer` div is where the Autodesk Viewer will be rendered, filling the entire screen. This is where users will interact with the 3D model and collaborate in real time.

---

## Step 4: Understanding the Application Structure

Here's a quick overview of how the application components work together:

1. **Room Creation and Management**
   - The application creates a SuperViz room using the createRoom function.
   - It stores the room instance in a ref for later access.
2. **Autodesk Viewer Integration**
   - The application authenticates with Autodesk's API and initializes the 3D viewer.
   - It loads the specified model and configures the viewer for optimal performance.
3. **SuperViz Components**
   - **Presence3D:** Shows where participants are looking in the 3D model, with avatars disabled for a cleaner interface.
   - **AutodeskPin & Comments:** Enables participants to place pins and add comments to specific locations in the 3D model.

---

## Step 5: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can interact with the 3D model and see real-time presence and comments from other participants.

### 2. Test the Application

- **Real-Time Presence:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that presence information is updated in real-time.
- **Collaborative Interaction:** Test the commenting feature by adding comments to the 3D model and observing how they appear for other participants.

## Summary

In this tutorial, we integrated real-time presence and commenting features into an Autodesk Viewer application using SuperViz. We used the @superviz/room package to create a room, the @superviz/collaboration package for comments, and the @superviz/autodesk-viewer-plugin for presence and pinning capabilities. This setup enables multiple users to collaborate seamlessly in a shared 3D model, seeing each other's positions and adding contextual comments.
