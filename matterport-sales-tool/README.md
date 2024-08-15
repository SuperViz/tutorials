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
npm install @superviz/sdk @superviz/matterport-plugin uuid
```

- **@superviz/sdk:** SDK for integrating real-time collaboration features, including video conferencing and presence.
- **@superviz/matterport-plugin:** Plugin for adding SuperViz presence and interaction features to a Matterport Viewer.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

### 3. Set Up Environment Variables

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
import { v4 as generateId } from 'uuid';
import { useCallback, useEffect, useRef } from "react";
import SuperVizRoom, { VideoConference } from '@superviz/sdk';
import { Presence3D } from '@superviz/matterport-plugin';
import type { MpSdk } from '@superviz/matterport-plugin/dist/common/types/matterport.types.d.ts';
```

**Explanation:**

- **Imports:** Import necessary components from React, SuperViz SDK, Matterport Plugin, and UUID for managing state, initializing SuperViz, enabling video conferencing, and handling Matterport SDK interactions.

### 2. Define Constants

Define constants for the API key, Matterport key, and room ID.

```tsx
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const matterportKey = import.meta.env.VITE_MATTERPORT_KEY as string;

const ROOM_ID = 'matterport-sales-tool';
const PLAYER_ID = generateId();
```

**Explanation:**

- **apiKey & matterportKey:** Retrieves the SuperViz and Matterport API keys from environment variables.
- **ROOM_ID & PLAYER_ID:** Defines the room ID for the SuperViz session and generates a unique player ID.

### 3. Create the App Component

Set up the main `App` component and initialize references for the Matterport SDK.

```tsx
export default function App() {
  const matterportSDK = useRef<MpSdk | null>(null);

  useEffect(() => {
    initializeMatterport();
  }, []);
```

**Explanation:**

- **matterportSDK:** A ref to store the Matterport SDK instance.
- **useEffect:** Calls the `initializeMatterport` function once when the component mounts, setting up the Matterport Viewer.

### 4. Initialize SuperViz

Create a function to initialize the SuperViz environment and integrate presence and video conferencing.

```tsx
const initializeSuperViz = useCallback(async () => {
  const superviz = await SuperVizRoom(apiKey, {
    roomId: ROOM_ID,
    participant: {
      id: PLAYER_ID,
      name: 'player-name',
    },
    group: {
      id: 'matterport-sales-tool',
      name: 'matterport-sales-tool',
    }
  });

  const presence = new Presence3D(matterportSDK.current!);
  superviz.addComponent(presence);

  const video = new VideoConference({
    enableFollow: true,
    enableGather: true,
    enableGoTo: true,
    userType: 'host'
  });

  superviz.addComponent(video);
}, []);
```

**Explanation:**

- **initializeSuperViz:** An asynchronous function that initializes the SuperViz room, adds the presence component to track user interactions within the 3D space, and integrates video conferencing.
- **Presence3D:** Manages real-time presence in the Matterport space, showing where each participant is looking or interacting.
- **VideoConference:** Adds video conferencing with features like follow, gather, and go-to, enhancing the collaborative experience.

### 5. Initialize Matterport Viewer

Create a function to initialize the Matterport Viewer with the necessary credentials and configurations.

```tsx
const initializeMatterport = useCallback(async () => {
  const showcase = document.getElementById('showcase') as MatterportIframe;
  const showcaseWindow = showcase.contentWindow as MatterportIframe['window'];
  const source = `/vendor/matterport/showcase.html?&play=1&qs=1&applicationKey=${matterportKey}&m=Zh14WDtkjdC`;
  showcase.setAttribute('src', source);

  await new Promise((resolve) => {
    showcase.addEventListener('load', async () => {
      matterportSDK.current = await showcaseWindow?.MP_SDK.connect(showcaseWindow, matterportKey);
      resolve(matterportSDK.current);
    });
  });

  initializeSuperViz();
}, [initializeSuperViz]);
```

**Explanation:**

- **initializeMatterport:** Loads the Matterport Viewer in an iframe, connects the Matterport SDK, and then initializes SuperViz for real-time collaboration.
- **initializeSuperViz:** Called after Matterport is initialized to set up presence and video conferencing.

---

### Step 3: Render the Application

Finally, return the JSX structure for rendering the Matterport Viewer and the SuperViz-powered interface.

```tsx
return (
  <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
    <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
      <h1 className='text-white text-2xl font-bold'>SuperViz Matterport Sales Tool</h1>
    </header>
    <main className='w-full h-full flex items-center justify-center relative'>
      <iframe id='showcase' className='w-full h-full' />
    </main>
  </div>
);
```

**Explanation:**

- **Viewer Container:** The `showcase` iframe is where the Matterport Viewer will be rendered, filling the entire screen. This is where users will interact with the 3D space and collaborate in real time.

---

### Step 4: Understanding the Project Structure

Here's a quick overview of how the project structure supports a Matterport sales tool:

1. **`App.tsx`**
    - Initializes the SuperViz environment.
    - Sets up the Matterport Viewer with real-time presence and video conferencing features.
    - Handles the loading of 3D spaces and integration of collaborative tools.
2. **Matterport Viewer**
    - Renders the 3D space, allowing users to navigate, inspect, and collaborate in a shared virtual environment.
3. **SuperViz Components**
    - **Presence3D:** Displays real-time presence information, showing where each participant is looking or interacting in the 3D space.
    - **VideoConference:** Enables video communication within the 3D space, supporting collaborative sales presentations and discussions.

---

### Step 5: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm start
```

This command will start the development server and open your application in the default web browser. You can interact with the 3D space and see real-time presence and video conferencing from other participants.

### 2. Test the Application

- **Real-Time Presence:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that presence information is updated in real-time.
- **Collaborative Interaction:** Test the video conferencing feature by starting a call within the 3D space and interacting with participants.

### Summary

In this tutorial, we built a Matterport sales tool using SuperViz for real-time collaboration. We configured a React application to handle 3D space navigation and video conferencing, enabling multiple users to engage in a collaborative sales presentation seamlessly. This setup can be extended and customized to fit various scenarios where real-time collaboration on 3D spaces is required.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/matterport-sales-tool) for more details.