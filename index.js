require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

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

const getPersonById = async (id) => Person.findById(id)
const getPersonByName = async (name) => Person.findOne({ name })

app.get('/info', async (request, response) => {
  const personCount = await Person.countDocuments({})
  const time = new Date()
  
  response.send(`<p>Phonebook has info for ${personCount} people</p><p>${time.toString()}</p>`)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => response.json(persons))
})

app.post('/api/persons', async (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({ error: 'name missing' })
  }

  if (!body.number) {
    return response.status(400).json({ error: 'number missing' })
  }

  const existingPerson = await getPersonByName(body.name)
  if (existingPerson) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then(newPerson => response.json(newPerson))
    .catch(error => next(error))
})

app.get('/api/persons/:id', async (request, response, next) => {
  try {
    const person = await getPersonById(request.params.id)
    if (!person) {
      return response.status(404).end()
    }

    return response.json(person)
  } catch (error) {
    next(error)
  }
})

app.put('/api/persons/:id', async (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({ error: 'name missing' })
  }

  if (!body.number) {
    return response.status(400).json({ error: 'number missing' })
  }

  try {
    updatedPerson = await Person.findByIdAndUpdate(
      request.params.id,
      { number: body.number },
      { new: true, runValidators: true, context: 'query' }
    );

    return response.json(updatedPerson)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/persons/:id', async (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(person => response.status(204).json(person))
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})