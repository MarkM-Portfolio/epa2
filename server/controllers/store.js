const { Store, Product, Service, Notification } = require('../models/model')
const dateTime = require('luxon')

exports.buildStore = async (req, res) => {
    console.log("<<< API POST BUILD STORE >>>")

    try {
        const { id } = req.params
        const { filename } = req.file
        const { name, description, contactnumber, address,
            city, province, zipcode, country } = req.body

        const store = await Store({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: id,
            image: filename,
            country: 'Philippines', // hard code
            ...req.body
         })

         // add to notifications
         const notif = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: id,
            type: 'mynotif',
            message: `Store created ${ name }`,
            image: filename,
            isRead: false,
            tags: 'store'
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await store.save()
        await notif.save()
        return res.status(201).json({ message: 'Store Created!', store })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.editStore = async (req, res) => {
    console.log("<<< API PUT EDIT STORE >>>")

    try {
        const { id } = req.params
        const { name, description, contactnumber, address,
            city, province, zipcode, country } = req.body

        const store = await Store.findByIdAndUpdate(id, {
            updatedAt: dateTime.DateTime.local().toISO(),
            image: req.file ? req.file.filename : req.body.stores,
            ...req.body
        })

        const products = await Product.find({ owner: store.owner })
        const services = await Service.find({ owner: store.owner })

        products.forEach(async item => {
            await Product.findByIdAndUpdate(item._id, {
                store: name
            })
        })

        services.forEach(async item => {
            await Service.findByIdAndUpdate(item._id, {
                store: name
            })
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await store.save()
        return res.status(201).json({ message: 'Store Created!', store })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getStores = async (req, res) => {
    console.log("<<< API GET ALL STORES >>>")
    
    try {
        const stores = await Store.find({}).sort({ createdAt: -1 })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get All Stores Success!', stores })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getStore = async (req, res) => {
    console.log("<<< API GET STORE >>>")

    try {
        const { id } = req.params
        const store = await Store.findOne({ owner: id })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get Store Success!', store })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setFavorites = async (req, res) => {
    console.log("<<< API PUT SET FAVORITES >>>")

    try {
        const { id } = req.params
        const { storeId, favorite } = req.body

        const store = await Store.findOne({ _id: storeId })
        const isFavorite = ( favorite === 'true' ? true : false )

        if(!isFavorite)
            store.favorites.splice(store.favorites.indexOf(id), 1)
        else
            store.favorites.push(id)

        await Store.findByIdAndUpdate(storeId, {
            favorites: store.favorites
        })
      
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: `${ isFavorite ? 'Added' : 'Removed' } favorite.`, store })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}
