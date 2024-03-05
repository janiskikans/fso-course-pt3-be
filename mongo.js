const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('missing password argument. Exiting..')
  process.exit(1)
}

const password = encodeURIComponent(process.argv[2])
const personName = process.argv[3] ?? null
const personNumber = process.argv[4] ?? null

const mongoUri = `mongodb+srv://janiskikans:${password}@cluster0.o8jhfbx.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(mongoUri)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const outputAllPersons = () => {
  Person.find({}).then(persons => {
    console.log('phonebook:')
    persons.forEach(person => console.log(`${person.name} ${person.number}`))
    mongoose.connection.close()
  })
}

const addPerson = async (name, number) => {
  const newPerson = new Person({ name, number })

  await newPerson.save()
  console.log(`added ${name} number ${number} to phonebook`)
  mongoose.connection.close()
}


if (personName && personNumber) {
  addPerson(personName, personNumber)
} else {
  outputAllPersons()
}