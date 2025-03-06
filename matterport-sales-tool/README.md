# Step-by-Step Tutorial: How to build a Matterport sales tool

In this tutorial, we will guide you through creating a sales tool with Matterport and SuperViz. This tool allows sales teams to interactively present Matterport 3D spaces to clients in real-time, complete with video conferencing and live presence features. Whether you're showcasing real estate, virtual tours, or any 3D environment, this tool enhances the sales experience by enabling collaborative navigation and communication within the 3D space.

We'll demonstrate how to set up Matterport with SuperViz to enable real-time presence, video conferencing, and interactive features that help sales teams engage with clients more effectively.

Let's get started!

---

### Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate SuperViz and Matterport Viewer.

### 1. Create a New React Project

First, create a new React application using Create React App with TypeScript.

```bash
npm create vite@latest matterport-sales-tool -- --template react-ts
cd matterport-sales-tool
```

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/room @superviz/matterport-plugin @superviz/video uuid
```

- **@superviz/room:** Core package for creating and managing SuperViz rooms.
- **@superviz/matterport-plugin:** Plugin for adding SuperViz presence and interaction features to a Matterport Viewer.
- **@superviz/video:** Package for adding video conferencing capabilities.
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

Create a `.env` file in your project root and add your SuperViz developer key and Matterport application key. These credentials will be used to authenticate your application with SuperViz and Matterport services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
VITE_MATTERPORT_KEY=YOUR_MATTERPORT_KEY
```

---

### Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and Matterport Viewer, and handle real-time presence and video conferencing.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the collaborative environment.

```tsx
import { Presence3D } from '@superviz/matterport-plugin';
import { VideoHuddle } from "@superviz/video";
import { useCallback, useEffect, useRef } from "react";
import { v4 as generateId } from 'uuid';
// @ts-expect-error
import type { MpSdk } from '@superviz/matterport-plugin/dist/common/types/matterport.types.d.ts';
import { createRoom } from '@superviz/room';
```

**Explanation:**

- **Imports:** Import necessary components from React, SuperViz SDK, Matterport Plugin, and UUID for managing state, initializing SuperViz, enabling video conferencing, and handling Matterport SDK interactions.

### 2. Define Constants

Define constants for the API key, Matterport key, and room ID.

```tsx
// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
const MATTERPORT_KEY = import.meta.env.VITE_MATTERPORT_KEY as string

const ROOM_ID = 'matterport-sales-tool'

interface MatterportIframe extends HTMLIFrameElement {
  window: Window & { MP_SDK: { connect: (window: Window, matterportKey: string) => Promise<MpSdk> } }
}
```

**Explanation:**

- **DEVELOPER_TOKEN & MATTERPORT_KEY:** Retrieves the SuperViz and Matterport API keys from environment variables.
- **ROOM_ID:** Defines the room ID for the SuperViz session.
- **MatterportIframe interface:** Defines a TypeScript interface for the Matterport iframe element.

### 3. Create the App Component

Set up the main `App` component and initialize references for the Matterport SDK.

```tsx
export default function App() {
  const matterportSDK = useRef<MpSdk | null>(null)

  useEffect(() => {
    initializeMatterport()
  }, [])
}
```

**Explanation:**

- **matterportSDK:** A ref to store the Matterport SDK instance.
- **useEffect:** Calls the `initializeMatterport` function once when the component mounts, setting up the Matterport Viewer.

### 4. Initialize SuperViz

Create a function to initialize the SuperViz environment and integrate presence and video conferencing.

```tsx
const initializeSuperViz = useCallback(async () => {
  try {
    const room = await createRoom({
      developerToken: DEVELOPER_TOKEN,
      roomId: ROOM_ID,
      participant: {
        id: generateId(),
        name: " ",
      },
      group: {
        id: "GROUP_ID",
        name: "GROUP_NAME",
      },
    });

    const presence = new Presence3D(matterportSDK.current!)
    room.addComponent(presence)

    const video = new VideoHuddle({
      participantType: "host",
    });

   room.addComponent(video);
  } catch (error) {
    console.error("Error initializing SuperViz Room:", error);
  }
}, [])
```

**Explanation:**

- **initializeSuperViz:** A function that creates a SuperViz room and adds presence and video components.
- **createRoom:** Creates a new SuperViz room with the specified configuration.
- **Presence3D:** Adds 3D presence to the Matterport viewer, allowing users to see each other in the 3D space.
- **VideoHuddle:** Adds video conferencing capabilities to the application.

### 5. Initialize Matterport

Create a function to initialize the Matterport viewer and connect it to the SuperViz environment.

```tsx
const initializeMatterport = useCallback(async () => {
  const showcase = document.getElementById('showcase') as MatterportIframe
  const showcaseWindow = showcase.contentWindow as MatterportIframe['window']
  const source = `/vendor/matterport/showcase.html?&play=1&qs=1&applicationKey=${MATTERPORT_KEY}&m=5m4i274y1aV`;
  showcase.setAttribute('src', source);

  await new Promise((resolve) => {
    showcase.addEventListener('load', async () => {
      matterportSDK.current = await showcaseWindow?.MP_SDK.connect(showcaseWindow, MATTERPORT_KEY);
      resolve(matterportSDK.current);
    });
  });

  initializeSuperViz()
}, [initializeSuperViz])
```

**Explanation:**

- **initializeMatterport:** A function that initializes the Matterport viewer and connects it to the SuperViz environment.
- **showcase:** Gets the Matterport iframe element from the DOM.
- **source:** Sets the source URL for the Matterport viewer, including the Matterport key and model ID.
- **addEventListener:** Waits for the iframe to load, then connects to the Matterport SDK.
- **initializeSuperViz:** Calls the function to initialize SuperViz after Matterport is ready.

### 6. Render the Application

Return the JSX structure for rendering the application, including the Matterport iframe.

```tsx
return (
  <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
    <main className='w-full h-full flex items-center justify-center relative'>
      <iframe id='showcase' className='w-full h-full' />
    </main>
  </div>
)
```

**Explanation:**

- **div:** A container for the application with full width and height.
- **main:** A container for the Matterport iframe.
- **iframe:** The Matterport viewer iframe with the ID 'showcase'.

---

### Step 3: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```
This command will start the development server and open your application in the default web browser. You can navigate the Matterport 3D space and invite other participants to join.

### 2. Test the Application

- **3D Navigation:** Navigate through the Matterport 3D space using the standard Matterport controls.
- **Presence:** When multiple users join, you'll see their avatars in the 3D space.
- **Video Conference:** Use the video conference feature to communicate with other participants.

---

### Summary

In this tutorial, we integrated Matterport with SuperViz to create a powerful sales tool. We configured a React application to handle 3D presence and video conferencing within a Matterport environment, enabling multiple users to navigate and interact in a 3D space together. This setup can be extended and customized to fit various scenarios where collaborative 3D exploration is required.
