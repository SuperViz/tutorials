# Step-by-Step Tutorial: Build real-time collaboration features into Three.js

In this tutorial, we will guide you through integrating a "Who-Is-Online" feature into your JavaScript application using SuperViz. This feature allows users to see who else is currently online in a shared session, which is especially useful for collaborative tools, virtual events, and social platforms.

We'll demonstrate how to set up a simple React application that uses SuperViz to display the list of online participants. By the end of this tutorial, you'll have a fully functional "Who-Is-Online" feature that you can extend and customize to meet your specific needs.

Let's get started!

---

### Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate SuperViz for the "Who-Is-Online" feature.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest who-is-online -- --template react-ts
cd who-is-online
```

Vite is a modern build tool that provides a faster and more efficient development experience compared to Create React App. It also supports TypeScript out of the box.

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/sdk uuid
```

- **@superviz/sdk:** For integrating real-time collaboration features.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

### Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and display the "Who-Is-Online" feature.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the online participants list.

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import SuperVizRoom, { LauncherFacade, WhoIsOnline } from '@superviz/sdk';
import { v4 as generateId } from 'uuid';
```

**Explanation:**

- **Imports:** Import necessary components from React, SuperViz, and UUID for managing state, initializing SuperViz, and displaying the online participants.

### 2. Define Constants

Define constants for the API key, room ID, and participant ID.

```tsx
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const ROOM_ID = 'who-is-online';
```

**Explanation:**

- **apiKey:** Retrieves the SuperViz API key from environment variables.
- **ROOM_ID:** Defines the room ID for the SuperViz session.

### 3. Create the App Component

Set up the main `App` component and initialize the "Who-Is-Online" feature.

```tsx
export default function App() {
  const [initialized, setInitialized] = useState(false);
  const superviz = useRef<LauncherFacade | null>(null);
```

**Explanation:**

- **useState & useRef:** Manages the initialization state and stores the SuperViz instance.

### 4. Initialize SuperViz

Create a function to initialize SuperViz and set up the "Who-Is-Online" feature.

```tsx
const initialize = useCallback(async () => {
  if(initialized) return;

  superviz.current = await SuperVizRoom(apiKey, {
    roomId: ROOM_ID,
    participant: {
      id: generateId(),
      name: 'participant-name',
    },
    group: {
      id: 'who-is-online',
      name: 'who-is-online',
    }
  });

  const whoIsOnline = new WhoIsOnline({
    position: 'who-is-online',
    disablePresenceControls: true,
  });

  superviz.current.addComponent(whoIsOnline);

  setInitialized(true);
}, [initialized]);
```

**Explanation:**

- **initialize:** Initializes SuperViz, sets up the real-time component, and adds the "Who-Is-Online" feature to the application.
- **WhoIsOnline:** Displays the list of participants currently online in the session, positioned within the specified HTML element.

### 5. Use Effect Hook for Initialization

Use the `useEffect` hook to trigger the `initialize` function on component mount and handle cleanup when the component is unmounted.

```tsx
useEffect(() => {
  initialize();

  return () => {
    superviz.current?.destroy();
  }
}, []);
```

**Explanation:**

- **useEffect:** Calls the `initialize` function once when the component mounts and cleans up the SuperViz instance when the component unmounts.

---

### Step 3: Render the Who-Is-Online Interface

Finally, return the JSX structure for rendering the "Who-Is-Online" interface.

```tsx
return (
  <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
    <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
      <h1 className='text-white text-2xl font-bold'>Who is Online</h1>
    </header>
    <main className='flex-1 p-20 flex w-full gap-2 items-center justify-center'>
      <div id="who-is-online"></div>
    </main>
  </div>
);
```

**Explanation:**

- **Viewer Container:** The `who-is-online` div is where the online participants list will be rendered. This is where users will see who else is online in the session.

---

### Step 4: Understanding the Project Structure

Here's a quick overview of how the project structure supports the "Who-Is-Online" feature in a JavaScript application:

1. **`App.tsx`**
    - Initializes SuperViz and sets up the "Who-Is-Online" feature.
    - Handles real-time updates of online participants.
2. **Who-Is-Online Interface**
    - Displays a list of participants currently online in the session.
    - Updates dynamically as participants join or leave the session.
3. **Real-Time Communication**
    - Manages real-time communication between participants using SuperViz.

---

### Step 5: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm start
```

This command will start the development server and open your application in the default web browser. You can see who else is online in real-time as other participants join.

### 2. Test the Application

- **Who-Is-Online Feature:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that the list of online users updates in real-time.
- **Collaborative Interaction:** Test the responsiveness of the application by observing how the online participants list changes as users join and leave the session.

### Summary

In this tutorial, we built a "Who-Is-Online" feature using SuperViz. We configured a React application to handle real-time updates of online participants, enabling multiple users to see who else is in the session. This setup can be extended and customized to fit various scenarios where real-time presence information is essential.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/who-is-online) for more details.