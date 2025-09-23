const { Order, User, Load, Transaction, Setting } = require('../models/model')
const dateTime = require('luxon')
const gpc = require('generate-pincode')

exports.setOrder = async (req, res) => {
    console.log("<<< API POST SET ORDER >>>")

    try {
        const { id } = req.params
        const { products, services, price, validChildrenCount } = req.body

        const user = await User.findOne({ _id: id })
        const settings = await Setting.findOne({})

        if (String(user._id) === process.env.EPA_ACCT_ID)
            return res.status(422).json({ error: 'EPA Main Account is not allowed to buy !' })

        if (user.class === 'Member')
            return res.status(422).json({ error: 'Currently in "Member" subscription. Purchase Now !' })

        if (Number(validChildrenCount) < settings.allowanceJBA)
            return res.status(422).json({ error: 'Not qualified number of business associates.' })

        let percentCredit = 1, percentCash = 0

        if (user.class === 'Entrepreneur') {
            percentCredit -= settings.entrepPercentCash
            percentCash = settings.entrepPercentCash
        }
        if (user.class === 'Supervisor') {
            percentCredit -= settings.supervPercentCash 
            percentCash = settings.supervPercentCash
        }
        if (user.class === 'Manager') {
            percentCredit -= settings.managerPercentCash 
            percentCash = settings.managerPercentCash
        }
        if (user.class === 'CEO') {
            percentCredit -= settings.ceoPercentCash 
            percentCash = settings.ceoPercentCash
        }
        if (user.class === 'Business Empire') {
            percentCredit -= settings.businessPercentCash 
            percentCash = settings.businessPercentCash
        }
        if (user.class === 'Silver' && user.rank === 'Manager') {
            percentCredit -= settings.silverPercentCash 
            percentCash = settings.silverPercentCash
        }
        if (user.class === 'Gold') {
            percentCredit -= settings.goldPercentCash 
            percentCash = settings.goldPercentCash
        }

        console.log('% Credit: ', percentCredit)
        console.log('% Cash: ', percentCash)

        if (parseFloat(user.epacash) < parseFloat(price) * percentCash)
            return res.status(422).json({ error: 'Not enough EPA Cash.' })
        // if (parseFloat(user.epavault) <= 0)
        //     return res.status(422).json({ error: 'Not enough balance.' })

        const orderItems = []
        const productObj = JSON.parse(products)
        const serviceObj = JSON.parse(services)

        if (productObj) {
            productObj.forEach(item => {
                item.isConfirmed = false,
                item.isShipped = false,
                item.isCancelled = false,
                item.isReceived = false,
                orderItems.push(item)
            })
        }
        
        if (serviceObj) {
            serviceObj.map(item => {
                item.isConfirmed = false,
                item.isShipped = false,
                item.isCancelled = false,
                item.isReceived = false,
                orderItems.push(item)
            })
        }

        const order = await Order({ 
            createdAt: dateTime.DateTime.local().toISO(),
            name: user.name,
            email: user.email,
            mobilenum: user.mobilenum,
            shippingAddress: user.shippingAddress,
            details: orderItems,
            price: parseFloat(price).toFixed(2)
        })

        const transaction = await Transaction({
            createdAt: dateTime.DateTime.local().toISO(),
            orderId: order._id,
            buyer: user._id,
            // buyerEpaVault: 0,
            // buyerEpaCredits: 0,
            // buyerEpaTokens: 0,
            // buyerQuota: 0,
            seller: '',
            // sellerEpaVault: 0,
            // sellerEpaCash: 0,
            // sellerEpaTokens: 0,
            // sellerQuota: 0,
            amount: parseFloat(price).toFixed(2),
            details: orderItems
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await order.save()
        await transaction.save()
        return res.status(201).json({ message: 'Order Created!', order })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getOrders = async (req, res) => {
    console.log("<<< API GET ALL ORDERS >>>")
    
    try {
        const orders = await Order.find({}).sort({ owner: 1 })
        // orders.sort(() => Math.random() - 0.5) // enable random

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get All Orders Success!', orders })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.confirmOrder = async (req, res) => {
    console.log("<<< API PUT CONFIRM ORDER >>>")

    try {
        const { id } = req.params
        const { detailsId } = req.body

        const order = await Order.findOne({ _id: id })

        order.details.forEach(det => {
            if (det._id.includes(detailsId)) {
                det.isConfirmed = true
            }
        })

        await Order.findByIdAndUpdate(id, {
            details: order.details
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Order Confirmed!', order })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.updateOrder = async (req, res) => {
    console.log("<<< API PUT UPDATE ORDER SHIPPING >>>")

    try {
        const { id } = req.params
        const { detailsId } = req.body

        const order = await Order.findOne({ _id: id })

        order.details.forEach(det => {
            if (det._id.includes(detailsId))
                det.isShipped = true
        })

        await Order.findByIdAndUpdate(id, {
            details: order.details
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Order Ship Tagged!', order })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.cancelOrder = async (req, res) => {
    console.log("<<< API PUT CANCEL ORDER >>>")

    try {
        const { id } = req.params
        const { detailsId } = req.body

        const order = await Order.findOne({ _id: id })
        const transaction = await Transaction.findOne({ orderId: id })
        const userBuyer = await User.findOne({ _id: transaction.buyer })
        const settings = await Setting.findOne({})

        // NOTE FROM delivery controllers create a static doc for reference here
        let load
        order.details.forEach(async det => {
            if (det._id.includes(detailsId)) {
                det.isCancelled = true
                // deduct seller
                // await User.findByIdAndUpdate(det.owner, {
                //     $inc: {
                        // epacash: -transaction.amounth,
                        // epatokens: -transaction.sellerEpaTokens,
                        // quota: -transaction.sellerQuota
                //     }
                // })

                // stocks reset
                // if (det.stocks) {
                //     await Product.findByIdAndUpdate(det._od, {
                //         $inc: {
                //             stocks : det.quantity
                //         }
                //     })
                // }

                let itemPrice = det.stocks ? (det.token === 'high' ? det.price * settings.highToken + det.price : det.price * settings.lowToken + det.price) * det.quantity : (det.token === 'high' ? det.price * settings.highToken + det.price : det.price * settings.lowToken + det.price)
                let itemFees = parseFloat(det.fees.$numberDecimal)
                let itemExtra = parseFloat(det.extra.$numberDecimal)
                let totalPrice = itemPrice + itemFees + itemExtra

                // refund buyer
                await User.findByIdAndUpdate(transaction.buyer, {
                    $inc: {
                        epacredits: parseFloat(totalPrice).toFixed(2),
                        epaCreditsMonth: -parseFloat(totalPrice).toFixed(2) //dont mirror
                        // epavault: transaction.buyerEpaVault,
                        // epatokens: transaction.buyerEpaTokens,
                        // quota: transaction.buyerQuota
                    }
                })

                load = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Order Refund`,
                    owner: userBuyer._id,
                    sender: userBuyer.name,
                    recipient: userBuyer.name,
                    email: userBuyer.email,
                    mobilenum: userBuyer.mobilenum,
                    eWalletnum: userBuyer.eWalletnum,
                    amount: parseFloat(totalPrice).toFixed(2),
                    refnum: gpc(12)
                })

                await load.save()
            }
        })

        await Order.findByIdAndUpdate(id, {
            details: order.details
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Order Cancelled.', order })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.confirmReceiveOrder = async (req, res) => {
    console.log("<<< API PUT CONFIRM RECEIVE ORDER >>>")

    try {
        const { id } = req.params
        const { detailsId } = req.body

        const order = await Order.findOne({ _id: id })

        order.details.forEach(det => {
            if (det._id.includes(detailsId)) {
                det.isReceived = true
            }
        })

        await Order.findByIdAndUpdate(id, {
            details: order.details
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Is Order Received?', order })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.declineReceiveOrder = async (req, res) => {
    console.log("<<< API PUT DECLINE RECEIVE ORDER >>>")

    try {
        const { id } = req.params
        const { detailsId } = req.body

        const order = await Order.findOne({ _id: id })

        order.details.forEach(det => {
            if (det._id.includes(detailsId)) {
                det.isReceived = false
            }
        })

        await Order.findByIdAndUpdate(id, {
            details: order.details
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Order Not Received.', order })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getOrder = async (req, res) => {
    console.log("<<< API GET ORDER >>>")

    try {
        const { id } = req.params
        const order = await Order.findOne({ _id: id })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get Order Success!', order })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.submitOrderReceipt = async (req, res) => {
    console.log("<<< API POST CONFIRM ORDER RECEIPT >>>")

    try {
        const { id } = req.params
        // const { detailsId } = req.body

        const order = await Order.findOne({ _id: id })

        // order.details.forEach(det => {
        //     if (det._id.includes(detailsId)) {
        //         det.isConfirmed = true
        //     }
        // })

        await Order.findByIdAndUpdate(id, {
            idImage1: req.files.order[0].filename,
            idImage2: req.files.order[1].filename,
            idImage3: req.files.order[2].filename,
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Order Confirmed!', order })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}
