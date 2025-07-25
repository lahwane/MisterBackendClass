import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

export const carService = {
	remove,
	query,
	getById,
	add,
	update,
	addCarMsg,
	removeCarMsg,
}

async function query(filterBy = { txt: '' }) {
	try {
		const criteria = {
			vendor: { $regex: filterBy.txt, $options: 'i' },
		}
		const collection = await dbService.getCollection('car')
		var cars = await collection.find(criteria).toArray()
		return cars
	} catch (err) {
		logger.error('cannot find cars', err)
		throw err
	}
}

async function getById(carId) {
	try {
		const collection = await dbService.getCollection('car')
		const car = await collection.findOne({ _id: ObjectId.createFromHexString(carId) })
		car.createdAt = car._id.getTimestamp()
		return car
	} catch (err) {
		logger.error(`while finding car ${carId}`, err)
		throw err
	}
}

async function remove(carId) {
	try {
		const collection = await dbService.getCollection('car')
		const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(carId) })
        return deletedCount
	} catch (err) {
		logger.error(`cannot remove car ${carId}`, err)
		throw err
	}
}

async function add(car) {
	try {
		const collection = await dbService.getCollection('car')
		await collection.insertOne(car)
		return car
	} catch (err) {
		logger.error('cannot insert car', err)
		throw err
	}
}

async function update(car) {
	try {
		const carToSave = {
			vendor: car.vendor,
			price: car.price,
		}
		const collection = await dbService.getCollection('car')
		await collection.updateOne({ _id: ObjectId.createFromHexString(car._id) }, { $set: carToSave })
		return car
	} catch (err) {
		logger.error(`cannot update car ${car._id}`, err)
		throw err
	}
}

async function addCarMsg(carId, msg) {
	try {
		msg.id = utilService.makeId()
		const collection = await dbService.getCollection('car')
		await collection.updateOne({ _id: ObjectId.createFromHexString(carId) }, { $push: { msgs: msg } })
		return msg
	} catch (err) {
		logger.error(`cannot add car msg ${carId}`, err)
		throw err
	}
}

async function removeCarMsg(carId, msgId) {
	try {
		const collection = await dbService.getCollection('car')
		await collection.updateOne({ _id: ObjectId.createFromHexString(carId) }, { $pull: { msgs: { id: msgId }}})
		return msgId
	} catch (err) {
		logger.error(`cannot add car msg ${carId}`, err)
		throw err
	}
}