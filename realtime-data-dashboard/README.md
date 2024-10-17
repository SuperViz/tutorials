## Step-by-Step Tutorial: Creating a Real-Time Stock Dashboard with SuperViz

This tutorial guides you through setting up the server with Express.js and the frontend with React and SuperViz SDK to create a real-time stock price dashboard.

### **Step 1: Setting Up the Server with Express.js**

The server is responsible for fetching stock data from Yahoo Finance and broadcasting updates to the frontend using SuperViz.

### 1. Create a New Project and Install Dependencies

First, set up a new Node.js project and install the necessary packages for the server.

```bash
mkdir realtime-dashboard-server
cd realtime-dashboard-server
npm init -y
npm install express body-parser dotenv cors yahoo-finance2 node-fetch
```

**Explanation:**

- **express:** A web application framework for setting up the server.
- **body-parser:** Middleware to parse incoming JSON request bodies.
- **dotenv:** Loads environment variables from a `.env` file.
- **cors:** Middleware to enable Cross-Origin Resource Sharing.
- **yahoo-finance2:** Library for fetching stock data from Yahoo Finance.
- **node-fetch:** Fetch API for making HTTP requests.

### 2. Set Up the Express Server

Create a file named `server.js` and configure the server.

```jsx
// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import yahooFinance from "yahoo-finance2";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const subscriptions = [];
```

**Explanation:**

- **Express App:** Create an Express application to handle requests.
- **Middlewares:** Use `bodyParser` for JSON parsing and `cors` for handling cross-origin requests.
- **Subscriptions:** An array to store active stock subscriptions, identified by room IDs.

### 3. Subscribe to Stock Updates

Define an endpoint to subscribe to stock updates.

```js
app.get("/subscribe", async (req, res) => {
  console.log(req.query);

  if (!req.query.symbol) {
    return res.status(400).json({ error: "Missing symbol" });
  }

  try {
    const response = await yahooFinance.quote(req.query.symbol);

    if (!response) {
      return res.status(404).json({ error: "Symbol not found" });
    }

    subscriptions.push({
      roomId: req.query.roomId,
      symbol: req.query.symbol,
    });

    return res.json({
      symbol: response.symbol,
      name: response.shortName,
      price: response.regularMarketPrice,
      change: response.regularMarketChange,
      changePercent: response.regularMarketChangePercent,
      high: response.regularMarketDayHigh,
      low: response.regularMarketDayLow,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
});
```

**Explanation:**

- **Subscribe Endpoint:** A `/subscribe` endpoint allows clients to subscribe to stock updates by providing a `symbol` and `roomId`.
- **Yahoo Finance API:** The `yahooFinance.quote` method fetches the stock data using the provided symbol.
- **Response Data:** If the stock is found, it adds a subscription and returns detailed stock data.

### 4. Unsubscribe from Stock Updates

Provide a way to unsubscribe from stock updates.

```js
app.get("/unsubscribe", (req, res) => {
  if (!req.query.roomId) {
    return res.status(400).json({ error: "Missing roomId" });
  }

  if (!req.query.symbol) {
    return res.status(400).json({ error: "Missing symbol" });
  }

  const index = subscriptions.findIndex(
    (subscription) =>
      subscription.roomId === req.query.roomId &&
      subscription.symbol === req.query.symbol
  );
  if (index === -1) {
    return res.status(404).json({ error: "Subscription not found" });
  }

  subscriptions.splice(index, 1);
  return res.json({ message: "Subscription removed" });
});
```

**Explanation:**

- **Unsubscribe Endpoint:** A `/unsubscribe` endpoint allows clients to remove subscriptions by `roomId`.
- **Find Subscription:** It locates the subscription using the `roomId` and removes it if found.

### 5. Send Stock Updates to SuperViz

Use a timed interval to fetch stock updates and broadcast them using the SuperViz API.

