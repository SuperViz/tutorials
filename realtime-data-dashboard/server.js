import process from "node:process"

import express from 'express'
import bodyParser from "body-parser"
import dotenv from "dotenv"
import cors from 'cors'

import yahooFinance from "yahoo-finance2"


dotenv.config()
const app = express()

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send(JSON.stringify({
    uptime: process.uptime(),
  }))
})

const subscriptions = []

app.get('/subscribe', async (req, res) => {
  console.log(req.query)

  if(!req.query.symbol) {
    return res.status(400).json({ error: 'Missing symbol' })
  }

  try {
    const response = await yahooFinance.quote(req.query.symbol)

    if(!response) {
      return res.status(404).json({ error: 'Symbol not found' })
    }

    subscriptions.push({ 
      roomId: req.query.roomId, 
      symbol: req.query.symbol 
    })
  
    return res.json({
      symbol: response.symbol,
      name: response.shortName,
      price: response.regularMarketPrice,
      change: response.regularMarketChange,
      changePercent: response.regularMarketChangePercent,
      high: response.regularMarketDayHigh,
      low: response.regularMarketDayLow,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    return res.status(500).json({ error: error.toString() })    
  }
})


app.get('/unsubscribe', (req, res) => {
  if(!req.query.roomId) {
    return res.status(400).json({ error: 'Missing roomId' })
  }

  const index = subscriptions.findIndex(subscription => subscription.channelId === req.query.channelId)
  if(index === -1) {
    return res.status(404).json({ error: 'Subscription not found' })
  }

  subscriptions.splice(index, 1)
  return res.json({ message: 'Subscription removed' })
})

const interval = setInterval(async () => {
  for(const subscription of subscriptions) {
    try {
      const stock = await yahooFinance.quote(subscription.symbol)

      if(!stock) return

      const data = {
        symbol: stock.symbol,
        name: stock.shortName,
        price: stock.regularMarketPrice,
        change: stock.regularMarketChange,
        changePercent: stock.regularMarketChangePercent,
        high: stock.regularMarketDayHigh,
        low: stock.regularMarketDayLow,
        updatedAt: new Date().toISOString(),
      }
      const channelId = 'stock-price'
      const roomId = subscription.roomId

      const response = await fetch(`https://nodeapi.superviz.com/realtime/${roomId}/${channelId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apiKey': process.env.VITE_SUPERVIZ_API_KEY,
        },
        body: JSON.stringify({
          name: 'stock-update',
          data,
        })
      })

      console.log(`Sending data to ${channelId}, stock: ${stock.symbol}`, response.status)
    } catch (error) {
      console.error(error)
    }
  }
}, 2000)

process.on('SIGINT', () => {
  clearInterval(interval)
  process.exit()
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})