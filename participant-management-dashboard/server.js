import process from "node:process"

import express from 'express'
import bodyParser from "body-parser"
import dotenv from "dotenv"
import cors from 'cors'
import axios from 'axios'

dotenv.config()
const app = express()

app.use(bodyParser.json())
app.use(cors())

const superVizHost = 'https://nodeapi.superviz.com'
const clientId = process.env.SUPERVIZ_CLIENT_ID
const clientSecret = process.env.SUPERVIZ_CLIENT_SECRET
const environment = process.env.SUPERVIZ_ENVIRONMENT

const client = axios.create({
  baseURL: superVizHost,
  headers: {
    client_id: clientId,
    secret: clientSecret,
  },
})


app.get('/participants', async (_, res) => {
  try {
    const response = await client.get('/participants', {
      params: {
        environment
      }
    })

    res.json(response.data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/participants', async (req, res) => {
  try {
    const { id, name, email, avatar } = req.body
    const response = await client.post('/participants', {
      participantId: id,
      name,
      email,
      avatar,
      environment
    })

    res.json(response.data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

app.patch('/participants', async (req, res) => {
  try {
    const { id, name, email, avatar } = req.body
    const response = await client.patch('/participants', {
      participantId: id,
      name,
      email,
      avatar,
      environment
    })

    res.json(response.data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/participants', async (req, res) => {
  try {
    const { id } = req.body
    const response = await client.put(`/participants/${id}/archive`, {}, {
      params: {
        environment
      }
    })

    res.json(response.data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/groups' , async (_, res) => {
  try {
    const response = await client.get('/groups', {
      params: {
        environment
      }
    })

    res.json(response.data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

app.patch('/groups', async (req, res) => {
  try {
    const { id, name } = req.body
    const response = await client.put(`/groups/${id}`, {
      name,
      environment
    })

    res.json(response.data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/groups', async (req, res) => {
  try {
    const { id } = req.body
    console.log(id)
    const response = await client.put(`/groups/${id}/archive`, {}, {
      params: {
        environment
      }
    })

    res.json(response.data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

process.on('SIGINT', () => {
  process.exit()
})

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001')
})