```jsx
const interval = setInterval(async () => {
  for (const subscription of subscriptions) {
    try {
      const stock = await yahooFinance.quote(subscription.symbol);

      if (!stock) return;

      const data = {
        symbol: stock.symbol,
        name: stock.shortName,
        price: stock.regularMarketPrice,
        change: stock.regularMarketChange,
        changePercent: stock.regularMarketChangePercent,
        high: stock.regularMarketDayHigh,
        low: stock.regularMarketDayLow,
        updatedAt: new Date().toISOString(),
      };
      const channelId = "stock-price";

      const response = await fetch(
        `https://nodeapi.superviz.com/realtime/${channelId}/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            secret: process.env.VITE_SUPERVIZ_SECRET_KEY,
            client_id: process.env.VITE_SUPERVIZ_CLIENT_ID,
          },
          body: JSON.stringify({
            name: "stock-update",
            data,
          }),
        }
      );

      console.log(
        `Sending data to ${channelId}, stock: ${stock.symbol}`,
        response.status
      );
    } catch (error) {
      console.error(error);
    }
  }
}, 2000);
```

**Explanation:**

- **Interval:** Every 2 seconds, fetch stock updates for all subscriptions.
- **SuperViz API:** Send stock data to SuperViz's real-time API, using the `channelId` to target specific clients.

### 6. Start the Server

Launch the server to listen for requests.

```jsx
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
```

**Explanation:**

- **Server Listening:** The server listens on port 3000 and logs a confirmation message when it's running.

### **Step 2: Setting Up the Frontend with React**

The frontend uses React to display real-time stock updates, connecting to the SuperViz SDK for collaboration features.

### 1. Create a New React Project

Initialize a new React application using Create React App with TypeScript.

```bash
npm create vite@latest
cd realtime-dashboard-frontend
```

### 2. Install SuperViz Real-Time

Add the SuperViz Real-Time component and other necessary packages.

```bash
npm install @superviz/realtime luxon uuid
```

**Explanation:**

- **@superviz/realtime:** SuperViz Real-Time library for integrating real-time synchronization into your application.
- **luxon:** DateTime library for formatting dates.
- **uuid:** Library for generating unique identifiers.

### 3. Set Up Environment Variables

Create a `.env` file in the frontend directory and add the SuperViz API key, and the secret key and client id you've created in our dashboard.

```
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_API_KEY
VITE_SUPERVIZ_CLIENT_ID=YOUR_SUPERVIZ_CLIENT_ID
VITE_SUPERVIZ_SECRET_KEY=YOUR_SUPERVIZ_SECRET_KEY
```

**Explanation:**

- **Environment Variables:** Store your keys securely using `.env` and access it through `import.meta.env`.

### 4. Define Common Types

Create a directory `src/common` and add a `types.ts` file to define types used across the application.

```tsx
typescriptCopy code
// src/common/types.ts
export type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  updatedAt: string;
};

```

**Explanation:**

- **Stock Type:** Defines the structure for stock data, ensuring consistent use throughout the application.

### 5. Implement the Main App Component

Open `src/App.tsx` and set up the main component to handle user interactions and display stock data.

```tsx
import { v4 as generateId } from "uuid";
import { useCallback, useEffect, useState } from "react";
import { Realtime } from "@superviz/realtime/client";
import { Stock } from "./common/types";
import { StockPrice } from "./components/stock-price";

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;

