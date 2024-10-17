# Step-by-Step Tutorial: Learn how to add build a multiplayer chess game with react-chessboard and SuperViz

In this tutorial, we will guide you through building a multiplayer chess game using the SuperViz SDK. Multiplayer games require real-time synchronization and interaction between players, making them ideal applications for SuperViz's capabilities. This tutorial will show you how to create a chess game where two players can play against each other in real-time, seeing each other's moves as they happen.

We'll demonstrate how to set up a chessboard using the `react-chessboard` library, manage the game state with `chess.js`, and synchronize player moves with SuperViz. This setup allows multiple participants to join a chess game, make moves, and experience a seamless and interactive chess game environment. Let's get started!

---

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate the SuperViz SDK for multiplayer chess.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest chess-game -- --template react-ts
cd chess-game
```

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/sdk @superviz/realtime react-chessboard chess.js uuid
```

- **@superviz/sdk:** SuperViz SDK for integrating collaborative features into your application.
- **@superviz/realtime:** SuperViz Real-Time library for integrating real-time synchronization into your application.
- **react-chessboard:** A library for rendering a chessboard in React applications.
- **chess.js:** A library for managing chess game logic and rules.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

## Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and handle real-time chess moves.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the collaborative environment.

```tsx
import { v4 as generateId } from "uuid";
import { useCallback, useEffect, useRef, useState } from "react";
import SuperVizRoom, { WhoIsOnline } from "@superviz/sdk";
import {
  Realtime,
  type Channel,
  type RealtimeMessage,
} from "@superviz/realtime/client";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
```

**Explanation:**

- **Imports:** Import necessary components from React, SuperViz SDK, SuperViz Real-Time, `react-chessboard`, `chess.js`, and UUID for managing state, initializing SuperViz, rendering the chessboard, and generating unique identifiers.

### 2. Define Constants

Define constants for the API key, room ID, and player ID.

```tsx
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const ROOM_ID = "chess-game";
const PLAYER_ID = generateId();
```

**Explanation:**

- **apiKey:** Retrieves the SuperViz API key from environment variables.
- **ROOM_ID:** Defines the room ID for the SuperViz session.
- **PLAYER_ID:** Generates a unique player ID using the `uuid` library.

### 3. Define Chess Message Type

Create a type for handling chess move messages.

```tsx
type ChessMessageUpdate = RealtimeMessage<{
  data: {
    sourceSquare: Square;
    targetSquare: Square;
  };
}>;
```

**Explanation:**

- **ChessMessageUpdate:** Instantiates a specialization of the `RealtimeMessage` to define the source and target squares for a chess move.

### 4. Create the App Component

Set up the main `App` component and initialize state variables.

```tsx
export default function App() {
  const initialized = useRef(false);
  const [gameState, setGameState] = useState<Chess>(new Chess());
  const [gameFen, setGameFen] = useState<string>(gameState.fen());

  const channel = useRef<Channel | null>(null);
```

**Explanation:**

- **initialized:** A ref to track whether the SuperViz environment has been set up.
- **gameState:** A state variable to manage the chess game state using the `chess.js` library.
- **gameFen:** A state variable to store the FEN (Forsyth-Edwards Notation) string representing the current game position.
- **channel:** A ref to store the real-time communication channel.

### 5. Initialize SuperViz and Real-Time Components

