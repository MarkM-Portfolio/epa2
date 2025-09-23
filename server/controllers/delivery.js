const { Delivery, User, Store, Product, Load, Notification, Setting } = require('../models/model')
const { ObjectId } = require('mongoose').Types
const dateTime = require('luxon')
const gpc = require('generate-pincode')

exports.setDelivery = async (req, res) => {
    console.log("<<< API POST SET DELIVERY >>>")

    try {
        const { sender, recepientEmail, channel, details, deliveryData } = req.body
        const recepient = await User.findOne({ email: recepientEmail })

        let objData = {}

        if (channel === 'manual') {
            const senderDetails = await Store.findOne({ owner: sender })

            const senderData = {
                name: senderDetails.name,
                address: senderDetails.name.replace(/^\s+|\s+$/gm, ' ') + ' ' + senderDetails.address.replace(/^\s+|\s+$/gm, ' ') + ' ' + senderDetails.city.replace(/^\s+|\s+$/gm, ' ') + ' ' + senderDetails.province.replace(/^\s+|\s+$/gm, ' ') + ' ' + String(senderDetails.zipcode),
                contactnumber: senderDetails.contactnumber
            }
            
            const recipientDetails = await User.findOne({ _id: recepient._id })
            
            const recipientData = {
                name: recipientDetails.name,
                email: recipientDetails.email,
                address: recipientDetails.shippingAddress,
                contactnumber: recipientDetails.mobilenum
            }

            const senderArray = [], recipientArray = []

            senderArray.push(senderData)
            recipientArray.push(recipientData)

            objData = {
                'sender': senderArray,
                'recipient': recipientArray
            }
        }

        const delivery = await Delivery({ 
            sender: sender,
            recepient: recepient._id,
            channel: channel,
            details: JSON.parse(details),
            quantity: JSON.parse(details).quantity,
            price: parseFloat(JSON.parse(details).price).toFixed(2),
            deliveryData: channel === 'manual' ? JSON.stringify(objData) : deliveryData ? JSON.parse(deliveryData) : '',
            createdAt: dateTime.DateTime.local().toISO()
        })

        if (JSON.parse(details).stocks) {
            await Product.findByIdAndUpdate(JSON.parse(details)._id, {
                $inc: { stocks: -JSON.parse(details).quantity }
            })
        }

        // Update User Children First
        const childrenTree = await User.aggregate([
            { $project: {
                name: '$name',
                childrenCount: { $cond: { if: { $isArray: '$children' }, then: { $size: '$children' }, else: 'N/A'} },
                children: '$children',
                createdAt: '$createdAt'
            }},
            { $match: { childrenCount: { $gte: 0 } } },
            { $unwind: '$children' },
            { $lookup: {
                from: 'users',
                localField: 'children._id',
                foreignField: '_id',
                as: 'childrenDetails'
            }},
            { $addFields: { 'children': { 
                $mergeObjects: [
                    '$children', 
                    { $arrayElemAt: [ '$childrenDetails', 0 ] }
                ] 
            }}},
            { $project: { 'childrenDetails': 0 } },
            { $group: {
                _id: '$_id',
                name: { $first: '$name' },
                children: { $push: '$children' },
                createdAt: { $first: '$createdAt' }
            }},
            { $sort: { createdAt: -1 } }
        ])

        if (childrenTree.length) {
            childrenTree.forEach(async usr => {
                console.log('Update User: ', usr.name)

                let childrenArray = []
                for (idx in usr.children) {                    
                    childrenArray.push({
                        '_id': usr.children[idx]._id,
                        'name': usr.children[idx].name,
                        'avatar': usr.children[idx].avatar,
                        'class': usr.children[idx].class,
                        'children': usr.children[idx].children
                    })
                }

                await User.findByIdAndUpdate(usr._id, {
                    children: childrenArray
                })
            })

            console.log('Total Users Updated: ', childrenTree.length)
        } else {
            console.log('No Users Changed.')
        }

        // const userTeams = await User.aggregate([
        //     { $match: { _id: new ObjectId(recepient._id) }},
        //     { $unwind: '$children' },
        //     { $lookup: {
        //         from: 'users',
        //         localField: 'children._id',
        //         foreignField: '_id',
        //         as: 'childrenDetails'
        //     }},
        //     { $addFields: { 'children': { 
        //         $mergeObjects: [
        //             '$children', 
        //             { $arrayElemAt: [ '$childrenDetails', 0 ] }
        //         ] 
        //     }}},
        //     { $project: { 'childrenDetails': 0 } },
        //     { $group: {
        //         _id: '$_id',
        //         name: { $first: '$name' },
        //         children: { $push: '$children' }
        //     }}
        // ])

        const settings = await Setting.findOne({})
        // let teamSellerCount = [], teamBuyerCount = []

        // if (userTeams.length) {
        // const teamSellerCount = await User.aggregate([
        //     { $match: { _id: new ObjectId(sender) } },
        //     { $graphLookup: {
        //         from: 'users',
        //         startWith: '$children._id',
        //         connectFromField: 'children._id',
        //         connectToField: '_id',
        //         as: 'allChildren',
        //         depthField: 'depth'
        //         }
        //     },
        //     { $addFields: {
        //         childrenMember: { $size: { $filter: {
        //             input: '$allChildren',
        //             as: 'child',
        //             cond: { $eq: [ '$$child.class', 'Member' ] }}
        //         }},
        //     }},
        //     { $group: {
        //         _id: '$_id',
        //         name: { $first: '$name' },
        //         childrenCount: { $sum: { $size: '$allChildren' } },
        //         childrenMember: { $first: '$childrenMember' }
        //     }}
        // ])

        // const teamBuyerCount = await User.aggregate([
        //     { $match: { _id: new ObjectId(recepient._id) } },
        //     { $graphLookup: {
        //         from: 'users',
        //         startWith: '$children._id',
        //         connectFromField: 'children._id',
        //         connectToField: '_id',
        //         as: 'allChildren',
        //         depthField: 'depth'
        //         }
        //     },
        //     { $addFields: {
        //         childrenMember: { $size: { $filter: {
        //             input: '$allChildren',
        //             as: 'child',
        //             cond: { $eq: [ '$$child.class', 'Member' ] }}
        //         }},
        //     }},
        //     { $group: {
        //         _id: '$_id',
        //         name: { $first: '$name' },
        //         childrenCount: { $sum: { $size: '$allChildren' } },
        //         childrenMember: { $first: '$childrenMember' }
        //     }}
        // ])

        // const today = dateTime.DateTime.now().toISO()
        // const date = dateTime.DateTime.fromISO(today)
        // const dayName = date.toLocaleString({ weekday: 'long' })

        // console.log('Test Today >>> ', today)
        // console.log('Test date >>> ', date)
        // console.log('Test dayName >>> ', dayName)

        // if (dayName !== 'Saturday') {
        //     console.log('< Add Quota Day >', dayName)
        //     let senderQuota, recipientQuota

        //     if (teamSellerCount.length) {
        //         const validSellerChildrenCount = teamSellerCount[0].childrenCount - teamSellerCount[0].childrenMember
        //         const quotaBase = settings.base * validSellerChildrenCount
        //         senderQuota = (( quotaBase * validSellerChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10

        //         await User.findByIdAndUpdate(sender, {
        //             $inc: { 
        //                 quota: parseFloat(senderQuota).toFixed(4),
        //                 epavault: parseFloat(senderQuota).toFixed(2) / 6 / 10,
        //                 epacredits: parseFloat(senderQuota).toFixed(2) / 6 / 10,
        //                 // epaCreditsMonth: parseFloat(senderQuota).toFixed(2) /6 / 10,
        //                 ecomVault: parseFloat(senderQuota).toFixed(2) / 6 / 10,
        //                 totalIncome: parseFloat(senderQuota).toFixed(2) / 6 / 10
        //             }
        //         })

        //         if (validSellerChildrenCount >= settings.rewardsJBA) {
        //             await User.findByIdAndUpdate(sender, {
        //                 $inc: { 
        //                     quota: parseFloat(senderQuota).toFixed(4) + ((parseFloat(sender.quota).toFixed(4) / 6 / 10) * settings.bonusForMerchants)
        //                 }
        //             })
        //         }

        //         console.log('Seller Valid Children Count: ', validSellerChildrenCount)
        //         console.log('Quota Added: ', parseFloat(senderQuota).toFixed(4))
        //     }

        //     if (teamBuyerCount.length) {
        //         const validBuyerChildrenCount = teamBuyerCount[0].childrenCount - teamBuyerCount[0].childrenMember
        //         const quotaBase = settings.base * validBuyerChildrenCount
        //         recipientQuota = (( quotaBase * validBuyerChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10

        //         console.log('Buyer Valid Children Count: ', validBuyerChildrenCount)
        //         console.log('Quota Added: ', parseFloat(recipientQuota).toFixed(4))

        //         await User.findByIdAndUpdate(recepient._id, {
        //             $inc: { 
        //                 quota: parseFloat(recipientQuota).toFixed(4),
        //                 epavault: parseFloat(recipientQuota).toFixed(2) / 6 / 10,
        //                 epacredits: parseFloat(recipientQuota).toFixed(2) / 6 / 10,
        //                 // epaCreditsMonth: parseFloat(recipientQuota).toFixed(2) /6 / 10,
        //                 ecomVault: parseFloat(recipientQuota).toFixed(2) / 6 / 10,
        //                 // totalIncome: parseFloat(recipientQuota).toFixed(2) / 6 / 10
        //             }
        //         })
        //     }
        // } else {
        //     console.log('Cut-off Today is (Saturday): ', dayName)

        //     let senderQuota, recipientQuota

        //     if (teamSellerCount.length) {
        //         const validSellerChildrenCount = teamSellerCount[0].childrenCount - teamSellerCount[0].childrenMember
        //         const quotaBase = settings.base * validSellerChildrenCount
        //         senderQuota = (( quotaBase * validSellerChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10

        //         await User.findByIdAndUpdate(sender, {
        //             $inc: { 
        //                 quotaSubWeek: parseFloat(recipientQuota).toFixed(4),
        //                 epavault: parseFloat(senderQuota).toFixed(2) / 6 / 10,
        //                 epacredits: parseFloat(senderQuota).toFixed(2) / 6 / 10,
        //                 // epaCreditsMonth: parseFloat(senderQuota).toFixed(2) / 6 / 10,
        //                 ecomVault: parseFloat(senderQuota).toFixed(2) / 6 / 10,
        //                 // totalIncome: parseFloat(senderQuota).toFixed(2) / 6 / 10
        //             }
        //         })

        //         if (validSellerChildrenCount >= settings.rewardsJBA) {
        //             await User.findByIdAndUpdate(sender, {
        //                 $inc: { 
        //                     quotaSubWeek: parseFloat(senderQuota).toFixed(4) + ((parseFloat(sender.quota).toFixed(4) / 6 / 10) * settings.bonusForMerchants)
        //                 }
        //             })
        //         }

        //         console.log('Seller Valid Children Count: ', validSellerChildrenCount)
        //         console.log('Quota Added: ', parseFloat(senderQuota).toFixed(4))
        //     }

        //     if (teamBuyerCount.length) {
        //         const validBuyerChildrenCount = teamBuyerCount[0].childrenCount - teamBuyerCount[0].childrenMember
        //         const quotaBase = settings.base * validBuyerChildrenCount
        //         recipientQuota = (( quotaBase * validBuyerChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10

        //         console.log('Buyer Valid Children Count: ', validBuyerChildrenCount)
        //         console.log('Quota Added: ', parseFloat(recipientQuota).toFixed(4))

        //         await User.findByIdAndUpdate(recepient._id, {
        //             $inc: { 
        //                 quotaSubWeek: parseFloat(recipientQuota).toFixed(4),
        //                 epavault: parseFloat(recipientQuota).toFixed(2) / 6 / 10,
        //                 epacredits: parseFloat(recipientQuota).toFixed(2) / 6 / 10,
        //                 // epaCreditsMonth: parseFloat(recipientQuota).toFixed(2) /6 / 10,
        //                 ecomVault: parseFloat(recipientQuota).toFixed(2) / 6 / 10,
        //                 // totalIncome: parseFloat(recipientQuota).toFixed(2) / 6 / 10
        //             }
        //         })
        //     }
        // }
        // }

        const tokenValue = JSON.parse(details).stocks ? (parseFloat(JSON.parse(details).price) * settings.highToken + parseFloat(JSON.parse(details).price) * JSON.parse(details).quantity) * 10 : (parseFloat(JSON.parse(details).price) * settings.highToken + parseFloat(JSON.parse(details).price)) * 10
        const priceSrp = JSON.parse(details).stocks ? parseFloat(JSON.parse(details).price) * settings.highToken + parseFloat(JSON.parse(details).price) * JSON.parse(details).quantity : parseFloat(JSON.parse(details).price) * settings.highToken + parseFloat(JSON.parse(details).price)
        const sellerIncome = JSON.parse(details).stocks ? (parseFloat(JSON.parse(details).price) - parseFloat(JSON.parse(details).bonusToken.$numberDecimal)) * JSON.parse(details).quantity + parseFloat(JSON.parse(details).fees.$numberDecimal) + parseFloat(JSON.parse(details).extra.$numberDecimal) : parseFloat(JSON.parse(details).price) - parseFloat(JSON.parse(details).bonusToken.$numberDecimal) + parseFloat(JSON.parse(details).fees.$numberDecimal) + parseFloat(JSON.parse(details).extra.$numberDecimal)
        
        await User.findByIdAndUpdate(sender, {
            $inc: { 
                epacash: sellerIncome + sellerIncome * 0.25, // base price profit of seller
                epatokens: tokenValue * 0.25, // seller gets 25% token you can get
                totalIncome: sellerIncome + sellerIncome * 0.25
            }
        })

        // load of payment from buyer
        const sellerDetails = await User.findOne({ _id: sender })

        const load = await Load({ 
            createdAt: dateTime.DateTime.local().toISO(),
            type: 'Received Order Payment',
            owner: recepient._id,
            sender: recepient.name,
            recipient: sellerDetails.name,
            email: sellerDetails.email,
            mobilenum: sellerDetails.mobilenum,
            amount: parseFloat(sellerIncome).toFixed(2),
            refnum: gpc(12)
        })

        const notif = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: recepient._id,
            type: 'mynotif',
            message: `You earned extra 25% EPA Cash total amount of PHP ${ sellerIncome * 0.25 } from sales item ${ JSON.parse(details).name } !`,
            image: JSON.parse(details).image,
            isRead: false,
            tags: JSON.parse(details).stocks ? 'delivery-product' : 'delivery-service'
        })

        let parentTree = []
        let parentUser = await User.findOne({ _id: recepient.parent })
        let levelCount = 0

        while (parentUser) {
            levelCount ++
            parentTree.push(parentUser)

            if (!parentUser.parent || levelCount === 10)
                break

            parentUser = await User.findOne({ _id: parentUser.parent })
        }

        // let epaVaultCommissionCount = 0

        // parentTree.forEach(async usr => {
        //     if (usr.class !== 'Member' && String(usr._id) !== recepient._id && String(usr._id) !== process.env.EPA_ACCT_ID) {
        //         // Earns 10 levels up for every order depends to your package level
        //         if (!usr.isEpaVaultCommission) {
        //             console.log('Parent Tree | Vault Commission: ', usr.name)
        //             epaVaultCommissionCount ++
        //             await User.findByIdAndUpdate(usr._id, {
        //                 $inc: { 
        //                     // epavault: JSON.parse(details).price * 0.017
        //                     epavault: parseFloat(tokenValue).toFixed(2) / 10, // spread tokens to all 10 levels
        //                     epacredits: parseFloat(tokenValue).toFixed(2) / 10, //
        //                     // epaCreditsMonth: parseFloat(tokenValue).toFixed(2) / 10,
        //                     ecomVault: parseFloat(tokenValue).toFixed(2) / 10,
        //                     totalIncome: parseFloat(tokenValue).toFixed(2) / 10
        //                 }
        //             })
        //         }
        //     }
        // })

        // // Give EPA Account extra bonuses
        // await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
        //     // $inc: { epavault: JSON.parse(details).price * 0.017 * (10 - epaVaultCommissionCount) }
        //     $inc: { 
        //         epavault: ( parseFloat(tokenValue).toFixed(2) / 10 ) * (10 - epaVaultCommissionCount),
        //         epacredits: ( parseFloat(tokenValue).toFixed(2) / 10 ) * (10 - epaVaultCommissionCount),  //mirror
        //         ecomVault: ( parseFloat(tokenValue).toFixed(2) / 10 ) * (10 - epaVaultCommissionCount),
        //         totalIncome: ( parseFloat(tokenValue).toFixed(2) / 10 ) * (10 - epaVaultCommissionCount)
        //     }
        // })

        // console.log('EPA Vault Commission Count: ', epaVaultCommissionCount)
        // console.log('Give EPA Account Vault Extra: ', 10 - epaVaultCommissionCount)

        // await User.findByIdAndUpdate(recepient._id, {
        //     $inc: { 
        //         // epavault: JSON.parse(details).price * 0.017,
        //         epavault: parseFloat(tokenValue).toFixed(2) / 10,
        //         epacredits: parseFloat(tokenValue).toFixed(2) / 10, //mirror
        //         // epaCreditsMonth: parseFloat(tokenValue).toFixed(2) / 10,
        //         epatokens: parseFloat(tokenValue).toFixed(4), // token you can get
        //         ecomVault: parseFloat(tokenValue).toFixed(2) / 10
        //         // totalIncome: parseFloat(tokenValue).toFixed(2) / 10
        //     }
        // })

        // sponsor commission 1% from srp price
        await User.findByIdAndUpdate(recepient.sponsor, {
            $inc: { 
                epavault: parseFloat(priceSrp).toFixed(2) * 0.01,
                epacredits: parseFloat(priceSrp).toFixed(2) * 0.01, //mirror
                // epaCreditsMonth: parseFloat(priceSrp).toFixed(2) * 0.01,
                ecomVault: parseFloat(priceSrp).toFixed(2) * 0.01,
                totalIncome: parseFloat(priceSrp).toFixed(2) * 0.01
            }
        })

        const notif1 = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: recepient._id,
            type: 'mynotif',
            message: `Your order ${ JSON.parse(details).name } has been shipped !`,
            image: JSON.parse(details).image,
            isRead: false,
            tags: JSON.parse(details).stocks ? 'delivery-product' : 'delivery-service'
        })

        const notif2 = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: recepient._id,
            type: 'mynotif',
            // message: `You earned ${ JSON.parse(details).price * 0.017 * 10 } tokens worth PHP ${ String(parseFloat(JSON.parse(details).price * 0.017).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Vault`,
            // message: `You earned ${ String(parseFloat(tokenValue).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } tokens worth PHP ${ String(parseFloat(JSON.parse(details).price * 0.017).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Vault`,
            message: `You earned ${ String(parseFloat(tokenValue).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } tokens worth PHP ${ String(parseFloat(tokenValue / 10).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Vault`,
            image: JSON.parse(details).image,
            isRead: false,
            tags: JSON.parse(details).stocks ? 'delivery-product' : 'delivery-service'
        })

        const notif3 = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: recepient._id,
            type: 'mynotif',
            // message: `You earned ${ JSON.parse(details).price * 0.017 * 10 } tokens worth PHP ${ String(parseFloat(JSON.parse(details).price * 0.017).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Vault`,
            // message: `You earned ${ String(parseFloat(tokenValue).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } tokens worth PHP ${ String(parseFloat(JSON.parse(details).price * 0.017).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Credits`,
            message: `You earned ${ String(parseFloat(tokenValue).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } tokens worth PHP ${ String(parseFloat(tokenValue / 10).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Credits`,
            image: JSON.parse(details).image,
            isRead: false,
            tags: JSON.parse(details).stocks ? 'delivery-product' : 'delivery-service'
        })

        const notif4 = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: sender,
            type: 'mynotif',
            message: `Item ${ JSON.parse(details).name } has been delivered to ${ recepient.name }.`,
            image: JSON.parse(details).image,
            isRead: false,
            tags: JSON.parse(details).stocks ? 'delivery-product' : 'delivery-service'
        })

        const notif5 = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: recepient.sponsor,
            type: 'mynotif',
            // message: `You earned ${ JSON.parse(details).price * 0.01 } tokens worth PHP ${ String(parseFloat(JSON.parse(details).price * 0.017).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Vault`,
            message: `You earned PHP ${ String(parseFloat(JSON.parse(details).price * 0.01).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Vault`,
            image: JSON.parse(details).image,
            isRead: false,
            tags: JSON.parse(details).stocks ? 'delivery-product' : 'delivery-service'
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await delivery.save()
        await load.save()
        await notif.save()
        await notif1.save()
        await notif2.save()
        await notif3.save()
        await notif4.save()
        await notif5.save()
        return res.status(201).json({ message: 'Delivery Created!', delivery })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

