const { Load, User, Notification } = require('../models/model')
const dateTime = require('luxon')
const gpc = require('generate-pincode')

exports.generateEpaCash = async (req, res) => {
    console.log("<<< API PUT GENERATE EPA CASH >>>")

    try {
        const { id } = req.params
        const { amount } = req.body

        const user = await User.findOne({ _id: id })

        if (!amount)
            return res.status(422).json({ error: 'Amount is required!' })

        if (String(user._id) !== String(process.env.EPA_ACCT_ID))
            return res.status(422).json({ error: 'Hello hacker!' })

        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $inc: { epacash: parseFloat(amount).toFixed(2) }
        })

        // // add to notifications
        // const notif = await Notification({ 
        //     createdAt: dateTime.DateTime.local().toISO(),
        //     owner: id,
        //     type: 'mynotif',
        //     message: `Transferred PHP ${ parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Vault`,
        //     isRead: false,
        //     tags: 'epavault'
        // })

        const load = await Load({ 
            createdAt: dateTime.DateTime.local().toISO(),
            type: 'Generate EPA Cash',
            owner: user._id,
            sender: user.name,
            recipient: user.name,
            email: user.email,
            mobilenum: user.mobilenum,
            eWalletnum: user.eWalletnum,
            amount: parseFloat(amount).toFixed(2),
            refnum: gpc(12)
        })
      
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await load.save()
        // await notif.save()
        return res.status(201).json({ message: 'EPA Cash Generate Success!', load })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.sendEpaVault = async (req, res) => {
    console.log("<<< API PUT SEND EPA VAULT >>>")

    try {
        const { id } = req.params
        const { amount } = req.body

        const today = dateTime.DateTime.now().toObject().day
        
        if (today === 1) {
            console.log('Resetting EPA Cash Limit')
            await User.findByIdAndUpdate(id, {
                epacashTotal: 0 // reset epa cash limit | first day of month
            })
        }

        const user = await User.findOne({ _id: id })

        if (user.class === 'Member')
            return res.status(422).json({ error: 'Purchase subscription package first to send EPA Vault.' })

        if (parseFloat(user.epacash) < parseFloat(amount) - (parseFloat(user.quota / 10)))
            return res.status(422).json({ error: 'Not enough balance.' })

        if (!user.isVerified && parseFloat(amount) >= 10000)
            return res.status(422).json({ error: 'Max of P10,000 is allowed per month. Please verify your account to prevent limits.' })

        if (!user.isVerified && parseFloat(user.epacashTotal) >= 10000)
            return res.status(422).json({ error: 'Max of P10,000 is allowed per month. Please verify your account to prevent limits.' })

        await User.findByIdAndUpdate(id, {
            $inc: { 
                epavault: parseFloat(amount).toFixed(2),
                epacredits: parseFloat(amount).toFixed(2), //mirror
                // epaCreditsMonth: parseFloat(amount).toFixed(2), //dont mirror
                epacash: -parseFloat(amount).toFixed(2)
            }
        })

        // add to notifications
        const notif = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: id,
            type: 'mynotif',
            message: `Transferred PHP ${ parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Vault`,
            isRead: false,
            tags: 'epavault'
        })

        const load = await Load({ 
            createdAt: dateTime.DateTime.local().toISO(),
            type: 'Send EPA Vault',
            owner: user._id,
            sender: user.name,
            recipient: user.name,
            email: user.email,
            mobilenum: user.mobilenum,
            eWalletnum: user.eWalletnum,
            amount: parseFloat(amount).toFixed(2),
            refnum: gpc(12)
        })
      
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await load.save()
        await notif.save()
        return res.status(201).json({ message: 'EPA Cash Sent to Vault Success!', load })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.sendEpaCash = async (req, res) => {
    console.log("<<< API POST SEND EPA CASH >>>")

    try {
        const { id } = req.params
        const { amount, eWalletNum } = req.body

        const today = dateTime.DateTime.now().toObject().day
        
        if (today === 1) {
            await User.findByIdAndUpdate(id, {
                epacashTotal: 0 // reset epa cash limit | first day of month
            })
        }

        const user = await User.findOne({ _id: id })
        const recipient = await User.findOne({ eWalletnum: eWalletNum })

        if (!amount)
            return res.status(422).json({ error: 'Amount is required!' })

        if (parseFloat(user.epacash) < parseFloat(amount))
            return res.status(422).json({ error: 'Not enough balance.' })

        if (!recipient || !eWalletNum)
            return res.status(422).json({ error: 'Recipient not found!' })

        if (user.class === 'Member')
            return res.status(422).json({ error: 'Purchase subscription package first to send EPA Cash.' })

        if (user.email !== 'edchan333@gmail.com' && user.eWalletnum === eWalletNum)
            return res.status(422).json({ error: 'Can\'t send EPA Cash to EPA Wallet.' })

        if (!user.isVerified && parseFloat(amount) >= 10000)
            return res.status(422).json({ error: 'Max of P10,000 is allowed per month. Please verify your account to prevent limits.' })

        if (!user.isVerified && parseFloat(user.epacashTotal) >= 10000)
            return res.status(422).json({ error: 'Max of P10,000 is allowed per month. Please verify your account to prevent limits.' })

        const load = await Load({ 
            createdAt: dateTime.DateTime.local().toISO(),
            type: 'Send EPA Cash',
            owner: user._id,
            sender: user.name,
            recipient: recipient.name,
            email: recipient.email,
            mobilenum: recipient.mobilenum,
            eWalletnum: recipient.eWalletnum,
            amount: parseFloat(amount).toFixed(2),
            refnum: gpc(12)
        })

        await User.findByIdAndUpdate(id, {
            $inc: { 
                epacash: -parseFloat(amount).toFixed(2),
                epacashTotal: parseFloat(amount).toFixed(2)
            }
        })

        await User.findByIdAndUpdate(String(recipient._id), {
            $inc: { epacash: parseFloat(amount).toFixed(2) }
        })

        // add to notifications
        const notif = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: id,
            type: 'mynotif',
            message: `Transferred ${ parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Cash`,
            isRead: false,
            tags: 'epacash'
        })

        const notif2 = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: recipient._id,
            type: 'mynotif',
            message: `Received PHP ${ parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } EPA Cash from ${ user.name }`,
            isRead: false,
            tags: 'epacash'
        })

        // send receipt to email
        // const transporter = nodemailer.createTransport({
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

        // const mail_config = {
        //     from: { name: 'EPA Sales', address: process.env.SALES_MX_SERVER },
        //     to: email,
        //     subject: `Send EPA Cash to ${ recipient.name }`,
        //     html: `
        //         <h2>Hello ${ userName } !</h2>
        //         <h2>TEMPLATE HERE</h2>`,
        // }
      
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await load.save()
        await notif.save()
        await notif2.save()
        // transporter.sendMail(mail_config)
        return res.status(201).json({ message: 'EPA Cash Sent.', load })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.createIOU = async (req, res) => {
    console.log("<<< API POST CREATE IOU >>>")

    try {
        const { id } = req.params
        const { amount, interest, terms, duration, eWalletNum } = req.body

        const today = dateTime.DateTime.now().toObject().day
        
        if (today === 1) {
            console.log('Resetting EPA Cash Limit')
            await User.findByIdAndUpdate(id, {
                epacashTotal: 0 // reset epa cash limit | first day of month
            })
        }

        const user = await User.findOne({ _id: id })
        const recipient = await User.findOne({ eWalletnum: eWalletNum })

        if (!recipient)
            return res.status(422).json({ error: 'Recipient not found!' })

        if (user.class === 'Member')
            return res.status(422).json({ error: 'Purchase subscription package first to Send to IOU.' })

        if (user.email !== 'edchan333@gmail.com' && user.eWalletnum === eWalletNum)
            return res.status(422).json({ error: 'Can\'t send EPA Cash to EPA Wallet.' })

        if (parseFloat(user.epacash) < parseFloat(amount))
            return res.status(422).json({ error: 'Not enough balance.' })

        if (!user.isVerified && parseFloat(amount) >= 10000)
            return res.status(422).json({ error: 'Max of P10,000 is allowed per month. Please verify your account to prevent limits.' })

        if (!user.isVerified && parseFloat(user.epacashTotal) >= 10000)
            return res.status(422).json({ error: 'Max of P10,000 is allowed per month. Please verify your account to prevent limits.' })

        const load = await Load({ 
            createdAt: dateTime.DateTime.local().toISO(),
            type: 'Send IOU',
            owner: user._id,
            sender: user.name,
            recipient: recipient.name,
            email: recipient.email,
            mobilenum: recipient.mobilenum,
            eWalletnum: recipient.eWalletnum,
            amount: parseFloat(amount).toFixed(2),
            refnum: gpc(12),
            isIouConfirmed: false,
            interest: interest,
            terms: terms,
            duration: duration,
            eWalletNum: eWalletNum
        })

        // add to notifications
        const notif = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: id,
            type: 'mynotif',
            message: `Created PHP ${ parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } EPA Cash as IOU to ${ recipient.name }`,
            isRead: false,
            tags: 'epacash'
        })

        const notif2 = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: recipient._id,
            type: 'mynotif',
            message: `To confirm PHP ${ parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } EPA Cash as IOU from ${ user.name }`,
            isRead: false,
            tags: 'epacash'
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await load.save()
        await notif.save()
        await notif2.save()
        return res.status(201).json({ message: 'Create IOU Success!.', load })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.convertEpaVault = async (req, res) => {
    console.log("<<< API PUT CONVERT EPA VAULT TO EPA CASH >>>")

    try {
        const { id } = req.params
        const { amount } = req.body

        const user = await User.findOne({ _id: id })

        if (String(user._id) !== process.env.EPA_ACCT_ID)
            return res.status(422).json({ error: 'User mot allowed!' })
        
        if (!amount)
            return res.status(422).json({ error: 'Amount is required!' })

        if (parseFloat(user.epavault) < parseFloat(amount))
            return res.status(422).json({ error: 'Not enough balance.' })

        await User.findByIdAndUpdate(id, {
            updatedAt: dateTime.DateTime.local().toISO(),
            $inc: {
                epacash: parseFloat(amount).toFixed(2),
                epavault: -parseFloat(amount).toFixed(2)
            }
        })

        const load = await Load({ 
            createdAt: dateTime.DateTime.local().toISO(),
            type: 'Send EPA Vault to EPA Cash',
            owner: user._id,
            sender: user.name,
            recipient: user.name,
            email: user.email,
            mobilenum: user.mobilenum,
            eWalletnum: user.eWalletnum,
            amount: parseFloat(amount).toFixed(2),
            refnum: gpc(12)
        })

        // add to notifications
        const notif = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: id,
            type: 'mynotif',
            message: `Transferred ${ parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } EPA Vault to EPA Cash`,
            isRead: false,
            tags: 'epacash'
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await load.save()
        await notif.save()
        return res.status(201).json({ message: 'Converted EPA Vault to EPA Cash Success!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.confirmIOU = async (req, res) => {
    console.log("<<< API PUT SEND IOU >>>")

    try {
        const { id } = req.params
        const { isApproved } = req.body

        console.log('Confirm IOU: ', isApproved ? 'Approved!' : 'Rejected!')

        const recipient = await User.findOne({ _id: id })
        const load = await Load.findOne({ email: recipient.email }).sort({ createdAt: -1 })
        const sender = await User.findOne({ _id: load.owner })

        const today = dateTime.DateTime.now().toObject().day
        
        if (today === 1) {
            await User.findByIdAndUpdate(sender._id, {
                epacashTotal: 0 // reset epa cash limit | first day of month
            })
        }

        if (!recipient)
            return res.status(422).json({ error: 'Recipient not found!' })

        if (!load)
            return res.status(422).json({ error: 'Document does not exist!' })

        if (load.isIouConfirmed)
            return res.status(422).json({ error: 'IOU is already confirmed!' })

        if (parseFloat(sender.epacash) < parseFloat(load.amount))
            return res.status(422).json({ error: 'Not enough balance.' })

        if (!sender.isVerified && parseFloat(sender.epacashTotal) >= 10000)
            return res.status(422).json({ error: 'Max of P10,000 is allowed per month. Please verify your account to prevent limits.' })

        let notif, notif2

        if (!isApproved) {
            console.log('Deleting Request...')
            await Load.findByIdAndDelete({ _id: load._id })
        } else {
            await User.findByIdAndUpdate(sender._id, {
                $push: {
                    iou: {
                        eWalletNum: load.eWalletNum,
                        amount: parseFloat(load.amount).toFixed(2),
                        interest: parseFloat(load.interest) / 100,
                        terms: load.terms,
                        duration: load.duration,
                        isFullyPaid: false,
                        createdAt: dateTime.DateTime.local().toISO()
                    }
                }
            })

            await Load.findByIdAndUpdate(load._id, {
                isIouConfirmed: true
            })

            await User.findByIdAndUpdate(sender._id, {
                $inc: { 
                    epacash: -parseFloat(load.amount).toFixed(2),
                    epacashTotal: parseFloat(load.amount).toFixed(2)
                }
            })

            await User.findByIdAndUpdate(String(recipient._id), {
                $inc: { epacash: parseFloat(load.amount).toFixed(2) }
            })

            // add to notifications
            notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: sender._id,
                type: 'mynotif',
                message: `Sent PHP ${ parseFloat(load.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } EPA Cash as IOU to ${ recipient.name }`,
                isRead: false,
                tags: 'epacash'
            })

            notif2 = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: recipient._id,
                type: 'mynotif',
                message: `Received PHP ${ parseFloat(load.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } EPA Cash as IOU from ${ sender.name }`,
                isRead: false,
                tags: 'epacash'
            })

            // send receipt to email
            // const transporter = nodemailer.createTransport({
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

            // const mail_config = {
            //     from: { name: 'EPA Sales', address: process.env.SALES_MX_SERVER },
            //     to: email,
            //     subject: `Send EPA Cash to ${ recipient.name }`,
            //     html: `
            //         <h2>Hello ${ userName } !</h2>
            //         <h2>TEMPLATE HERE</h2>`,
            // }
        }

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        if (notif) await notif.save()
        if (notif2) await notif2.save()
        // transporter.sendMail(mail_config)
        return res.status(201).json({ message: 'EPA Cash Sent via IOU.', load })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

// exports.topup = async (req, res) => {
//     console.log("<<< API POST PAYMENT TOPUP >>>")

//     try {
//         const { id } = req.params
//         const { amount, paymentMethod, paymentMode, type } = req.body

//         const user = await User.findOne({ _id: id })

//         const load = await Load({ 
//             createdAt: dateTime.DateTime.local().toISO(),
//             owner: id,
//             email: user.email,
//             mobilenum: user.mobilenum,
//             status: 'Pending',
//             image: req.file ? req.file.filename : null,
//             ...req.body
//         })

//         // Protect API for Internal Use Only
//         if (req.header('X-Api-Key') !== process.env.API_KEY)
//             return res.status(403).json({ message: 'Forbidden !' })
//         await load.save()
//         return res.status(201).json({ message: 'Top-Up Success!', load })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

// exports.withdraw = async (req, res) => {
//     console.log("<<< API POST PAYMENT WITHDRAW >>>")

//     try {
//         const { id } = req.params
//         const { amount, paymentMethod, paymentMode, type } = req.body

//         const user = await User.findOne({ _id: id })

//         const load = await Load({ 
//             createdAt: dateTime.DateTime.local().toISO(),
//             owner: id,
//             email: user.email,
//             mobilenum: user.mobilenum,
//             status: 'Pending',
//             ...req.body
//         })

//         // Protect API for Internal Use Only
//         if (req.header('X-Api-Key') !== process.env.API_KEY)
//             return res.status(403).json({ message: 'Forbidden !' })
//         await load.save()
//         return res.status(201).json({ message: 'Withdraw Success!', load })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

// exports.updateStatusApprove = async (req, res) => {
//     console.log('<<< API PUT TOPUP APPROVE STATUS >>>')

//     try {
//         const { id } = req.params

//         const doc = await Load.findByIdAndUpdate(id, {
//             status: 'Approved' 
//         })

//         if (!doc)
//             return res.status(404).json({ error: 'Document not found' })

//         await User.findOneAndUpdate({ email: doc.email }, {
//             $inc: { epacash: doc.amount }
//         })

//         const load = await Load.find({ type: { $eq: 'topup' }, status: 'Pending' }).sort({ createdAt: -1 })

//         // Protect API for Internal Use Only
//         if (req.body.headers['X-Api-Key'] !== process.env.API_KEY)
//             return res.status(403).json({ message: 'Forbidden !' })
//         return res.status(201).json({ message: 'Top-Up Success!', load })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

// exports.updateStatusReject = async (req, res) => {
//     console.log("<<< API PUT TOPUP REJECT STATUS >>>")

//     try {
//         const { id } = req.params

//         const doc = await Load.findByIdAndUpdate(id, {
//             status: 'Rejected' 
//         })

//         if (!doc)
//             return res.status(404).json({ error: 'Document not found' })

//         const load = await Load.find({ type: { $eq: 'topup' }, status: 'Pending' }).sort({ createdAt: -1 })

//         // Protect API for Internal Use Only
//         if (req.body.headers['X-Api-Key'] !== process.env.API_KEY)
//             return res.status(403).json({ message: 'Forbidden !' })
//         return res.status(201).json({ message: 'Top-Up Rejected!!', load })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

// exports.updateStatusApproveWithdraw = async (req, res) => {
//     console.log('<<< API PUT WITHDRAW APPROVE STATUS >>>')

//     try {
//         const { id } = req.params
//         const fixServiceFee = 0.05

//         const doc = await Load.findByIdAndUpdate(id, { 
//             status: 'Approved',           
//         })  

//         if (!doc)
//             return res.status(404).json({ error: 'Document not found' })

//         await User.findOneAndUpdate({ email: doc.email }, {
//             $inc: { epacash: -doc.amount }
//         })

//         await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
//             $inc: { epacash: doc.amount * fixServiceFee }
//         })

//         const load = await Load.find({ type: { $eq: 'withdraw' }, status: 'Pending' }).sort({ createdAt: -1 })

//         // Protect API for Internal Use Only
//         if (req.body.headers['X-Api-Key'] !== process.env.API_KEY)
//             return res.status(403).json({ message: 'Forbidden !' })
//         return res.status(201).json({ message: 'Withdrawal Approved!', load })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

// exports.updateStatusRejectWithdraw = async (req, res) => {
//     console.log("<<< API PUT WITHDRAW REJECT STATUS >>>")

//     try {
//         const { id } = req.params
        
//         const doc = await Load.findByIdAndUpdate(id, {
//             status: 'Rejected' 
//         })

//         if (!doc)
//             return res.status(404).json({ error: 'Document not found' })

//         await User.findByIdAndUpdate(doc.userId, {
//             $inc: { balance: doc.amount }          
//         })

//         const load = await Load.find({ type: { $eq: 'withdraw' }, status: 'Pending' }).sort({ createdAt: -1 })

//         // Protect API for Internal Use Only
//         if (req.body.headers['X-Api-Key'] !== process.env.API_KEY)
//             return res.status(403).json({ message: 'Forbidden !' })
//         return res.status(201).json({ message: 'Withdrawal Rejected!!', load })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

exports.getIOU = async (req, res) => {
    console.log("<<< API GET IOU LOAD >>>")
    
    try {
        const { email } = req.params

        const load = await Load.find({ email: email }).sort({ createdAt: -1 })

        if (!load) return res.status(422).json({ error: 'No Load Found!' })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get IOU Load Success!', load })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getLoad = async (req, res) => {
    console.log("<<< API GET USER LOAD >>>")
    
    try {
        const { id } = req.params

        const user = await User.findOne({ _id: id })
        const load = await Load.find({ $or: [ { owner: user._id }, { email: user.email } ] }).sort({ createdAt: -1 })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get User Load Success!', load })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getAllLoads = async (req, res) => {
    console.log("<<< API GET ALL LOADS >>>")
    
    try {
        const loads = await Load.find({}).sort({ createdAt: -1 })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get All Loads Success!', loads })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}
