const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', function (req, res) { return JSON.stringify(req.body)})
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens['body'](req, res),
  ].join(' ')
}))

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

const getPersonById = id => persons.find(person => person.id === id)
const getPersonByName = name => persons.find(person => person.name === name)

const generateId = () => {
  const minCeiled = Math.ceil(1)
  const maxFloored = Math.floor(100_000)

  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

app.get('/info', (request, response) => {
  const personCount = persons.length
  const time = new Date()

  response.send(`<p>Phonebook has info for ${personCount} people</p><p>${time.toString()}</p>`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ error: 'name missing' })
  }

  if (!body.number) {
    return response.status(400).json({ error: 'number missing' })
  }

  const existingPerson = getPersonByName(body.name)
  if (existingPerson) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  const person = getPersonById(id)
  if (!person) {
    return response.status(404).end()
  }

  return response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  const person = getPersonById(id)
  if (!person) {
    return response.status(404).end()
  }

  persons = persons.filter(person => person.id !== id)
  response.status(204).json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})