// exports.updateDelivery = async (req, res) => {
//     console.log("<<< API PUT UPDATE DELIVERY STATUS >>>")

//     try {
//         const updatedData = req.body
//         const delivery = await Delivery.findOne({ _id: updatedData._id })

//         delivery.deliveryData = []

//         await Delivery.findByIdAndUpdate(updatedData._id, {
//             deliveryData: updatedData.deliveryData
//         })

//         // Protect API for Internal Use Only
//         if (req.header('X-Api-Key') !== process.env.API_KEY)
//             return res.status(403).json({ error: 'Forbidden' })
//         return res.status(201).json({ message: 'Delivery Updated!', delivery })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

exports.getDeliveries = async (req, res) => {
    console.log("<<< API GET ALL DELIVERIES >>>")
    
    try {
        const deliveries = await Delivery.find({}).sort({ createdAt: -1 })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get All Deliveries Success!', deliveries })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

// exports.getDeliverySender = async (req, res) => {
//     console.log("<<< API GET DELIVERY SENDER >>>")

//     try {
//         const { id } = req.params
//         const delivery = await Delivery.find({ sender: id }).sort({ sender: 1 })

//         // Protect API for Internal Use Only
//         if (req.header('X-Api-Key') !== process.env.API_KEY)
//             return res.status(403).json({ error: 'Forbidden' })
//         return res.status(200).json({ message: 'Get Delivery Sender Success!', delivery })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

// exports.getDeliveryRecepient = async (req, res) => {
//     console.log("<<< API GET DELIVERY BUYER >>>")

//     try {
//         const { id } = req.params
//         const delivery = await Delivery.find({ recepient: id }).sort({ recepient: 1 })

//         // Protect API for Internal Use Only
//         if (req.header('X-Api-Key') !== process.env.API_KEY)
//             return res.status(403).json({ error: 'Forbidden' })
//         return res.status(200).json({ message: 'Get Delivery Buyer Success!', delivery })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

// exports.afterShip = async (req, res) => {
//     console.log("<<< API POST AFTERSHIP >>>")

//     try {
//         // const { id } = req.params
//         // const { filename } = req.file
//         // const { name, description, category, price, stocks } = req.body

//         // const delivery = await Delivery({ 
//         //     createdAt: dateTime.DateTime.local().toISO(),
//         //     owner: id,
//         //     image: filename,
//         //     ...req.body
//         // })

//         // // Protect API for Internal Use Only
//         // if (req.header('X-Api-Key') !== process.env.API_KEY || req.header('As-Api-Key') !== process.env.AFTERSHIP_API_KEY)
//         //     return res.status(403).json({ error: 'Forbidden' })
//         // await delivery.save()
//         // return res.status(201).json({ message: 'Delivery Created!', delivery })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }
