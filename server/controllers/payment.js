const { Payment, User, Order, Load, Transaction, Notification, Setting } = require('../models/model')
const { createProxyMiddleware } = require('http-proxy-middleware')
const dateTime = require('luxon')
const crypto = require('crypto')
const gpc = require('generate-pincode')

// exports.auth = async (req, res) => {
//     console.log("<<< API POST AUTHENTICATION PAYMENT >>>")

//     try {
//         // console.log(req.headers)
//         // const { id } = req.params
//         // const { filename } = req.file
//         // const { name, description, category, price, stocks } = req.body

//         // const payment = await Payment({ 
//         //     createdAt: dateTime.DateTime.local().toISO(),
//         //     owner: id,
//         //     image: filename,
//         //     ...req.body
//         // })

//         // Protect API for Internal Use Only
//         // if (req.header('X-Api-Key') !== process.env.API_KEY)
//         //     return res.status(403).json({ error: 'Forbidden' })
//         // await payment.save()
//         // return res.status(201).json({ message: 'Payment Auth Success!', payment })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

exports.payEpaCredits = async (req, res) => {
    console.log("<<< API POST PAYMENT EPA CREDITS >>>")

    try {
        const { id } = req.params
        const { name, email, phone, amount, currency, order_id, order_details } = req.body

        const user = await User.findOne({ _id: id })
        const orderItems = await Order.findOne({ email: email }).sort({ createdAt: -1 })
        const settings = await Setting.findOne({})

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

        let load//, transporter, mail_config

        if (parseFloat(user.epacredits) < parseFloat(amount)) {
            // add epa credit limit as loanamount
            await User.findByIdAndUpdate(id, {
                $push: {
                    loanamount: {
                        eWalletNum: user.eWalletnum,
                        amount: parseFloat(amount).toFixed(2) - parseFloat(user.epacredits).toFixed(2),
                        interest: 0.03,
                        terms: 1,
                        duration: 'month',
                        createdAt: dateTime.DateTime.local().toISO()
                    }
                },
                $inc: {
                    // loanamount: amount - parseFloat(user.epacredits).toFixed(2),
                    epacredits: parseFloat(amount).toFixed(2) - parseFloat(user.epacredits).toFixed(2),
                    // epaCreditsMonth: parseFloat(amount).toFixed(2) - parseFloat(user.epacredits).toFixed(2) //mirror
                }
            })

            load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: 'Loan Credit Line',
                owner: user._id,
                sender: 'EPA Ecology Producer Association',
                recipient: user.name,
                email: user.email,
                mobilenum: user.mobilenum,
                eWalletnum: user.eWalletnum,
                amount: amount - parseFloat(user.epacredits).toFixed(2),
                refnum: gpc(12)
            })

            // send receipt to email
            // transporter = nodemailer.createTransport({
            //     host: 'smtpout.secureserver.net', 
            //     secure: true,
            //     secureConnection: false, // TLS requires secureConnection to be false
            //     tls: {
            //         ciphers:'SSLv3'
            //     },
            //     requireTLS: true,
            //     port: process.env.MX_PORT,
            //     debug: true,
            //     auth: {
            //         user: process.env.SUPPORT_MX_SERVER,
            //         pass: process.env.MX_PASSWORD
            //     }
            // })

            // mail_config = {
            //     from: { name: 'EPA Sales', address: process.env.SALES_MX_SERVER },
            //     to: email,
            //     subject: `Loan Credit Line for ${ recipient.name }`,
            //     html: `
            //         <h2>Hello ${ userName } !</h2>
            //         <h2>TEMPLATE HERE</h2>`,
            // }
        }
        
        await User.findByIdAndUpdate(id, {
            $inc: { 
                epacash: -parseFloat(amount).toFixed(2) * percentCash,
                epacredits: -parseFloat(amount).toFixed(2) * percentCredit,
                epaCreditsMonth: parseFloat(amount).toFixed(2) * percentCredit //mirror
            }
        })

        // let tokenValue = 0

        orderItems.details.forEach(async item => {
            let itemPrice = item.stocks ? (item.token === 'high' ? item.price * settings.highToken + item.price : item.price * settings.lowToken + item.price) * item.quantity : (item.token === 'high' ? item.price * settings.highToken + item.price : item.price * settings.lowToken + item.price)
            let itemFees = parseFloat(item.fees.$numberDecimal)
            let itemExtra = parseFloat(item.extra.$numberDecimal)
            let totalPrice = itemPrice + itemFees + itemExtra

            let recipient = await User.findOne({ _id: item.owner })

            let load2 = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: 'Send Order Payment',
                owner: user._id,
                sender: user.name,
                recipient: recipient.name,
                email: recipient.email,
                mobilenum: recipient.mobilenum,
                eWalletnum: recipient.eWalletnum,
                amount: parseFloat(totalPrice).toFixed(2),
                refnum: gpc(12)
            })

            let notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: user._id,
                type: 'mynotif',
                message: `You ordered ${ item.name }`,
                image: item.image,
                isRead: false,
                tags: item.stocks ? 'order-product' : 'order-service'
            })

            await load2.save()
            await notif.save()
        })

        const payment = await Payment({ 
            createdAt: dateTime.DateTime.local().toISO(),
            status: 'succeeded',
            ...req.body
        })

        // update user cart items
        const userCart = []

        user.cart.forEach(uid => {
            if (!orderItems.details.find(item => item._id.includes(uid.itemId)))
                userCart.push(uid)
        })

        await User.findByIdAndUpdate(user._id, { cart: userCart })

        if (payment.status === 'succeeded') {
            await Order.findByIdAndUpdate(orderItems._id, { isPaid: true })
        }

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        if (load) await load.save()
        // if (transporter && mail_config) transporter.sendMail(mail_config)
        await payment.save()
        return res.status(201).json({ message: 'Payment Success!', payment })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.payNow = createProxyMiddleware({
    target: process.env.DB_ENV === 'production' ? process.env.HITPAY_URL : process.env.HITPAY_MOCK_URL,
    pathRewrite: async (path, req) => { 
        console.log("<<< API POST PAYMENT HITPAY PAY NOW >>>")
        return path.replace(req.originalUrl, `/${ process.env.HITPAY_API_VER }/${ process.env.HITPAY_ENDPOINT }`) 
    },
    changeOrigin: true,
    logger: console
})

exports.paymentConfirm = async (req, res) => {
    console.log("<<< API POST PAYMENT CONFIRM WEBHOOK >>>")

    try {
        const { amount, currency, id, payment_request_id, reference_number, status } = req.body
        /* Format to url-encoded */
        // payment_id=92965a2d-ece3-4ace-1245-494050c9a3c1&payment_request_id=92965a20-dae5-4d89-a452-5fdfa382dbe1&reference_number=ABC123&phone=&amount=599.00&currency=SGD&status=completed&hmac=330c34a6a8fb9ddb75833620dedb94bf4d4c2e51399d346cbc2b08c381a1399c
        /* sort and remove & and =*/
        // amount1.00currencySGDpayment_id91d94138-b0b5-4ba0-b78c-babc59776876payment_request_id91d94124-0d1c-4fb4-921e-51953793106cphonereference_number201000000Dstatuscompleted

        // Parse payload
        generateSignatureArray = (secret, vals) => {
            console.log('secret >> ', secret)
            console.log('vals >> ', vals)
            const source = []
            Object.keys(vals).sort().forEach((key) => {
            source.push(`${ key }${ vals[key] }`)
        })
            let payload = source.join('')
            const hmac = crypto.createHmac('sha256', secret)
            console.log('PayLoad >> ', payload)
            let signed = hmac.update(Buffer.from(payload, 'utf-8')).digest('hex')
            return signed
        }

        const payment = await Payment({ 
            name: req.body.customer.name,
            email: req.body.customer.email,
            mobilenum: req.body.customer.phone_number,
            // address: req.body.customer.address,
            amount: parseFloat(amount).toFixed(2),
            currency: currency,
            status: status,
            payment_id: id,
            payment_request_id: payment_request_id,
            payment_gateway: req.body.channel,
            payment_provider: req.body.payment_provider,
            fixed_fee: req.body.fixed_fee,
            discount_fee: req.body.discount_fee,
            discount_fee_rate: req.body.discount_fee_rate,
            refunded_amount: req.body.refunded_amount,
            created_at: req.body.created_at,
            updated_at: req.body.updated_at,
            closed_at: req.body.updated_at
        })

        // update user cart items
        const user = await User.findOne({ email: req.body.customer.email })
        const orderItems = await Order.findOne({ email: req.body.customer.email }).sort({ createdAt: -1 })
        const userCart = []

        user.cart.forEach(uid => {
            if (!orderItems.details.find(item => item._id.includes(uid)))
                userCart.push(uid)
        })

        await User.findByIdAndUpdate(user._id, { cart: userCart })

        if (payment.status === 'succeeded') {
            await Order.findByIdAndUpdate(orderItems._id, { isPaid: true })
        }

        await payment.save()
        return res.status(200).json({ message: 'Payment Success!', payment })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}