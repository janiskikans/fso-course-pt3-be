const mongoose = require('mongoose')

const dbUri = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
console.log('connecting to', dbUri)

mongoose
	.connect(dbUri)
	.then(() => {
		console.log('connected to MongoDB')
	})
	.catch(error => {
		console.log('error connecting to MongoDB:', error.message)
	});

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)