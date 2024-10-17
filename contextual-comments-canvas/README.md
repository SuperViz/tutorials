# Step-by-Step Tutorial: How to Add a Contextual Comments Feature into a Canvas-Based Web Application

In this tutorial, we will guide you through integrating a contextual comments feature into a canvas-based web application using the SuperViz React SDK. Contextual comments are a powerful tool for collaborative applications, allowing users to annotate specific areas of a canvas. This feature is especially useful for design, brainstorming, and feedback applications where users need to discuss particular elements of a shared visual space.

We'll demonstrate how to use the SuperViz SDK to implement a contextual comments system in a React application with a canvas element. This setup will enable multiple users to add comments to different areas of the canvas, facilitating real-time collaboration and feedback.

By the end of this tutorial, you'll have a fully functional application with contextual comments, which you can extend and customize to fit your specific needs. Let's get started!

---

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate the SuperViz SDK for contextual comments.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest contextual-comments-canvas -- --template react-ts
cd contextual-comments-canvas
```

### 2. Install SuperViz React SDK

Next, install the SuperViz React SDK, which will enable us to add real-time contextual comments to our application.

```bash
npm install @superviz/react-sdk uuid
```

- **@superviz/react-sdk:** SDK for integrating real-time collaboration features, including contextual comments.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

## Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and handle contextual comments on a canvas.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using the `SuperVizRoomProvider` to manage the collaborative environment.

```tsx
import { SuperVizRoomProvider } from "@superviz/react-sdk";
import { v4 as generateId } from "uuid";
import Room from "./Room";

const developerKey = import.meta.env.VITE_SUPERVIZ_API_KEY;
const participantId = generateId();

export default function App() {
  return (
    <SuperVizRoomProvider
      developerKey={developerKey}
      group={{
        id: "contextual-comments",
        name: "contextual-comments",
      }}
      participant={{
        id: participantId,
        name: "Participant",
      }}
      roomId="contextual-comments"
    >
      <Room />
    </SuperVizRoomProvider>
  );
}
```

**Explanation:**

- **SuperVizRoomProvider:** This component wraps the application to enable real-time features and provides configuration for group and participant details.
- **developerKey:** Retrieves the developer key from environment variables to authenticate with SuperViz.
- **participantId:** Generates a unique ID for each participant using the `uuid` library.
- **Room Component:** Contains the logic for rendering the canvas and handling contextual comments.

---

## Step 3: Implement the Room Component

The Room component will be responsible for integrating the canvas with SuperViz, allowing users to add contextual comments in real-time.

### 1. Create Room Component

Create a new file named `src/Room.tsx` and add the following implementation:

```tsx
import { useCanvasPin, useComments, Comments } from "@superviz/react-sdk";

export default function Room() {
  const { openThreads, closeThreads } = useComments();
  const { pin } = useCanvasPin({ canvasId: "canvas" });

  return (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col">
      <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">
          SuperViz Contextual Comments
        </h1>
        <div id="comments" className="flex gap-2"></div>
      </header>
      <main className="flex-1 w-full h-full">
        <div className="w-full h-full">
          <canvas id="canvas" className="w-full h-full"></canvas>
        </div>

        {/* SuperViz */}
        <Comments
          pin={pin}
          position="left"
          buttonLocation="comments"
          onPinActive={openThreads}
          onPinInactive={closeThreads}
        />
      </main>
    </div>
  );
}
```

**Explanation:**

- **useCanvasPin Hook:** Sets up pinning functionality on the canvas, allowing users to attach comments to specific areas.
  - **canvasId:** The ID of the canvas element where pins will be enabled.
- **useComments Hook:** Provides functions to open and close comment threads.
- **Comments Component:** Displays comments related to the pinned areas on the canvas, enabling real-time feedback and collaboration.
  - **pin:** Provides the ability to pin comments to specific elements.
  - **position:** Sets the position of the comment section.
  - **buttonLocation:** Specifies where the button to access comments will be located.
  - **onPinActive / onPinInactive:** Callbacks to handle comment thread actions.

---

### Step 4: Understanding the Project Structure

Here's a quick overview of how the project structure supports contextual comments:

1. **`App.tsx`**
   - Initializes the SuperViz environment.
   - Sets up participant information and room details.
   - Renders the `Room` component within the `SuperVizRoomProvider`.
2. **`Room.tsx`**
   - Contains the main UI elements, including the canvas.
   - Integrates the `Comments` component to show real-time comments pinned to specific canvas areas.

---

## Step 5: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can interact with the canvas and add comments in real-time as other participants join the session.

### 2. Test the Application

- **Contextual Comments:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that comments can be added and viewed in real-time.
- **Collaborative Interaction:** Test the responsiveness of the application by placing comments on different areas of the canvas and observing how they appear for other participants.

### Summary

In this tutorial, we implemented a contextual comments feature in a canvas-based web application using SuperViz and React. We configured a React application to allow users to add comments to specific areas of a shared canvas, enabling seamless collaboration and interaction. This setup can be extended and customized to fit various scenarios where real-time feedback and collaboration are required.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/contextual-comments-canvas) for more details.
