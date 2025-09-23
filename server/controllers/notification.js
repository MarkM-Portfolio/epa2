const { Notification, User, Order } = require('../models/model')
const dateTime = require('luxon')

exports.postNotifs = async (req, res) => {
    console.log("<<< API POST NOTIFICATIONS >>>")

    try {
        const { id } = req.body
        const order = await Order.findOne({ _id: id })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })

        // add to notifications
        for (det in order.details) {
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: order.details[det].owner,
                type: 'mynotif',
                message: `You have new order ${ order.details[det].name } for delivery to ${ order.name }`,
                image: order.details[det].image,
                isRead: false,
                tags: order.details[det].stocks ? 'delivery-product' : 'delivery-service'
            })

            await notif.save()
        }
        return res.status(201).json({ message: 'New Notification!' })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.readNotifs = async (req, res) => {
    console.log("<<< API PUT READ NOTIFICATIONS >>>")

    try {
        // const { id } = req.params
        // const { products, services, price } = req.body

        // const user = await User.findOne({ _id: id })

        // const orderItems = []
        // const productObj = JSON.parse(products)
        // const serviceObj = JSON.parse(services)

        // if (productObj) {
        //     productObj.forEach(item => {
        //         orderItems.push(item)
        //     })
        // }
        
        // if (serviceObj) {
        //     serviceObj.map(item => {
        //         orderItems.push(item)
        //     })
        // }

        // const order = await Order({ 
        //     createdAt: dateTime.DateTime.local().toISO(),
        //     name: user.name,
        //     email: user.email,
        //     mobilenum: user.mobilenum,
        //     shippingAddress: user.shippingAddress,
        //     details: orderItems,
        //     price: price
        // })

        // // Protect API for Internal Use Only
        // if (req.header('X-Api-Key') !== process.env.API_KEY)
        //     return res.status(403).json({ error: 'Forbidden' })
        // await order.save()
        // return res.status(201).json({ message: 'Order Created!', order })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getNotifs = async (req, res) => {
    console.log("<<< API GET ALL NOTIFICATIONS >>>")
    
    try {
        const notifs = await Notification.find({ type: 'seller' }).sort({ createdAt: -1 })

        // // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get All Notifications Success!', notifs })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getNotif = async (req, res) => {
    console.log("<<< API GET NOTIFICATIONS >>>")

    try {
        const { id } = req.params
        const notif = await Notification.find({ owner: id }).sort({ createdAt: -1 })

        // // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get Notifications Success!', notif })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}