export default function App() {
  const [stock, setStock] = useState("AAPL");
  const [stockList, setStockList] = useState<Stock[]>([]);

  const subscribeToStock = useCallback(async () => {
    const params = {
      roomId: ROOM_ID,
      symbol: stock,
    };

    const url = new URL("http://localhost:3000/subscribe");
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data || stockList.includes(data.symbol)) return;

    setStockList((prev) => [...prev, data]);
  }, [stock, stockList]);
}
```

**Explanation:**

- **State Management:** `stock` holds the input symbol, while `stockList` maintains the list of subscribed stocks.
- **Subscribe Function:** Constructs a URL with query parameters and fetches stock data from the server. Updates the state if the stock isn't already subscribed.

### 6. Initialize SuperViz for Real-Time Collaboration

Add the initialization logic to connect to the SuperViz SDK.

```tsx
const initialize = useCallback(async () => {
  const realtime = new Realtime(apiKey, {
    participant: {
      id: generateId(),
      name: "participant-name",
    },
  });

  const channel = await realtime.connect("stock-price");
  channel.subscribe("stock-update", (data) => {
    console.log("New channel event", data);

    if (typeof data === "string") return;

    setStockList((prev) => {
      return prev.map((stock) => {
        const newStock = data.data as Stock;

        if (stock.symbol === newStock?.symbol) {
          return newStock;
        }

          return stock;
          return stock;
        });
        return stock;
        });
      });
    });
  });
}, []);
```

**Explanation:**

- **SuperViz Initialization:** Connects to the SuperViz room using an API key and room details. Adds the Realtime component to handle real-time events.
- **Realtime Subscription:** Subscribes to `stock-update` events, updating the stock list with new data.

### 7. Render the UI Components

Finish the `App` component by rendering the user interface.

```tsx
return (
  <div className="w-full h-full bg-gray-200 flex flex-col">
    <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
      <div>
        <h1 className="text-white text-2xl font-bold">
          Realtime Data Dashboard
        </h1>
      </div>
      <div>
        <input
          type="text"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="p-2 border border-gray-400 rounded-md focus:outline-none focus:border-purple-400"
        />
        <button
          onClick={subscribeToStock}
          className="p-2 bg-purple-500 text-white rounded-md ml-2 focus:outline-none"
        >
          Subscribe
        </button>
      </div>
    </header>
    <main className="p-20 px-40 flex gap-2 flex-wrap">
      {stockList.map((stock) => (
        <StockPrice key={stock.symbol} stock={stock} />
      ))}
    </main>
  </div>
);
```

**Explanation:**

- **UI Structure:** The UI contains an input for stock symbols and a subscribe button. The `StockPrice` component is used to display each stock's details.
- **State Updates:** The `onChange` event updates the stock input, while clicking the button triggers the subscription logic.

### 8. Implement the StockPrice Component

Create a `src/components` directory and add a `stock-price.tsx` file to define how each stock is displayed.

```tsx
// src/components/stock-price.tsx
import { Stock } from "../common/types";
import { DateTime } from "luxon";

type Props = {
  stock: Stock;
};

export function StockPrice({ stock }: Props) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDateTime = (date: string) => {
    return DateTime.fromISO(date).toFormat("DD HH:mm:ss");
  };

  return (
    <div className="p-6 border border-solid border-gray-300 bg-white min-w-40 rounded-xl h-fit shadow-md">
      <h1>{stock.name}</h1>
      <p>{stock.symbol}</p>
      <p>Current Price: {formatPrice(stock.price)}</p>
      <p>Lower Price: {formatPrice(stock.low)}</p>
      <p>Higher Price: {formatPrice(stock.high)}</p>
      <p>Updated At: {formatDateTime(stock.updatedAt)}</p>
    </div>
  );
}
```

**Explanation:**

- **StockPrice Component:** Displays detailed stock information, including the name, symbol, current price, low/high prices, and updated timestamp.
- **Formatting Functions:** `formatPrice` and `formatDateTime` ensure the prices and dates are displayed in a user-friendly format.

### Step 3: Running the Application

To start the application, run this command in the terminal:

```bash
npm run dev
```

This command will start both the server and the frontend application.

You can access the frontend application at `http://localhost:5173` and the server at `http://localhost:3000`.

### Summary

In this tutorial, we've built a real-time stock dashboard using SuperViz, Express.js, and React. The server fetches stock data from Yahoo Finance and sends updates to subscribed clients using SuperViz's real-time API. The frontend subscribes to stock updates, displaying them in a responsive UI. By following these steps, you can customize the dashboard to track different stocks, add more features, and deploy it to a production environment.

Feel free to refer to the full code in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/realtime-data-dashboard) for more details.
