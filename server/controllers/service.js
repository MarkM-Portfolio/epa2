const { Service, Store, Notification } = require('../models/model')
const dateTime = require('luxon')

exports.addService = async (req, res) => {
    console.log("<<< API POST ADD SERVICE >>>")

    try {
        const { id } = req.params
        const { filename } = req.file
        const { name, description, category, price, bonusToken, fees, extra, rate } = req.body  

        const store = await Store.findOne({ owner: id })

        const service = await Service({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: id,
            store: store.name,
            image: filename,
            ratings: [],
            globalRating: '0.0',
            quantity: 1,
            ...req.body
        })

        // add to notifications
        const notif = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: id,
            type: 'seller',
            message: `${ store.name } added new service ${ service.name }`,
            image: store.image,
            isRead: false,
            tags: 'service'
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await service.save()
        await notif.save()
        return res.status(201).json({ message: 'Service Created!', service })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.editService = async (req, res) => {
    console.log("<<< API PUT EDIT SERVICE >>>")

    try {
        const { id } = req.params
        const { name, description, category, price, bonusToken, fees, extra, rate } = req.body

        if (!price) return res.status(422).json({ error: 'Price is required !' })

        const service = await Service.findByIdAndUpdate(id, {
            updatedAt: dateTime.DateTime.local().toISO(),
            image: req.file ? req.file.filename : req.body.services,
            ratings: [],
            globalRating: '0.0',
            ...req.body
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Service Changed!', service })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.removeService = async (req, res) => {
    console.log("<<< API DELETE SERVICE >>>")

    try {
        const { itemId } = req.params

        const service = await Service.findByIdAndDelete({ _id: itemId })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Service Deleted.', service })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getServices = async (req, res) => {
    console.log("<<< API GET ALL SERVICES >>>")
    
    try {
        const services = await Service.find({}).sort({ owner: 1 })
        // services.sort(() => Math.random() - 0.5) // enable random

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get All Services Success!', services })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getService = async (req, res) => {
    console.log("<<< API GET SERVICE >>>")

    try {
        const { id } = req.params
        const service = await Service.findOne({ _id: id })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: ' Forbidden' })
        return res.status(200).json({ message: 'Get Service Success!', service })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setRatings = async (req, res) => {
    console.log("<<< API PUT SET RATINGS >>>")

    try {
        const { id } = req.params
        const { serviceId, ratings } = req.body
        
        const service = await Service.findOne({ _id: serviceId })
        const filterPrevUserRating = service.ratings.find(item => item.id.includes(id))
        
        if(filterPrevUserRating)
            service.ratings.splice(service.ratings.indexOf(filterPrevUserRating, 1))

        service.ratings.push({ id, ratings })

        await Service.findByIdAndUpdate(serviceId, {
            ratings: service.ratings
        })
      
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Added rating.', service })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setFavorites = async (req, res) => {
    console.log("<<< API PUT SET FAVORITES >>>")

    try {
        const { id } = req.params
        const { serviceId, favorite, token } = req.body

        const service = await Service.findOne({ _id: serviceId })
        const isFavorite = ( favorite === 'true' ? true : false )

        if(!isFavorite)
            service.favorites.splice(service.favorites.indexOf(id), 1)
        else
            service.favorites.push({ id, token })

        await Service.findByIdAndUpdate(serviceId, {
            favorites: service.favorites
        })
      
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: `${ isFavorite ? 'Added' : 'Removed' } favorite.`, service })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}