Create an `initialize` function to set up the SuperViz environment and configure real-time synchronization.

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
      id: "chess-game",
      name: "chess-game",
    },
  });

  const realtime = new Realtime(apiKey, {
    participant: {
      id: PLAYER_ID,
      name: "player-name",
    },
  });
  const whoIsOnline = new WhoIsOnline();

  superviz.addComponent(whoIsOnline);

  channel.current = await realtime.connect("move-topic");

  channel.current.subscribe<ChessMessageUpdate["data"]>(
    "new-move",
    handleRealtimeMessage
  );
}, [handleRealtimeMessage, initialized]);
```

**Explanation:**

- **initialize:** An asynchronous function that initializes the SuperViz room and checks if it's already initialized to prevent duplicate setups.
- **SuperVizRoom:** Configures the room, participant, and group details for the session.
- **Realtime component:** Connects to the `move-topic` channel and listens for new moves, updating the local state accordingly.

### 6. Handle Chess Moves

Create a function to handle chess moves and update the game state.

```tsx
const makeMove = useCallback(
  (sourceSquare: Square, targetSquare: Square) => {
    try {
      const gameCopy = gameState;
      gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: "q" });

      setGameState(gameCopy);
      setGameFen(gameCopy.fen());

      return true;
    } catch (error) {
      console.log("Invalid Move", error);
      return false;
    }
  },
  [gameState]
);
```

**Explanation:**

- **makeMove:** Attempts to make a move on the chessboard, updating the game state and FEN string if the move is valid.
- **Promotion:** Automatically promotes a pawn to a queen if it reaches the last rank.

### 7. Handle Piece Drop

Create a function to handle piece drop events on the chessboard.

```tsx
const onPieceDrop = (sourceSquare: Square, targetSquare: Square) => {
  const result = makeMove(sourceSquare, targetSquare);

  if (result) {
    channel.current.publish("new-move", {
      sourceSquare,
      targetSquare,
    });
  }

  return result;
};
```

**Explanation:**

- **onPieceDrop:** Handles the logic for when a piece is dropped on a new square, making the move and publishing it to the SuperViz channel if valid.

### 8. Handle Real-Time Messages

Create a function to handle incoming real-time messages for moves made by other players.

```tsx
const handleRealtimeMessage = useCallback(
  (message: ChessMessageUpdate) => {
    if (message.participantId === PLAYER_ID) return;

    const { sourceSquare, targetSquare } = message.data;
    makeMove(sourceSquare, targetSquare);
  },
  [makeMove]
);
```

**Explanation:**

- **handleRealtimeMessage:** Listens for incoming move messages and updates the game state if the move was made by another participant.

### 9. Use Effect Hook for Initialization

Use the `useEffect` hook to trigger the `initialize` function on component mount.

```tsx
useEffect(() => {
  initialize();
}, [initialize]);
```

**Explanation:**

- **useEffect:** Calls the `initialize` function once when the component mounts, setting up the SuperViz environment and real-time synchronization.

### 10. Render the Application

Return the JSX structure for rendering the application, including the chessboard and collaboration features.

```tsx
return (
  <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col">
    <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
      <h1 className="text-white text-2xl font-bold">SuperViz Chess Game</h1>
    </header>
    <main className="w-full h-full flex items-center justify-center">
      <div className="w-[500px] h-[500px] shadow-sm border-2 border-gray-300 rounded-md">
        <Chessboard position={gameFen} onPieceDrop={onPieceDrop} />
        <div className="w-[500px] h-[50px] bg-gray-300 flex items-center justify-center">
          <p className="text-gray-800 text-2xl font-bold">
            Turn: {gameState.turn() === "b" ? "Black" : "White"}
          </p>
        </div>
      </div>
    </main>
  </div>
);
```

**Explanation:**

- **Header:** Displays the title of the application.
- **Chessboard:** Renders the chessboard using the `Chessboard` component, with `gameFen` as the position and `onPieceDrop` as the event handler for piece drops.
- **Turn Indicator:** Displays the current player's turn (Black or White).

---

### Step 3: Understanding the Project Structure

Here's a quick overview of how the project structure supports a multiplayer chess game:

1. **`App.tsx`**
   - Initializes the SuperViz environment.
   - Sets up participant information and room details.
   - Handles real-time synchronization for chess moves.
2. **Chessboard**
   - Displays the chessboard and manages piece movements.
   - Integrates real-time communication to synchronize moves between players.
3. **Chess Logic**
   - Uses `chess.js` to manage game rules and validate moves.
   - Updates the game state and FEN string to reflect the current board position.

---

### Step 4: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can interact with the chessboard and see moves in real-time as other participants join the session.

### 2. Test the Application

- **Real-Time Chess Moves:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that moves made by one player are reflected in real-time for others.
- **Collaborative Interaction:** Test the responsiveness of the application by making moves and observing how the game state updates for all participants.

### Summary

In this tutorial, we built a multiplayer chess game using SuperViz for real-time synchronization. We configured a React application to handle chess moves, enabling multiple players to collaborate seamlessly on a shared chessboard. This setup can be extended and customized to fit various scenarios where game interaction are required.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/chess-game) for more details.
