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
        });
      });
    });
  }, []);

  useEffect(() => {
    initialize();
  });

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
}
