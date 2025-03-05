# Step-by-Step Tutorial: How to implement real-time mouse pointers into a web-application using SuperViz React SDK

In this tutorial, we will guide you through adding [real-time mouse pointers](https://docs.superviz.com/react-sdk/presence/mouse-pointers) to a web application using the SuperViz React SDK. Real-time mouse pointers are essential for collaborative applications, allowing users to see each other's cursor movements and interactions on a shared screen. This feature enhances communication and collaboration, making it easier for participants to follow along with each other's actions.

We'll demonstrate how to use SuperViz to implement real-time mouse pointers in a React application. Although we'll use a `<canvas>` element for rendering shared content, the real-time mouse pointers component is versatile and can be used with other HTML elements as well. This flexibility allows developers to integrate real-time pointers in a variety of web application contexts, providing a dynamic and interactive experience similar to collaborative platforms like Google Docs or Figma. Let's get started!

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate the SuperViz SDK for real-time mouse pointers.

### 1. Create a New React Project

First, create a new React application using Create React App with TypeScript.

```bash
npm create vite@latest mouse-pointers-demo -- --template react-ts
cd mouse-pointers-demo
```

### 2. Install SuperViz SDK

Next, install SuperViz, which will enable us to add real-time mouse pointer features to our application.

```bash
npm install @superviz/react-sdk uuid
```

- **@superviz/react-sdk:** SDK for integrating real-time collaboration features, including mouse pointers.
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

Then we need to add the tailwind directives to the global CSS file the `src/index.css`.

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

## Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and handle real-time mouse pointers.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using the `SuperVizRoomProvider` to manage the collaborative environment.

```typescript
import { SuperVizRoomProvider } from '@superviz/react-sdk'
import { v4 as generateId } from 'uuid'
import Room from './Room'

const developerKey = import.meta.env.VITE_SUPERVIZ_API_KEY;
const participantId = generateId()

export default function App() {
  return (
    <SuperVizRoomProvider
      developerKey={developerKey}
      group={{
        id: 'realtime-mouse-pointers',
        name: 'realtime-mouse-pointers',
      }}
      participant={{
        id: participantId,
        name: 'Participant',
      }}
      roomId='realtime-mouse-pointers'
    >
      <Room />
    </SuperVizRoomProvider>
  )
}
```

**Explanation:**

- **SuperVizRoomProvider:** This component wraps the application to enable real-time features and provides configuration for group and participant details.
- **developerKey:** Retrieves the developer key from environment variables to authenticate with SuperViz.
- **participantId:** Generates a unique ID for each participant using the `uuid` library.
- **Room Component:** Contains the logic for rendering the canvas and handling mouse pointers.

### 2. Implement the Room Component

Create a new file named `src/Room.tsx` and add the following implementation:

```typescript
import { MousePointers } from "@superviz/react-sdk";

export default function Room() {
  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h2 className='text-white text-2xl font-bold'>SuperViz Real-Time Mouse Pointers</h2>
      </header>
      <main className='flex-1 w-full h-full'>
        <div className='w-full h-full'>
          <canvas id="canvas" className='w-full h-full'></canvas>
        </div>

        <MousePointers elementId="canvas" />
      </main>
    </div>
  )
}
```

**Explanation:**

- **MousePointers Component:** Displays the real-time location of each participant's mouse cursor on the canvas, allowing users to see where others are interacting.
- **elementId:** Specifies the ID of the element (canvas) where the mouse pointers will be shown. The component can also be used with other HTML elements such as `div` or `svg`, offering flexibility in its application.
- **Canvas Element:** A `<canvas>` element is used to render the shared content, with an ID that matches the `elementId` specified in `MousePointers`.

---

## Step 3: Understanding the Project Structure

Here's a quick overview of how the project structure supports real-time mouse pointers:

1. **`App.tsx`**
   - Initializes the SuperViz environment.
   - Sets up participant information and room details.
   - Renders the `Room` component within the `SuperVizRoomProvider`.
2. **`Room.tsx`**
   - Contains the main UI elements, including the canvas.
   - Integrates the `MousePointers` component to show real-time cursor movements.

---

## Step 4: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can interact with the canvas and see mouse pointers in real-time as other participants join the session.

### 2. Test the Application

- **Real-Time Mouse Pointers:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that mouse movements are displayed in real-time for all users.
- **Collaborative Interaction:** Test the responsiveness of the application by moving the mouse around the canvas and observing the pointers of other participants.

## Summary

In this tutorial, we implemented real-time mouse pointers in a web application using SuperViz and React. We configured a React application to display mouse pointers for all participants, enabling seamless collaboration and interaction. This setup can be extended and customized to fit various scenarios where real-time collaboration and visual feedback are required.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/mouse-pointers) for more details.
