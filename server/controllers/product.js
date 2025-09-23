const { Product, Store, Notification } = require('../models/model')
const dateTime = require('luxon')

exports.addProduct = async (req, res) => {
    console.log("<<< API POST ADD PRODUCT >>>")

    try {
        const { id } = req.params
        const { filename } = req.file
        const { name, description, category, price, bonusToken, fees, extra, stocks } = req.body

        if (!price) return res.status(422).json({ error: 'Price is required !' })

        const store = await Store.findOne({ owner: id })

        const product = await Product({ 
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
            message: `${ store.name } added new product ${ product.name }`,
            image: store.image,
            isRead: false,
            tags: 'product'
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await product.save()
        await notif.save()
        return res.status(201).json({ message: 'Product Created!', product })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.editProduct = async (req, res) => {
    console.log("<<< API PUT EDIT PRODUCT >>>")

    try {
        const { id } = req.params
        const { name, description, category, price, bonusToken, fees, extra, stocks } = req.body

        const product = await Product.findByIdAndUpdate(id, {
            updatedAt: dateTime.DateTime.local().toISO(),
            image: req.file ? req.file.filename : req.body.products,
            ...req.body
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Product Changed!', product })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.removeProduct = async (req, res) => {
    console.log("<<< API DELETE PRODUCT >>>")

    try {
        const { itemId } = req.params

        const product = await Product.findByIdAndDelete({ _id: itemId })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Product Deleted.', product })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getProducts = async (req, res) => {
    console.log("<<< API GET ALL PRODUCTS >>>")
    
    try {
        const products = await Product.find({}).sort({ owner: 1 })
        // products.sort(() => Math.random() - 0.5) // enable random

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get All Products Success!', products })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getProduct = async (req, res) => {
    console.log("<<< API GET PRODUCT >>>")

    try {
        const { id } = req.params
        const product = await Product.findOne({ _id: id })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get Product Success!', product })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setRatings = async (req, res) => {
    console.log("<<< API PUT SET RATINGS >>>")

    try {
        const { id } = req.params
        const { productId, ratings } = req.body
        
        const product = await Product.findOne({ _id: productId })
        const filterPrevUserRating = product.ratings.find(item => item.id.includes(id))
        
        if(filterPrevUserRating)
            product.ratings.splice(product.ratings.indexOf(filterPrevUserRating, 1))

        product.ratings.push({ id, ratings })

        await Product.findByIdAndUpdate(productId, {
            ratings: product.ratings
        })
      
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Added rating.', product })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setFavorites = async (req, res) => {
    console.log("<<< API PUT SET FAVORITES >>>")

    try {
        const { id } = req.params
        const { productId, favorite, token } = req.body

        const product = await Product.findOne({ _id: productId })
        const isFavorite = ( favorite === 'true' ? true : false )

        if(!isFavorite)
            product.favorites.splice(product.favorites.indexOf(id), 1)
        else
            product.favorites.push({ id, token })

        await Product.findByIdAndUpdate(productId, {
            favorites: product.favorites
        })
      
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: `${ isFavorite ? 'Added' : 'Removed' } favorite.`, product })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}
