# Step-by-Step Tutorial: How to add contextual comments to Matterport SDK

In this tutorial, we will guide you through adding contextual comments to a Matterport SDK application using SuperViz. Contextual comments enable users to leave feedback directly within a 3D model, making it easier to collaborate on design reviews, walkthroughs, and virtual tours. This feature is particularly useful in scenarios where precise feedback within a spatial context is critical.

We'll demonstrate how to integrate SuperViz with Matterport, allowing participants to add and view comments within the 3D environment in real-time. By the end of this tutorial, you'll have a fully functional Matterport application with a robust commenting system that enhances collaboration and communication.

Let's get started!

---

### Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate SuperViz and the Matterport SDK.

### 1. Create a New React Project

First, create a new React application using Create React App with TypeScript.

```bash
npm create vite@latest matterport-comments -- --template react-ts
cd matterport-comments
```

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/sdk @superviz/matterport-plugin uuid
```

- **@superviz/sdk:** For integrating real-time collaboration features, including comments.
- **@superviz/matterport-plugin:** Plugin for adding SuperViz interaction features to a Matterport Viewer.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key and Matterport application key. These credentials will be used to authenticate your application with SuperViz and Matterport services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
VITE_MATTERPORT_KEY=YOUR_MATTERPORT_KEY
```

---

### Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and Matterport Viewer, and handle real-time contextual comments.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the collaborative environment.

```tsx
import { v4 as generateId } from 'uuid';
import { useCallback, useEffect, useRef } from "react";
import SuperVizRoom, { Comments } from '@superviz/sdk';
import { MatterportPin } from '@superviz/matterport-plugin';
import type { MpSdk } from '@superviz/matterport-plugin/dist/common/types/matterport.types.d.ts';
```

**Explanation:**

- **Imports:** Import necessary components from React, SuperViz, Matterport Plugin, and UUID for managing state, initializing SuperViz, and enabling contextual comments within the Matterport SDK.

### 2. Define Constants

Define constants for the API key, Matterport key, and room ID.

```tsx
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const matterportKey = import.meta.env.VITE_MATTERPORT_KEY as string;

const ROOM_ID = 'matterport-comments';
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

Create a function to initialize SuperViz and integrate the contextual commenting system.

```tsx
const initializeSuperViz = useCallback(async () => {
  const superviz = await SuperVizRoom(apiKey, {
    roomId: ROOM_ID,
    participant: {
      id: PLAYER_ID,
      name: 'player-name',
    },
    group: {
      id: 'matterport-comments',
      name: 'matterport-comments',
    }
  });

  const pinAdapter = new MatterportPin(matterportSDK.current!, document.getElementById('showcase')!);
  const comments = new Comments(pinAdapter, {
    buttonLocation: 'top-right',
  });
  superviz.addComponent(comments);
}, []);
```

**Explanation:**

- **initializeSuperViz:** An asynchronous function that initializes SuperViz and adds the contextual comments component to the Matterport Viewer.
- **MatterportPin:** Adapts the Matterport SDK to work with SuperViz's commenting system, allowing users to pin comments directly in the 3D space.

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

- **initializeMatterport:** Loads the Matterport Viewer in an iframe, connects the Matterport SDK, and then initializes SuperViz for real-time collaboration and commenting.

---

### Step 3: Render the Application

Finally, return the JSX structure for rendering the Matterport Viewer and the SuperViz-powered interface.

```tsx
return (
  <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
    <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
      <h1 className='text-white text-2xl font-bold'>SuperViz Matterport Comments</h1>
    </header>
    <main className='w-full h-full flex items-center justify-center relative'>
      <iframe id='showcase' className='w-full h-full' />
    </main>
  </div>
);
```

**Explanation:**

- **Viewer Container:** The `showcase` iframe is where the Matterport Viewer will be rendered, filling the entire screen. This is where users will interact with the 3D space and collaborate in real time with contextual comments.

---

### Step 4: Understanding the Project Structure

Here's a quick overview of how the project structure supports adding contextual comments to a Matterport SDK application:

1. **`App.tsx`**
    - Initializes SuperViz.
    - Sets up the Matterport Viewer with real-time commenting features.
    - Handles the loading of 3D spaces and integration of collaborative tools.
2. **Matterport Viewer**
    - Renders the 3D space, allowing users to navigate, inspect, and leave comments in a shared virtual environment.
3. **SuperViz Components**
    - **MatterportPin & Comments:** Enables users to pin comments to specific locations in the 3D model, enhancing collaborative review sessions.

---

### Step 5: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm start
```

This command will start the development server and open your application in the default web browser. You can interact with the 3D space and see real-time comments from other participants.

### 2. Test the Application

- **Contextual Comments:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that comments are updated in real-time.
- **Collaborative Interaction:** Test the commenting feature by adding comments to the 3D model and observing how they appear for other participants.

### Summary

In this tutorial, we integrated contextual comments into a Matterport SDK application using SuperViz. We configured a React application to handle 3D space navigation and commenting, enabling multiple users to collaborate seamlessly within a shared virtual environment. This setup can be extended and customized to fit various scenarios where real-time collaboration on 3D spaces is required.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/matterport-comments) for more details.