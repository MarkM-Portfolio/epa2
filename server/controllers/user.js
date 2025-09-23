const { User, Otp, Setting, Load, Notification } = require('../models/model')
const { ObjectId } = require('mongoose').Types
const jwt = require('jsonwebtoken')
const uuid = require('short-uuid')
const dateTime = require('luxon')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const cron = require('node-cron')
const gpc = require('generate-pincode')

// pixie replace inactive member -- everyday 12 midnight
// cron.schedule('* * * * *', async () => { // change to every later after test
cron.schedule('0 0 * * *', async () => {
    console.log('Cron >> Pixie Replace')
    const today = dateTime.DateTime.now()
    let expiry, expiryDate

    const users = await User.find({ class: 'Member' }).sort({ createdAt: -1 })
    const mainJohn = await User.findOne({ _id: process.env.JOHN_MAIN_ACCT_ID }) // final PROD
    // const mainJohn = await User.findOne({ _id: '65db6295805521d605ebb68f' }) // TEST

    console.log('mainJohn >> ', mainJohn.name)

    for (idx in users) {
        expiry = new Date(new Date().setDate(new Date(users[idx].createdAt).getDate() + 7))
        expiryDate = dateTime.DateTime.fromJSDate(expiry)

        if (today >= expiryDate) {
            console.log('Replace Member: ', users[idx].name, users[idx].class)
            console.log('Created Date: ', users[idx].createdAt)
            console.log('Expiry: ', expiryDate)
            console.log('Today: ', today)

            if (parseFloat(mainJohn.epacredits) < 1000)
                return res.status(422).json({ error: 'Not enough EPA Credits.' })

            // edit user
            await User.findByIdAndUpdate(users[idx]._id, {
                updatedAt: dateTime.DateTime.local().toISO(),
                name: 'Pixie Asis',
                owner: String(mainJohn._id),
                email: `theblessedtrader${ idx }@gmail.com_${ users[idx]._id }`,
                mobilenum: '9260480888',
                password: mainJohn.password,
                class: 'Entrepreneur',
                rank: 'Solopreneur',
                delegatePin: '',
                sponsor: String(mainJohn._id),
                isSubAccount: true
            })

            await bulkPurchasePkg(users[idx])

            // add to mainaccount subs
            await User.findByIdAndUpdate(mainJohn._id, {
                updatedAt: dateTime.DateTime.local().toISO(),
                $push: { subAccounts: users[idx]._id }
            })
        }
    }
})

// auto deduct quota
cron.schedule('0 0 * * SUN', async () => {
    console.log('Cron >> Add Deduct Quota')
    const users = await User.find({}).sort({ createdAt: 1 })

    users.forEach(async usr => {
        if (usr.quota && usr.epatokens && usr.class !== 'Member' && usr.role !== 'admin' && usr.role !== 'admin2') {
            if (parseFloat(usr.quota) < parseFloat(usr.epatokens)) {
                
                console.log('Did\'nt achieve quota: ', usr.name)

                if (usr.isAutoDonateUhw) {
                    console.log('Donated to UHW: ', usr.epatokens.toFixed(4) / 10)

                    await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
                        $inc: { 
                            // epacash: parseFloat(usr.epatokens).toFixed(4) / 10,
                            epavault: parseFloat(usr.epatokens).toFixed(4) / 10,
                            epacredits: parseFloat(usr.epatokens).toFixed(4) / 10,
                            // epaCreditsMonth: parseFloat(usr.epatokens).toFixed(4) / 10
                        }
                    })
                                     
                    await User.findByIdAndUpdate(usr._id, {
                        $inc: {
                            epavault: parseFloat(usr.epatokens).toFixed(4) / 10,
                            epacredits: parseFloat(usr.epatokens).toFixed(4) / 10,
                            ecomVault: parseFloat(usr.epatokens).toFixed(4) / 10,
                            totalIncome: parseFloat(usr.quotaSubWeek).toFixed(2) / 6 / 10
                        },
                        epatokens: 0,
                        quota: parseFloat(usr.quotaSubWeek).toFixed(4),
                        quotaSubWeek: 0
                    })

                    const load = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: 'Sent Donation UHW',
                        owner: user._id,
                        sender: user.name,
                        recipient: epaUser.name,
                        email: epaUser.email,
                        mobilenum: epaUser.mobilenum,
                        eWalletnum: epaUser.eWalletnum,
                        amount: parseFloat(amount).toFixed(2),
                        refnum: gpc(12)
                    })
            
                    // add to notifications
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: id,
                        type: 'mynotif',
                        message: `Sent ${ parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } Donation to UHW`,
                        isRead: false,
                        tags: 'epacash'
                    })

                    const notif2 = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: id,
                        type: 'mynotif',
                        message: `Congratulations! You have achieved your weekly quota. Blessings PHP ${ parseFloat(usr.epatokens).toFixed(4) / 10 } to EPA Vault. Visit UHW for the blessigs you have received`,
                        isRead: false,
                        tags: 'epacash'
                    })

                    await load.save()
                    await notif.save()
                    await notif2.save()
                } else {
                    await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
                        $inc: { 
                            // epacash: parseFloat(usr.epatokens).toFixed(4) / 10,
                            epavault: parseFloat(usr.epatokens).toFixed(4) / 10,
                            epacredits: parseFloat(usr.epatokens).toFixed(4) / 10,
                            ecomVault: parseFloat(usr.epatokens).toFixed(4) / 10,
                            // epaCreditsMonth: parseFloat(usr.epatokens).toFixed(4) / 10
                        }
                    })
                    // Suspended
                    await User.findByIdAndUpdate(usr._id, {
                        // $inc: {
                        //     epavault: parseFloat(usr.epatokens).toFixed(4) / 10,
                        //     epacredits: parseFloat(usr.epatokens).toFixed(4) / 10,
                        //     totalIncome: parseFloat(usr.quotaSubWeek).toFixed(2) / 6 / 10
                        // },
                        epatokens: 0,
                        quota: parseFloat(usr.quotaSubWeek).toFixed(4),
                        quotaSubWeek: 0,
                        isSuspended: true
                    })

                    // add to notifications
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: id,
                        type: 'mynotif',
                        message: `Suspended due to non-compliance`,
                        isRead: false,
                        tags: 'epacash'
                    })

                    await notif.save()
                }
            } else {
                // Achieved Target Quota
                console.log('Achieved quota: ', usr.name)

                await User.findByIdAndUpdate(usr._id, {
                    $inc: {
                        epavault: parseFloat(usr.epatokens).toFixed(4) / 10,
                        epacredits: parseFloat(usr.epatokens).toFixed(4) / 10,
                        ecomVault: parseFloat(usr.epatokens).toFixed(4) / 10,
                        totalIncome: parseFloat(usr.quotaSubWeek).toFixed(2) / 6 / 10
                    },
                    epatokens: 0,
                    quota: parseFloat(usr.quotaSubWeek).toFixed(4),
                    quotaSubWeek: 0
                })

                // add to notifications
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: id,
                    type: 'mynotif',
                    message: `Congratulations! You have achieved your weekly quota. Blessings PHP ${ parseFloat(usr.epatokens).toFixed(4) / 10 } to EPA Vault. Visit UHW for the blessigs you have received`,
                    isRead: false,
                    tags: 'epacash'
                })

                await notif.save()
            }
        }
    })
    // await User.updateMany({}, { $set: { isAutoDonateUhw: false } })
})

// give allowances 'Employed & Self-Employed'
cron.schedule('0 0 * * SAT', async () => {
    console.log('Cron >> Give Allowance')
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
                    'email': usr.children[idx].email,
                    'avatar': usr.children[idx].avatar,
                    'class': usr.children[idx].class,
                    'rank': usr.children[idx].rank,
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

    const users = await User.find({}).sort({ createdAt: 1 })

    users.forEach(async usr => {
        const userTeams = await User.aggregate([
            { $match: { _id: new ObjectId(usr._id) }},
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
                children: { $push: '$children' }
            }}
        ])
    
        let teamCount = []
    
        if (userTeams.length) {
            teamCount = await User.aggregate([
                { $match: { _id: new ObjectId(usr._id) } },
                { $graphLookup: {
                    from: 'users',
                    startWith: '$children._id',
                    connectFromField: 'children._id',
                    connectToField: '_id',
                    as: 'allChildren',
                    depthField: 'depth'
                  }
                },
                { $addFields: {
                    childrenMember: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Member' ] }}
                    }},
                    childrenEntrep: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Entrepreneur' ] }}
                    }},
                    childrenSupervisor: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Supervisor' ] }}
                    }},
                    childrenManager: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Manager' ] }}
                    }},
                    childrenCeo: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'CEO' ] }}
                    }},
                    childrenBusiness: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Business Empire' ] }}
                    }},
                    childrenSilver: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Silver' ] }}
                    }},
                    childrenGold: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Gold' ] }}
                    }}
                }},
                { $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    salaryEmployed: { $first: '$salaryEmployed' },
                    salarySelfEmployed: { $first: '$salarySelfEmployed' },
                    salaryPension: { $first: '$salaryPension' },
                    dependents: { $first: '$dependents' },
                    childrenCount: { $sum: { $size: '$allChildren' } },
                    childrenMember: { $first: '$childrenMember' },
                    childrenEntrep: { $first: '$childrenEntrep' },
                    childrenSupervisor: { $first: '$childrenSupervisor' },
                    childrenManager: { $first: '$childrenManager' },
                    childrenCeo: { $first: '$childrenCeo' },
                    childrenBusiness: { $first: '$childrenBusiness' },
                    childrenSilver: { $first: '$childrenSilver' },
                    childrenGold: { $first: '$childrenGold' }
                }}
            ])
        }
    
        // let childrenCount = 0, childrenEntrep = 0, childrenSupervisor = 0,
        //     childrenManager = 0, childrenCeo = 0, childrenBusiness = 0, childrenMember = 0
    
        // if (teamCount.length) {
        //     childrenCount = teamCount[0].childrenCount
        //     childrenEntrep = teamCount[0].childrenEntrep
        //     childrenSupervisor = teamCount[0].childrenSupervisor
        //     childrenManager = teamCount[0].childrenManager
        //     childrenCeo = teamCount[0].childrenCeo
        //     childrenBusiness = teamCount[0].childrenBusiness
        //     childrenMember = teamCount[0].childrenMember
        // }
    
        // console.log('Children Count : ', teamCount[0].name, childrenCount)
        // console.log('Children Entrepreneur Count : ', teamCount[0].name, childrenEntrep)
        // console.log('Children Supervisor Count : ', teamCount[0].name, childrenSupervisor)
        // console.log('Children Manager Count : ', teamCount[0].name, childrenManager)
        // console.log('Children CEO Count : ', teamCount[0].name, childrenCeo)
        // console.log('Children Business Empire Count : ', teamCount[0].name, childrenBusiness)
        // console.log('Valid Children Count : ', teamCount[0].name, childrenCount - childrenMember)

        const settings = await Setting.findOne({})

        if ((childrenCount - childrenMember) >= settings.allowanceJBA && teamCount[0].isVerified) { // weekly activate
            console.log('Valid Children Count : ', teamCount[0].name, childrenCount - childrenMember)

            // dependents bonus
            await User.findByIdAndUpdate(teamCount[0]._id, {
                $inc: { epacash: 2250 }
            })

            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: teamCount[0]._id,
                type: 'mynotif',
                message: `You received PHP ${ 2250 } personal allowance to EPA Cash.`,
                isRead: false,
                tags: 'allowance'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Received for personal allowance`,
                owner: teamCount[0]._id,
                sender: teamCount[0].name,
                recipient: teamCount[0].name,
                email: teamCount[0].email,
                mobilenum: teamCount[0].mobilenum,
                eWalletnum: teamCount[0].eWalletnum,
                amount: parseFloat(2250).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        }
        
        if ((childrenCount - childrenMember) >= settings.dependentsJBA && teamCount[0].isVerified && teamCount[0].gender === 'female' && teamCount[0].dependents > 0) { // weekly activate
            console.log('Valid Children Count : ', teamCount[0].name, childrenCount - childrenMember)
            console.log('# of Dependents : ', teamCount[0].name, teamCount[0].dependents)

            // dependents bonus
            await User.findByIdAndUpdate(teamCount[0]._id, {
                $inc: {
                    epacash: 2250 * teamCount[0].dependents
                }
            })

            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: teamCount[0]._id,
                type: 'mynotif',
                message: `You received PHP ${ parseFloat(2250 * teamCount[0].dependents).toFixed(2) } allowance for children support benefits to EPA Cash.`,
                isRead: false,
                tags: 'allowance'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Received for children support benefits`,
                owner: teamCount[0]._id,
                sender: teamCount[0].name,
                recipient: teamCount[0].name,
                email: teamCount[0].email,
                mobilenum: teamCount[0].mobilenum,
                eWalletnum: teamCount[0].eWalletnum,
                amount: parseFloat(2250 * teamCount[0].dependents).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        }

        if ((childrenCount - childrenMember) >= settings.employedJBA && teamCount[0].isVerified && parseFloat(teamCount[0].salaryEmployed) > 0) { // weekly activate
            console.log('Valid Children Count : ', teamCount[0].name, childrenCount - childrenMember)
            console.log('Salary Employed : ', teamCount[0].name, parseFloat(teamCount[0].salaryEmployed))

            if (parseFloat(teamCount[0].salaryEmployed) <= 10000) {
                await User.findByIdAndUpdate(teamCount[0]._id, {
                    $inc: {
                        epavault: (( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) * 0.66666667, // 2/3
                        epacredits: (( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) * 0.66666667,
                        epacash: (( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) / 3 // 1/3
                    }
                })

                // Add to notifications
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: teamCount[0]._id,
                    type: 'mynotif',
                    message: `You received triple (3x) employed salary benefits of PHP ${ parseFloat((( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) * 0.66666667).toFixed(2) } to EPA Vault`,
                    isRead: false,
                    tags: 'allowance'
                })

                const notif2 = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: teamCount[0]._id,
                    type: 'mynotif',
                    message: `You received triple (3x) employed salary benefits of PHP ${ parseFloat((( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) / 3).toFixed(2) } to EPA Cash`,
                    isRead: false,
                    tags: 'allowance'
                })
        
                const load = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Received triple (3x) employed salary benefits to EPA Vault`,
                    owner: teamCount[0]._id,
                    sender: teamCount[0].name,
                    recipient: teamCount[0].name,
                    email: teamCount[0].email,
                    mobilenum: teamCount[0].mobilenum,
                    eWalletnum: teamCount[0].eWalletnum,
                    amount: parseFloat((( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) * 0.66666667).toFixed(2),
                    refnum: gpc(12)
                })

                const load2 = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Received triple (3x) employed salary benefits to EPA Cash`,
                    owner: teamCount[0]._id,
                    sender: teamCount[0].name,
                    recipient: teamCount[0].name,
                    email: teamCount[0].email,
                    mobilenum: teamCount[0].mobilenum,
                    eWalletnum: teamCount[0].eWalletnum,
                    amount: parseFloat((( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) / 3).toFixed(2),
                    refnum: gpc(12)
                })

                await notif.save()
                await notif2.save()
                await load.save()
                await load2.save()
            }
            
            if ((childrenCount - childrenMember) >= settings.maxEmployedJBA) {
                console.log('Valid Children Count : ', teamCount[0].name, childrenCount - childrenMember)
                console.log('Salary Employed : ', teamCount[0].name, parseFloat(teamCount[0].salaryEmployed))
                
                if (parseFloat(teamCount[0].salaryEmployed) >= 10000 && parseFloat(teamCount[0].salaryEmployed) < 100000) {
                    await User.findByIdAndUpdate(teamCount[0]._id, {
                        $inc: {
                            epavault: (( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) * 0.66666667, // 2/3
                            epacredits: (( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) * 0.66666667,
                            epacash: (( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) / 3 // 1/3
                        }
                    })

                    // Add to notifications
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received triple (3x) employed salary benefits of PHP ${ parseFloat((( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) * 0.66666667).toFixed(2) } to EPA Vault`,
                        isRead: false,
                        tags: 'allowance'
                    })

                    const notif2 = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received triple (3x) employed salary benefits of PHP ${ parseFloat((( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) / 3).toFixed(2) } to EPA Cash`,
                        isRead: false,
                        tags: 'allowance'
                    })
            
                    const load = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received triple (3x) employed salary benefits to EPA Vault`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat((( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) * 0.66666667).toFixed(2),
                        refnum: gpc(12)
                    })

                    const load2 = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received triple (3x) employed salary benefits to EPA Cash`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat((( parseFloat(teamCount[0].salaryEmployed) / 4 ) * 3 ) / 3).toFixed(2),
                        refnum: gpc(12)
                    })

                    await notif.save()
                    await notif2.save()
                    await load.save()
                    await load2.save()
                } 

                if (parseFloat(teamCount[0].salaryEmployed) >= 100000) {
                    await User.findByIdAndUpdate(teamCount[0]._id, {
                        $inc: {
                            epavault: (( parseFloat(100000) / 4 ) * 3 ) * 0.66666667, // 2/3
                            epacredits: (( parseFloat(100000) / 4 ) * 3 ) * 0.66666667,
                            epacash: (( parseFloat(100000) / 4 ) * 3 ) / 3 // 1/3
                        }
                    })

                    // Add to notifications
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received triple (3x) employed salary benefits of PHP ${ parseFloat((( parseFloat(100000) / 4 ) * 3 ) * 0.66666667).toFixed(2) } to EPA Vault`,
                        isRead: false,
                        tags: 'allowance'
                    })

                    const notif2 = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received triple (3x) employed salary benefits of PHP ${ parseFloat((( parseFloat(100000) / 4 ) * 3 ) / 3).toFixed(2) } to EPA Cash`,
                        isRead: false,
                        tags: 'allowance'
                    })
            
                    const load = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received triple (3x) employed salary benefits to EPA Vault`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat((( parseFloat(100000) / 4 ) * 3 ) * 0.66666667).toFixed(2),
                        refnum: gpc(12)
                    })

                    const load2 = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received triple (3x) employed salary benefits to EPA Cash`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat((( parseFloat(100000) / 4 ) * 3 ) / 3).toFixed(2),
                        refnum: gpc(12)
                    })

                    await notif.save()
                    await notif2.save()
                    await load.save()
                    await load2.save()
                } 
            }
        }

        if ((childrenCount - childrenMember) >= settings.selfEmployedJBA && teamCount[0].isVerified && parseFloat(teamCount[0].salarySelfEmployed) > 0) { // weekly activate
            console.log('Valid Children Count : ', teamCount[0].name, childrenCount - childrenMember)
            console.log('Salary Self-Employed : ', teamCount[0].name, parseFloat(teamCount[0].salarySelfEmployed))

            if (parseFloat(teamCount[0].selfEmployedJBA) <= 10000) {
                await User.findByIdAndUpdate(teamCount[0]._id, {
                    $inc: {
                        epavault: (( parseFloat(teamCount[0].salarySelfEmployed) / 4 ) * 3 ) * 0.66666667, // 2/3
                        epacredits: (( parseFloat(teamCount[0].salarySelfEmployed) / 4 ) * 3 ) * 0.66666667,
                        epacash: (( parseFloat(teamCount[0].salarySelfEmployed) / 4 ) * 3 ) / 3 // 1/3
                    }
                })

                // Add to notifications
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: teamCount[0]._id,
                    type: 'mynotif',
                    message: `You received triple (3x) self-employed salary benefits of PHP ${ parseFloat((( parseFloat(teamCount[0].selfEmployedJBA) / 4 ) * 3 ) * 0.66666667).toFixed(2) } to EPA Vault`,
                    isRead: false,
                    tags: 'allowance'
                })

                const notif2 = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: teamCount[0]._id,
                    type: 'mynotif',
                    message: `You received triple (3x) self-employed salary benefits of PHP ${ parseFloat((( parseFloat(teamCount[0].selfEmployedJBA) / 4 ) * 3 ) / 3).toFixed(2) } to EPA Cash`,
                    isRead: false,
                    tags: 'allowance'
                })
        
                const load = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Received triple (3x) self-employed salary benefits to EPA Vault`,
                    owner: teamCount[0]._id,
                    sender: teamCount[0].name,
                    recipient: teamCount[0].name,
                    email: teamCount[0].email,
                    mobilenum: teamCount[0].mobilenum,
                    eWalletnum: teamCount[0].eWalletnum,
                    amount: parseFloat((( parseFloat(teamCount[0].selfEmployedJBA) / 4 ) * 3 ) * 0.66666667).toFixed(2),
                    refnum: gpc(12)
                })

                const load2 = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Received triple (3x) self-employed salary benefits to EPA Cash`,
                    owner: teamCount[0]._id,
                    sender: teamCount[0].name,
                    recipient: teamCount[0].name,
                    email: teamCount[0].email,
                    mobilenum: teamCount[0].mobilenum,
                    eWalletnum: teamCount[0].eWalletnum,
                    amount: parseFloat((( parseFloat(teamCount[0].selfEmployedJBA) / 4 ) * 3 ) / 3).toFixed(2),
                    refnum: gpc(12)
                })

                await notif.save()
                await notif2.save()
                await load.save()
                await load2.save()
            }
            
            if ((childrenCount - childrenMember) >= settings.maxSelfEmployedJBA) {
                if (parseFloat(teamCount[0].salarySelfEmployed) >= 10000 && parseFloat(teamCount[0].salarySelfEmployed) < 100000) {
                    await User.findByIdAndUpdate(teamCount[0]._id, {
                        $inc: {
                            epavault: (( parseFloat(teamCount[0].salarySelfEmployed) / 4 ) * 3 ) * 0.66666667, // 2/3
                            epacredits: (( parseFloat(teamCount[0].salarySelfEmployed) / 4 ) * 3 ) * 0.66666667,
                            epacash: (( parseFloat(teamCount[0].salarySelfEmployed) / 4 ) * 3 ) / 3 // 1/3
                        }
                    })
    
                    // Add to notifications
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received triple (3x) self-employed salary benefits of PHP ${ parseFloat((( parseFloat(teamCount[0].selfEmployedJBA) / 4 ) * 3 ) * 0.66666667).toFixed(2) } to EPA Vault`,
                        isRead: false,
                        tags: 'allowance'
                    })
    
                    const notif2 = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received triple (3x) self-employed salary benefits of PHP ${ parseFloat((( parseFloat(teamCount[0].selfEmployedJBA) / 4 ) * 3 ) / 3).toFixed(2) } to EPA Cash`,
                        isRead: false,
                        tags: 'allowance'
                    })
            
                    const load = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received triple (3x) self-employed salary benefits to EPA Vault`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat((( parseFloat(teamCount[0].selfEmployedJBA) / 4 ) * 3 ) * 0.66666667).toFixed(2),
                        refnum: gpc(12)
                    })
    
                    const load2 = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received triple (3x) self-employed salary benefits to EPA Cash`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat((( parseFloat(teamCount[0].selfEmployedJBA) / 4 ) * 3 ) / 3).toFixed(2),
                        refnum: gpc(12)
                    })
    
                    await notif.save()
                    await notif2.save()
                    await load.save()
                    await load2.save()
                } 

                if (parseFloat(teamCount[0].salarySelfEmployed) >= 100000) {
                    await User.findByIdAndUpdate(teamCount[0]._id, {
                        $inc: {
                            epavault: (( parseFloat(100000) / 4 ) * 3 ) * 0.66666667, // 2/3
                            epacredits: (( parseFloat(100000) / 4 ) * 3 ) * 0.66666667,
                            epacash: (( parseFloat(100000) / 4 ) * 3 ) / 3 // 1/3
                        }
                    })

                    // Add to notifications
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received triple (3x) self-employed salary benefits of PHP ${ parseFloat((( parseFloat(100000) / 4 ) * 3 ) * 0.66666667).toFixed(2) } to EPA Vault`,
                        isRead: false,
                        tags: 'allowance'
                    })

                    const notif2 = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received triple (3x) self-employed salary benefits of PHP ${ parseFloat((( parseFloat(100000) / 4 ) * 3 ) / 3).toFixed(2) } to EPA Cash`,
                        isRead: false,
                        tags: 'allowance'
                    })
            
                    const load = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received triple (3x) self-employed salary benefits to EPA Vault`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat((( parseFloat(100000) / 4 ) * 3 ) * 0.66666667).toFixed(2),
                        refnum: gpc(12)
                    })

                    const load2 = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received triple (3x) self-employed salary benefits to EPA Cash`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat((( parseFloat(100000) / 4 ) * 3 ) / 3).toFixed(2),
                        refnum: gpc(12)
                    })

                    await notif.save()
                    await notif2.save()
                    await load.save()
                    await load2.save()
                } 
            }
        }
    })
})

// give allowances 'Pension' // every month
cron.schedule('0 0 1 * *', async () => {
    console.log('Cron >> Give Allowance Pension')

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
                    'email': usr.children[idx].email,
                    'avatar': usr.children[idx].avatar,
                    'class': usr.children[idx].class,
                    'rank': usr.children[idx].rank,
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

    const users = await User.find({}).sort({ createdAt: 1 })

    users.forEach(async usr => {
        const userTeams = await User.aggregate([
            { $match: { _id: new ObjectId(usr._id) }},
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
                children: { $push: '$children' }
            }}
        ])
    
        let teamCount = []
    
        if (userTeams.length) {
            teamCount = await User.aggregate([
                { $match: { _id: new ObjectId(usr._id) } },
                { $graphLookup: {
                    from: 'users',
                    startWith: '$children._id',
                    connectFromField: 'children._id',
                    connectToField: '_id',
                    as: 'allChildren',
                    depthField: 'depth'
                  }
                },
                { $addFields: {
                    childrenMember: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Member' ] }}
                    }},
                    childrenEntrep: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Entrepreneur' ] }}
                    }},
                    childrenSupervisor: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Supervisor' ] }}
                    }},
                    childrenManager: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Manager' ] }}
                    }},
                    childrenCeo: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'CEO' ] }}
                    }},
                    childrenBusiness: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Business Empire' ] }}
                    }},
                    childrenSilver: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Silver' ] }}
                    }},
                    childrenGold: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Gold' ] }}
                    }}
                }},
                { $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    salaryEmployed: { $first: '$salaryEmployed' },
                    salarySelfEmployed: { $first: '$salarySelfEmployed' },
                    salaryPension: { $first: '$salaryPension' },
                    dependents: { $first: '$dependents' },
                    childrenCount: { $sum: { $size: '$allChildren' } },
                    childrenMember: { $first: '$childrenMember' },
                    childrenEntrep: { $first: '$childrenEntrep' },
                    childrenSupervisor: { $first: '$childrenSupervisor' },
                    childrenManager: { $first: '$childrenManager' },
                    childrenCeo: { $first: '$childrenCeo' },
                    childrenBusiness: { $first: '$childrenBusiness' },
                    childrenSilver: { $first: '$childrenSilver' },
                    childrenGold: { $first: '$childrenGold' }
                }}
            ])
        }

        const settings = await Setting.findOne({})

        if ((childrenCount - childrenMember) >= settings.pensionJBA && teamCount[0].isVerified && parseFloat(teamCount[0].salaryPension) > 0) {
            console.log('Valid Children Count : ', teamCount[0].name, childrenCount - childrenMember)
            console.log('Pension : ', teamCount[0].name, parseFloat(teamCount[0].salaryPension))

            if (parseFloat(teamCount[0].salaryPension) <= 10000) {
                await User.findByIdAndUpdate(teamCount[0]._id, {
                    $inc: {
                        epavault: parseFloat(teamCount[0].salaryPension), // 1/2
                        epacredits: parseFloat(teamCount[0].salaryPension),
                        epacash: parseFloat(teamCount[0].salaryPension) // 1/2
                    }
                })

                // Add to notifications
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: teamCount[0]._id,
                    type: 'mynotif',
                    message: `You received double (2x) pension benefits of PHP ${ parseFloat(teamCount[0].salaryPension).toFixed(2) } to EPA Vault`,
                    isRead: false,
                    tags: 'allowance'
                })

                const notif2 = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: teamCount[0]._id,
                    type: 'mynotif',
                    message: `You received double (2x) pension benefits of PHP ${ parseFloat(teamCount[0].salaryPension).toFixed(2) } to EPA Cash`,
                    isRead: false,
                    tags: 'allowance'
                })
        
                const load = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Received double (2x) pension benefits to EPA Vault`,
                    owner: teamCount[0]._id,
                    sender: teamCount[0].name,
                    recipient: teamCount[0].name,
                    email: teamCount[0].email,
                    mobilenum: teamCount[0].mobilenum,
                    eWalletnum: teamCount[0].eWalletnum,
                    amount: parseFloat(teamCount[0].salaryPension).toFixed(2),
                    refnum: gpc(12)
                })

                const load2 = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Received double (2x) pension benefits to EPA Cash`,
                    owner: teamCount[0]._id,
                    sender: teamCount[0].name,
                    recipient: teamCount[0].name,
                    email: teamCount[0].email,
                    mobilenum: teamCount[0].mobilenum,
                    eWalletnum: teamCount[0].eWalletnum,
                    amount: parseFloat(teamCount[0].salaryPension).toFixed(2),
                    refnum: gpc(12)
                })

                await notif.save()
                await notif2.save()
                await load.save()
                await load2.save()                
            }
            
            if ((childrenCount - childrenMember) >= settings.maxPensionJBA) {
                if (parseFloat(teamCount[0].salaryPension) >= 10000 && parseFloat(teamCount[0].salaryPension) < 100000) {
                    await User.findByIdAndUpdate(teamCount[0]._id, {
                        $inc: {
                            epavault: parseFloat(teamCount[0].salaryPension), // 1/2
                            epacredits: parseFloat(teamCount[0].salaryPension),
                            epacash: parseFloat(teamCount[0].salaryPension) // 1/2
                        }
                    })

                    // Add to notifications
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received double (2x) pension benefits of PHP ${ parseFloat(teamCount[0].salaryPension).toFixed(2) } to EPA Vault`,
                        isRead: false,
                        tags: 'allowance'
                    })

                    const notif2 = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received double (2x) pension benefits of PHP ${ parseFloat(teamCount[0].salaryPension).toFixed(2) } to EPA Cash`,
                        isRead: false,
                        tags: 'allowance'
                    })
            
                    const load = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received double (2x) pension benefits to EPA Vault`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat(teamCount[0].salaryPension).toFixed(2),
                        refnum: gpc(12)
                    })

                    const load2 = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received double (2x) pension benefits to EPA Cash`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat(teamCount[0].salaryPension).toFixed(2),
                        refnum: gpc(12)
                    })

                    await notif.save()
                    await notif2.save()
                    await load.save()
                    await load2.save()      
                } 

                if (parseFloat(teamCount[0].salaryPension) >= 100000) {
                    await User.findByIdAndUpdate(teamCount[0]._id, {
                        $inc: {
                            epavault: parseFloat(100000), // 1/2
                            epacredits: parseFloat(100000),
                            epacash: parseFloat(100000) // 1/2
                        }
                    })

                    // Add to notifications
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received double (2x) pension benefits of PHP ${ parseFloat(100000).toFixed(2) } to EPA Vault`,
                        isRead: false,
                        tags: 'allowance'
                    })

                    const notif2 = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: teamCount[0]._id,
                        type: 'mynotif',
                        message: `You received double (2x) pension benefits of PHP ${ parseFloat(100000).toFixed(2) } to EPA Cash`,
                        isRead: false,
                        tags: 'allowance'
                    })
            
                    const load = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received double (2x) pension benefits to EPA Vault`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat(100000).toFixed(2),
                        refnum: gpc(12)
                    })

                    const load2 = await Load({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        type: `Received double (2x) pension benefits to EPA Cash`,
                        owner: teamCount[0]._id,
                        sender: teamCount[0].name,
                        recipient: teamCount[0].name,
                        email: teamCount[0].email,
                        mobilenum: teamCount[0].mobilenum,
                        eWalletnum: teamCount[0].eWalletnum,
                        amount: parseFloat(100000).toFixed(2),
                        refnum: gpc(12)
                    })

                    await notif.save()
                    await notif2.save()
                    await load.save()
                    await load2.save()      
                } 
            }
        }
    })
})

// vault monthly
cron.schedule('0 0 1 * *', async () => {
    console.log('Cron >> Vault Monthly')
    const users = await User.find({}).sort({ createdAt: 1 })

    users.forEach(async usr => {
        if (usr.epavault && usr.class !== 'Member' && String(usr._id) !== process.env.EPA_ACCT_ID) {
            console.log('Monthly Vault Interest')

            const settings = await Setting.findOne({})

            let interestCreditMonth = parseFloat(usr.epaCreditsMonth).toFixed(2) * 0.03 + parseFloat(usr.epaCreditsMonth).toFixed(2)

            await User.findByIdAndUpdate(usr._id, {
                $inc: { 
                    epavault: -parseFloat(interestCreditMonth).toFixed(2)
                },
                epaCreditsMonth: 0
            })

            await User.findByIdAndUpdate(usr._id, {
                $inc: { 
                    epavault: parseFloat(usr.epavault).toFixed(2) * settings.monthlyVaultInterest 
                }
            })

            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: usr._id,
                type: 'mynotif',
                message: `You have cleared your monthly dues.`,
                isRead: false,
                tags: 'epavault'
            })

            await notif.save()

            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Monthly Dues`,
                owner: usr._id,
                sender: usr.name,
                recipient: usr.name,
                email: usr.email,
                mobilenum: usr.mobilenum,
                eWalletnum: usr.eWalletnum,
                amount: parseFloat(interestCreditMonth).toFixed(2),
                refnum: gpc(12)
            })

            await load.save()

            const notif2 = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: usr._id,
                type: 'mynotif',
                message: `Congratulations! You have earned 1.5% equivalent to PHP ${ parseFloat(usr.epavault).toFixed(2) * settings.monthlyVaultInterest  } of your money in EPA vault.`,
                isRead: false,
                tags: 'epavault'
            })

            await notif2.save()

            const load2 = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Monthly Interest`,
                owner: usr._id,
                sender: usr.name,
                recipient: usr.name,
                email: usr.email,
                mobilenum: usr.mobilenum,
                eWalletnum: usr.eWalletnum,
                amount: parseFloat(interestCreditMonth).toFixed(2),
                refnum: gpc(12)
            })

            await load2.save()
        }
    })
    // await User.updateMany({}, { $set: { isAutoDonateUhw: false } })
})

exports.registerUsers = async (req, res) => {
    console.log("<<< API POST REGISTER USER >>>")

    try {
        const { name, email, mobilenum, password, refCode } = req.body

        const shippingAddress = {
            address: '', city: '', province: '', zipcode: '', country: 'Philippines'
        }

        // const isNameExist = await User.isNameInUse(name)
        const isEmailExist = await User.isEmailInUse(email)
        const isMobileExist = await User.isMobileInUse(mobilenum)
        const isReferred = await User.addRef(refCode)

        const user = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: name,
            email: email.toLowerCase(),
            areacode: '+63',
            mobilenum: mobilenum,
            password: password,
            shippingAddress,
            sponsor: isReferred ? isReferred._id : '',
            children: [],
            parent: '',
            isEpaCreditCommission: false,
            isEpaVaultCommission: false,
            isEpaUpgradeCommission: false,
            isLegsComplete: false,
            teams: [],
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            isAutoDonateUhw: true,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'enduser',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            religion: '',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: false,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        // if (!isNameExist) return res.status(422).json({ error: 'Name is already in use, try logging in.' })
        if (!isEmailExist) return res.status(422).json({ error: 'Email is already in use, try logging in.' })
        if (!isMobileExist) return res.status(422).json({ error: 'Mobile number is already in use, try logging in.' })
        if (!isReferred) return res.status(422).json({ error: 'Reference number does not exist.' })

        // auto create EPA accounts
        const settings = await Setting.findOne({})

        console.log('Check Auto Create EPA Settings: ', settings.isAutoCreateEpa)

        const refUser = await User.findOne({ refnum: refCode })
        const userRef = await User.addRef(refUser.refnum)
        // const epaRef = await User.findOne({ _id: process.env.EPA_ACCT_ID })

        // epaRef.children.forEach((item, idx) => {
        //     console.log('team & length >>', item, item.length)
        //     console.log('idx >>', idx)
        //     //level 1 //idx 0
        //     if (item.length !== 3) {
        //         console.log('write idx here >> ', idx)
        //         epaRef.children.push(user)
        //     } else {
        //         break
        //     }                        
        // })


        // console.log('epaRef children output ', epaRef.children)

        // epaRef.children.forEach(item => {
        //     console.log('children >>', item)
        //     console.log('children length >>', item.length)
        //     console.log('check boolean >>', item.length !== 3)

        //     if (item.length !== 3) {
        //         console.log('write idx here >> ', item.length - 1)
        //     } else {
        //         console.log('BREAK!!')
        //         break
        //     }
        // })

        // for (legs in epaRef.children) {
        //     console.log('children >>', lvl)
        //     console.log('children length >>', lvl.length)
        //     console.log('idx >>', lvl.length - 1)
        //     console.log('check boolean >>', lvl.length !== 3)
            // if (!item.length) {
            //     item.push(user)
            // }

        //     if (item.length !== 3) {
        //         console.log('write idx here >> ', item.length - 1)
        //     } else {
        //         console.log('BREAK!!')
        //         break
        //     }
        // }


        // if (settings.isAutoCreateEpa) {
        //     const epaRef = await User.findOne({ _id: process.env.EPA_ACCT_ID })

        //     for (const lvl in epaRef.children) {
        //         if (!epaRef.children[lvl].length)
        //             await createEpaAccount(epaRef, lvl, false)
        //         else
        //             break
        //     }
        // }

        // const refUser = await User.findOne({ refnum: refCode })
        // const userRef = await User.addRef(refUser.refnum)
        // const epaRefWrite = await User.findOne({ _id: process.env.EPA_ACCT_ID })

        // // write to EPA account children
        // if (process.env.EPA_ACCT_ID !== String(userRef._id)) {
        //     for (const lvl in epaRefWrite.children) {
        //         if (lvl === 'level1') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 3) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 3) {
        //                     console.log('epaRefWrite.children[lvl].length >> ', lvl, epaRefWrite.children[lvl].length)
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }

        //         if (lvl === 'level2') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 9) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 9) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }

        //         if (lvl === 'level3') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 27) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 27) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }

        //         if (lvl === 'level4') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 81) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 81) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }

        //         if (lvl === 'level5') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 243) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 243) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }

        //         if (lvl === 'level6') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 729) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 729) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }

        //         if (lvl === 'level7') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 2187) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 2187) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }

        //         if (lvl === 'level8') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 6561) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 6561) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }

        //         if (lvl === 'level9') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 19683) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 19683) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }

        //         if (lvl === 'leve10') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 59049) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 59049) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }
        //     }
        // }

        // const epaRefUpdate = await User.findOne({ _id: process.env.EPA_ACCT_ID })

        // console.log("Sponsor Name: ", userRef.name)

        // let teamsCount = 1 // set to 1 to add the newly registered user

        // for (const lvl in userRef.children) {
        //     teamsCount += userRef.children[lvl].length

        //     if (lvl === 'level1') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 3) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 3) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level2') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 9) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 9) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level3') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 27) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 27) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level4') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 81) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 81) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level5') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 243) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 243) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level6') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 729) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 729) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level7') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 2187) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 2187) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level8') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 6561) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 6561) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level9') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 19683) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 19683) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'leve10') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 59049) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 59049) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }
        // }

        const writeUser = await User.aggregate([
            { $match: { _id: userRef._id } },
            { $project: {
                name: '$name',
                childrenCount: { $cond: { if: { $isArray: '$children' }, then: { $size: '$children' }, else: 'N/A'} },
                children: '$children'
            }},
            { $match: { childrenCount: { $lt: 3 } } },
            { $sort: { createdAt: 1 } },
            { $limit: 1 },
            { $addFields: {
                children: { $concatArrays: [ '$children', [ user ] ] }
            }}
        ] )

        if (!writeUser.length) {
            const teams = await User.aggregate([
                { $match: { _id: userRef._id } },
                { $unwind: '$teams' },
                { $lookup: {
                    from: 'users',
                    localField: 'teams',
                    foreignField: '_id',
                    as: 'team_users'
                }},
                { $unwind: '$team_users' },
                { $addFields: {
                    childrenSize: { $size: '$team_users.children' }
                }},
                { $match: { childrenSize: { $lt: 3 } } },
                { $project: {
                    user: '$team_users'
                }}
            ])

            writeUser.push(Object.assign(writeUser, teams[0].user))
        }

        const parentUser = await User.findOne({ _id: writeUser[0]._id })

        const newChild = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            class: user.class,
            rank: user.rank,
            children: user.children
        }

        await User.findByIdAndUpdate(parentUser._id, {
            $push: { children: newChild, teams: user._id }
        })

        // parent is not the sponsor
        if (String(parentUser._id) !== String(userRef._id)) {
            // sponsor bonus
            await User.findByIdAndUpdate(userRef._id, {
                $push: { teams: user._id }
            })
        }

        // save parent to new registered user 
        user.parent = parentUser._id

        console.log('Parent User >>> ', parentUser.name)
        console.log('New User >>> ', user.name)

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: 'Forbidden !' })
        await user.save()
        return res.status(201).json({ message: 'User Account Registered Successfully.', user })
    } catch(error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.createAccount = async (req, res) => {
    console.log("<<< API POST CREATE ACCOUNT >>>")

    try {
        const { id } = req.params
        const { iteration, subaccount, name, email, mobilenum, password, refCode } = req.body
        const passwordHash = password
        const shippingAddress = {
            address: '', city: '', province: '', zipcode: '', country: 'Philippines'
        }

        if (name.match(/\d+/))
            return res.status(422).json({ error: 'Name must not contain a number!' })
        
        if (name.match(/[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~]/))
            return res.status(422).json({ error: 'Name must not contain special characters!' })

        let checker
        if (subaccount === true) checker = true
        else checker = false

        const creator = await User.findOne({ _id: id })

        if (iteration === '4') {
            if (creator.class !== 'Member' && parseFloat(creator.epacredits) < 4000)
                return res.status(422).json({ error: 'Not enough EPA Credits.' })
        } else {
            if (creator.class !== 'Member' && parseFloat(creator.epacredits) < 1000)
                return res.status(422).json({ error: 'Not enough EPA Credits.' })
        }

        // const isNameExist = await User.isNameInUse(name)
        const isEmailExist = await User.isEmailInUse(email)

        let isMobileExist  
        if (!subaccount) {
            isMobileExist = await User.isMobileInUse(mobilenum)
        }
        const isReferred = await User.addRef(refCode)

        const user = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: name,
            email: email.toLowerCase(),
            areacode: '+63',
            mobilenum: checker ? creator.mobilenum : mobilenum,
            password: passwordHash,
            shippingAddress,
            sponsor: isReferred ? isReferred._id : '',
            children: [],
            parent: '',
            isEpaCreditCommission: false,
            isEpaVaultCommission: false,
            isEpaUpgradeCommission: false,
            isLegsComplete: false,
            teams: [],
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            isAutoDonateUhw: creator.isAutoDonateUhw,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'enduser',
            class: 'Entrepreneur',
            rank: 'Solopreneur',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: checker ? creator.gender : '',
            birthday: checker ? creator.birthday : 'MM/DD/YYYY',
            religion: checker ? creator.religion : '',
            isVerified: checker ? creator.isVerified : false,
            status: checker ? creator.status : '',
            spouse: checker ? creator.spouse : '',
            father: checker ? creator.father : '',
            mother: checker ? creator.mother : '',
            sibling1: checker ? creator.sibling1 : '',
            sibling2: checker ? creator.sibling2 : '',
            sibling3: checker ? creator.sibling3 : '',
            sibling4: checker ? creator.sibling4 : '',
            sibling5: checker ? creator.sibling5 : '',
            otherSiblings: checker ? creator.otherSiblings : '',
            currentCompany: checker ? creator.currentCompany : '',
            currentJob: checker ? creator.currentJob : '',
            dreamJob: checker ? creator.dreamJob : '',
            salaryEmployed: checker ? creator.salaryEmployed : 0,
            salarySelfEmployed: checker ? creator.salarySelfEmployed : 0,
            salaryPension: checker ? creator.salaryPension : 0,
            dependents: checker ? creator.dependents : 0,
            isSubAccount: subaccount,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        // if (!isNameExist) return res.status(422).json({ error: 'Name is already in use, try logging in.' })
        if (!isEmailExist) return res.status(422).json({ error: 'Email is already in use, try logging in.' })

        if (!subaccount) {
            if (!isMobileExist) return res.status(422).json({ error: 'Mobile number is already in use, try logging in.' })
        }

        if (!isReferred) return res.status(422).json({ error: 'Reference number does not exist.' })

        // auto create EPA accounts
        const settings = await Setting.findOne({})

        console.log('Check Auto Create EPA Settings: ', settings.isAutoCreateEpa)

        // const refUser = await User.findOne({ refnum: refCode })
        // const userRef = await User.addRef(refUser.refnum)

        // if (iteration === '4') {
        //     if (userRef.epacredits < 4000)
        //         return res.status(422).json({ error: 'Not enough EPA Credits.' })
        // } else {
        //     if (userRef.epacredits < 1000)
        //         return res.status(422).json({ error: 'Not enough EPA Credits.' })
        // }

        const writeUser = await User.aggregate([
            { $match: { _id: creator._id } },
            { $project: {
                name: '$name',
                childrenCount: { $cond: { if: { $isArray: '$children' }, then: { $size: '$children' }, else: 'N/A'} },
                children: '$children'
            }},
            { $match: { childrenCount: { $lt: 3 } } },
            { $sort: { createdAt: 1 } },
            { $limit: 1 },
            { $addFields: {
                children: { $concatArrays: [ '$children', [ user ] ] }
            }}
        ] )

        if (!writeUser.length) {
            const teams = await User.aggregate([
                { $match: { _id: creator._id } },
                { $unwind: '$teams' },
                { $lookup: {
                    from: 'users',
                    localField: 'teams',
                    foreignField: '_id',
                    as: 'team_users'
                }},
                { $unwind: '$team_users' },
                { $addFields: {
                    childrenSize: { $size: '$team_users.children' }
                }},
                { $match: { childrenSize: { $lt: 3 } } },
                { $project: {
                    user: '$team_users'
                }}
            ])
            writeUser.push(Object.assign(writeUser, teams[0].user))
        }

        const parentUser = await User.findOne({ _id: writeUser[0]._id })

        const newChild = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            class: user.class,
            rank: user.rank,
            children: user.children
        }

        await User.findByIdAndUpdate(parentUser._id, {
            $push: { children: newChild, teams: user._id }
        })

        // parent is not the sponsor
        if (String(parentUser._id) !== String(creator._id)) {
            // sponsor bonus
            await User.findByIdAndUpdate(creator._id, {
                $push: { teams: user._id }
            })
        }

        // save parent to new registered user 
        user.parent = parentUser._id

        console.log('Parent User >>> ', parentUser.name)
        console.log('New User >>> ', user.name)

        console.log('iteration >> ', iteration)
        console.log('sub-account >> ', subaccount)

        await user.save()
        await bulkPurchasePkg(user)

        if (subaccount) {
            await User.findByIdAndUpdate(user.sponsor, {
                $push: { subAccounts: user._id }
            })

            await User.findByIdAndUpdate(user._id, {
                owner: String(user.sponsor)
            })
        }

        if (iteration === '4') {
            await createHouseAccounts(user, passwordHash)

            // QUOTA
            const today = dateTime.DateTime.now().toISO()
            const date = dateTime.DateTime.fromISO(today)
            const dayName = date.toLocaleString({ weekday: 'long' })
            const settings = await Setting.findOne({})

            if (dayName !== 'Saturday') {
                console.log('< Add Quota Day >', dayName)

                const numAssociates = await User.aggregate([
                    { $match: { _id: new ObjectId(creator._id) } },
                    { $graphLookup: {
                        from: 'users',
                        startWith: '$children._id',
                        connectFromField: 'children._id',
                        connectToField: '_id',
                        as: 'allChildren',
                        depthField: 'depth'
                    }},
                    { $addFields: {
                        childrenMember: { $size: { $filter: {
                            input: '$allChildren',
                            as: 'child',
                            cond: { $eq: [ '$$child.class', 'Member' ] }}
                        }},
                    }},
                    { $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        childrenCount: { $sum: { $size: '$allChildren' } },
                        childrenMember: { $first: '$childrenMember' }
                    }}
                ])

                if (numAssociates.length) {
                    const validChildrenCount = numAssociates[0].childrenCount - numAssociates[0].childrenMember
                    const quotaBase = settings.base * validChildrenCount
                    const quotaFormula = (( quotaBase * validChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10
    
                    await User.findByIdAndUpdate(creator._id, {
                        quota: quotaFormula.toFixed(4)
                    })
    
                    console.log('< Add Quota >', creator.name, quotaFormula.toFixed(4))
                }
            } else {
                console.log('< Add Quota Day >', dayName)

                const numAssociates = await User.aggregate([
                    { $match: { _id: new ObjectId(creator._id) } },
                    { $graphLookup: {
                        from: 'users',
                        startWith: '$children._id',
                        connectFromField: 'children._id',
                        connectToField: '_id',
                        as: 'allChildren',
                        depthField: 'depth'
                    }},
                    { $addFields: {
                        childrenMember: { $size: { $filter: {
                            input: '$allChildren',
                            as: 'child',
                            cond: { $eq: [ '$$child.class', 'Member' ] }}
                        }},
                    }},
                    { $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        childrenCount: { $sum: { $size: '$allChildren' } },
                        childrenMember: { $first: '$childrenMember' }
                    }}
                ])

                if (numAssociates.length) {
                    const validChildrenCount = numAssociates[0].childrenCount - numAssociates[0].childrenMember
                    const quotaBase = settings.base * validChildrenCount
                    const quotaFormula = (( quotaBase * validChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10
    
                    await User.findByIdAndUpdate(creator._id, {
                        quotaSubWeek: quotaFormula.toFixed(4)
                    })
    
                    console.log('< Add Quota >', creator.name, quotaFormula.toFixed(4))
                }
            }
        }
        
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: 'Forbidden !' })
        return res.status(201).json({ message: 'New Account Created Successfully.', user })
    } catch(error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

const createHouseAccounts = async (user1, passwordHash) => {
    console.log("<<< API POST CREATE HOUSE ACCOUNTS >>>")

    const user2 = await User({
        createdAt: dateTime.DateTime.local().toISO(),
        updatedAt: dateTime.DateTime.local().toISO(),
        refnum: uuid.generate(),
        owner: String(user1.sponsor),
        name: user1.name,
        email: '02' + user1.email.toLowerCase(),
        areacode: '+63',
        mobilenum: user1.mobilenum,
        password: passwordHash,
        shippingAddress: user1.shippingAddress,
        sponsor: user1.sponsor,
        children: [],
        parent: user1._id,
        isEpaCreditCommission: false,
        isEpaVaultCommission: false,
        isEpaUpgradeCommission: false,
        isLegsComplete: false,
        teams: [],
        eWalletnum: crypto.randomBytes(10).toString('hex'),
        epacashTotal: 0,
        epacash: 0,
        epatokens: 0,
        epavault: 0,
        epacredits: 0,
        epaCreditsMonth: 0,
        ecomVault: 0,
        totalIncome: 0,
        loanamount: [],
        quota: 0,
        quotaSubWeek: 0,
        isSuspended: false,
        role: 'enduser',
        class: 'Entrepreneur',
        rank: 'Solopreneur',
        avatar: '',
        idImage1: '',
        idImage2: '',
        idImage3: '',
        gender: user1.gender,
        birthday: user1.birthday,
        religion: user1.religion,
        isVerified: user1.isVerified,
        status: user1.status,
        spouse: user1.spouse,
        father: user1.father,
        mother: user1.mother,
        sibling1: user1.sibling1,
        sibling2: user1.sibling2,
        sibling3: user1.sibling3,
        sibling4: user1.sibling4,
        sibling5: user1.sibling5,
        otherSiblings: user1.otherSiblings,
        currentCompany: user1.currentCompany,
        currentJob: user1.currentJob,
        dreamJob: user1.dreamJob,
        salaryEmployed: user1.salaryEmployed,
        salarySelfEmployed: user1.salarySelfEmployed,
        salaryPension: user1.salaryPension,
        dependents: user1.dependents,
        isSubAccount: true,
        subAccounts: [],
        iou: [],
        entrepreneur: 'Pending',
        supervisor: 'Pending',
        manager: 'Pending',
        ceo: 'Pending',
        businessempire: 'Pending',
        delegatePin: ''
    })

    const user3 = await User({
        createdAt: dateTime.DateTime.local().toISO(),
        updatedAt: dateTime.DateTime.local().toISO(),
        refnum: uuid.generate(),
        owner: String(user1.sponsor),
        name: user1.name,
        email: '03' + user1.email.toLowerCase(),
        areacode: '+63',
        mobilenum: user1.mobilenum,
        password: passwordHash,
        shippingAddress: user1.shippingAddress,
        sponsor: user1.sponsor,
        children: [],
        parent: user1._id,
        isEpaCreditCommission: false,
        isEpaVaultCommission: false,
        isEpaUpgradeCommission: false,
        isLegsComplete: false,
        teams: [],
        eWalletnum: crypto.randomBytes(10).toString('hex'),
        epacashTotal: 0,
        epacash: 0,
        epatokens: 0,
        epavault: 0,
        epacredits: 0,
        epaCreditsMonth: 0,
        ecomVault: 0,
        totalIncome: 0,
        loanamount: [],
        quota: 0,
        quotaSubWeek: 0,
        isSuspended: false,
        role: 'enduser',
        class: 'Entrepreneur',
        rank: 'Solopreneur',
        avatar: '',
        idImage1: '',
        idImage2: '',
        idImage3: '',
        gender: user1.gender,
        birthday: user1.birthday,
        religion: user1.religion,
        isVerified: user1.isVerified,
        status: user1.status,
        spouse: user1.spouse,
        father: user1.father,
        mother: user1.mother,
        sibling1: user1.sibling1,
        sibling2: user1.sibling2,
        sibling3: user1.sibling3,
        sibling4: user1.sibling4,
        sibling5: user1.sibling5,
        otherSiblings: user1.otherSiblings,
        currentCompany: user1.currentCompany,
        currentJob: user1.currentJob,
        dreamJob: user1.dreamJob,
        salaryEmployed: user1.salaryEmployed,
        salarySelfEmployed: user1.salarySelfEmployed,
        salaryPension: user1.salaryPension,
        dependents: user1.dependents,
        isSubAccount: true,
        subAccounts: [],
        iou: [],
        entrepreneur: 'Pending',
        supervisor: 'Pending',
        manager: 'Pending',
        ceo: 'Pending',
        businessempire: 'Pending',
        delegatePin: ''
    })

    const user4 = await User({
        createdAt: dateTime.DateTime.local().toISO(),
        updatedAt: dateTime.DateTime.local().toISO(),
        refnum: uuid.generate(),
        owner: String(user1.sponsor),
        name: user1.name,
        email: '04' + user1.email.toLowerCase(),
        areacode: '+63',
        mobilenum: user1.mobilenum,
        password: passwordHash,
        shippingAddress: user1.shippingAddress,
        sponsor: user1.sponsor,
        children: [],
        parent: user1._id,
        isEpaCreditCommission: false,
        isEpaVaultCommission: false,
        isEpaUpgradeCommission: false,
        isLegsComplete: false,
        teams: [],
        eWalletnum: crypto.randomBytes(10).toString('hex'),
        epacashTotal: 0,
        epacash: 0,
        epatokens: 0,
        epavault: 0,
        epacredits: 0,
        epaCreditsMonth: 0,
        ecomVault: 0,
        totalIncome: 0,
        loanamount: [],
        quota: 0,
        quotaSubWeek: 0,
        isSuspended: false,
        role: 'enduser',
        class: 'Entrepreneur',
        rank: 'Solopreneur',
        avatar: '',
        idImage1: '',
        idImage2: '',
        idImage3: '',
        gender: user1.gender,
        birthday: user1.birthday,
        religion: user1.religion,
        isVerified: user1.isVerified,
        status: user1.status,
        spouse: user1.spouse,
        father: user1.father,
        mother: user1.mother,
        sibling1: user1.sibling1,
        sibling2: user1.sibling2,
        sibling3: user1.sibling3,
        sibling4: user1.sibling4,
        sibling5: user1.sibling5,
        otherSiblings: user1.otherSiblings,
        currentCompany: user1.currentCompany,
        currentJob: user1.currentJob,
        dreamJob: user1.dreamJob,
        salaryEmployed: user1.salaryEmployed,
        salarySelfEmployed: user1.salarySelfEmployed,
        salaryPension: user1.salaryPension,
        dependents: user1.dependents,
        isSubAccount: true,
        subAccounts: [],
        iou: [],
        entrepreneur: 'Pending',
        supervisor: 'Pending',
        manager: 'Pending',
        ceo: 'Pending',
        businessempire: 'Pending',
        delegatePin: ''
    })

    console.log('New User >>> ', user2.name)
    console.log('New User >>> ', user3.name)
    console.log('New User >>> ', user4.name)

    await user2.save()
    await user3.save()
    await user4.save()

    await bulkPurchasePkg(user2)
    await bulkPurchasePkg(user3)
    await bulkPurchasePkg(user4)

    const newChild = {
        _id: user2._id,
        name: user2.name,
        email: user2.email,
        avatar: user2.avatar,
        class: user2.class,
        rank: user2.rank,
        children: []
    }

    await User.findByIdAndUpdate(user1._id, {
        isLegsComplete: true, // update legs
        $inc: { 
            epavault: 100,
            epacredits: 100, // mirror
            // epaCreditsMonth: 100, // dont mirror
            totalIncome: 100
        },
        $push: { children: newChild, teams: user2._id }
    })

    await User.findByIdAndUpdate(user1.sponsor, {
        $push: { teams: user2._id }
    })

    // if (subaccount) {
    await User.findByIdAndUpdate(user1.sponsor, {
        $push: { subAccounts: user2._id }
    })
    // }

    // QUOTA
    const today = dateTime.DateTime.now().toISO()
    const date = dateTime.DateTime.fromISO(today)
    const dayName = date.toLocaleString({ weekday: 'long' })
    const settings = await Setting.findOne({})

    const validChildrenCount = 3
    const quotaBase = settings.base * validChildrenCount
    const quotaFormula = (( quotaBase * validChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10

    if (dayName !== 'Saturday') {
        console.log('< Add Quota Day >', dayName)

        await User.findByIdAndUpdate(user1._id, {
            quota: quotaFormula.toFixed(4)
        })

        console.log('< Add Quota >', user1.name, quotaFormula.toFixed(4))
    } else {
        console.log('< Add Quota Day >', dayName)

        await User.findByIdAndUpdate(user1._id, {
            quotaSubWeek: quotaFormula.toFixed(4)
        })

        console.log('< Add Quota >', user1.name, quotaFormula.toFixed(4))
    }

    // Add to notifications
    const notif = await Notification({ 
        createdAt: dateTime.DateTime.local().toISO(),
        owner: user1._id,
        type: 'mynotif',
        message: `You earned P100 EPA Credits for completing team of 3 Business Associates`,
        isRead: false,
        tags: 'package'
    })

    await notif.save()

    const newChild2 = {
        _id: user3._id,
        name: user3.name,
        email: user3.email,
        avatar: user3.avatar,
        class: user3.class,
        rank: user3.rank,
        children: []
    }

    await User.findByIdAndUpdate(user1._id, {
        $push: { children: newChild2, teams: user3._id }
    })

    await User.findByIdAndUpdate(user1.sponsor, {
        $push: { teams: user3._id }
    })

    // if (subaccount) {
    await User.findByIdAndUpdate(user1.sponsor, {
        $push: { subAccounts: user3._id }
    })
    // }

    const newChild3 = {
        _id: user4._id,
        name: user4.name,
        email: user4.email,
        avatar: user4.avatar,
        class: user4.class,
        rank: user4.rank,
        children: []
    }

    await User.findByIdAndUpdate(user1._id, {
        $push: { children: newChild3, teams: user4._id }
    })

    await User.findByIdAndUpdate(user1.sponsor, {
        $push: { teams: user4._id }
    })

    // if (subaccount) {
    await User.findByIdAndUpdate(user1.sponsor, {
        $push: { subAccounts: user4._id }
    })
    // }
}

exports.createSubAccount = async (req, res) => {
    console.log("<<< API POST CREATE SUB ACCOUNT >>>")

    try {
        const shippingAddress = {
            address: '', city: '', province: '', zipcode: '', country: 'Philippines'
        }
        
        const { id } = req.params
        const { name, email, mobilenum, password, refCode } = req.body

        const isEmailExist = await User.isEmailInUse(email)
        // const isMobileExist = await User.isMobileInUse(mobilenum)
        const isReferred = await User.addRef(refCode)

        if (!isEmailExist) return res.status(422).json({ error: 'Email is already in use, try logging in.' })
        // if (!isMobileExist) return res.status(422).json({ error: 'Mobile number is already in use, try logging in.' })
        if (!isReferred) return res.status(422).json({ error: 'Reference number does not exist.' })

        const user = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: name,
            email: email.toLowerCase(),
            areacode: '+63',
            mobilenum: mobilenum,
            password: password,
            shippingAddress,
            sponsor: isReferred ? isReferred._id : '',
            children: [],
            parent: '',
            isEpaCreditCommission: false,
            isEpaVaultCommission: false,
            isEpaUpgradeCommission: false,
            isLegsComplete: false,
            teams: [],
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'enduser',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: true,
            owner: id,
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        // auto create EPA accounts
        const settings = await Setting.findOne({})
        
        console.log('Check Auto Create EPA Settings: ', settings.isAutoCreateEpa)

        if (settings.isAutoCreateEpa) {
            const epaRef = await User.findOne({ _id: process.env.EPA_ACCT_ID })

            for (const lvl in epaRef.children) {
                if (!epaRef.children[lvl].length)
                    await createEpaAccount(epaRef, lvl, false)
                else
                    break
            }
        }

        const refUser = await User.findOne({ refnum: refCode })
        const userRef = await User.addRef(refUser.refnum)
        // const epaRefWrite = await User.findOne({ _id: process.env.EPA_ACCT_ID })

        // // write to EPA account children
        // if (process.env.EPA_ACCT_ID !== String(userRef._id)) {
        //     for (const lvl in epaRefWrite.children) {
        //         if (lvl === 'level1') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 3) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 3) {
        //                     console.log('epaRefWrite.children[lvl].length >> ', lvl, epaRefWrite.children[lvl].length)
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }
    
        //         if (lvl === 'level2') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 9) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 9) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }
    
        //         if (lvl === 'level3') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 27) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 27) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }
    
        //         if (lvl === 'level4') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 81) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 81) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }
    
        //         if (lvl === 'level5') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 243) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 243) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }
    
        //         if (lvl === 'level6') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 729) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 729) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }
    
        //         if (lvl === 'level7') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 2187) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 2187) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }
    
        //         if (lvl === 'level8') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 6561) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 6561) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }
    
        //         if (lvl === 'level9') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 19683) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 19683) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }
    
        //         if (lvl === 'leve10') {
        //             if (settings.isAutoCreateEpa) {
        //                 if (epaRefWrite.children[lvl].length && epaRefWrite.children[lvl].length < 59049) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             } else {
        //                 if (epaRefWrite.children[lvl].length < 59049) {
        //                     epaRefWrite.children[lvl].push(user)
        //                     break
        //                 }
        //             }
        //         }
        //     }
        // }

        // console.log("Sponsor Name: ", userRef.name)

        // const epaRefUpdate = await User.findOne({ _id: process.env.EPA_ACCT_ID })

        // for (const lvl in userRef.children) {
        //     if (lvl === 'level1') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 3) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 3) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level2') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 9) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 9) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level3') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 27) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 27) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level4') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 81) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 81) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level5') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 243) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 243) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level6') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 729) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 729) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level7') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 2187) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 2187) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level8') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 6561) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 6561) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'level9') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 19683) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 19683) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }

        //     if (lvl === 'leve10') {
        //         if (settings.isAutoCreateEpa) {
        //             if (epaRefUpdate.children[lvl].length && userRef.children[lvl].length < 59049) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         } else {
        //             if (userRef.children[lvl].length < 59049) {
        //                 userRef.children[lvl].push(user)
        //                 break
        //             }
        //         }
        //     }
        // }

        // let bonusCredit = 0

        // if (userRef.class === 'Entrepreneur')
        //     bonusCredit = 100
        // if (userRef.class === 'Supervisor')
        //     bonusCredit = 300
        // if (userRef.class === 'Manager')
        //     bonusCredit = 500
        // if (userRef.class === 'CEO')
        //     bonusCredit = 800
        // if (userRef.class === 'Business Empire')
        //     bonusCredit = 1000

        // write to EPA account children database
        // if (process.env.EPA_ACCT_ID !== String(id)) {
        //     await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
        //         children: epaRefWrite.children
        //     })
        // }

        const writeUser = await User.aggregate([
            { $match: { _id: userRef._id } },
            { $project: {
                name: '$name',
                childrenCount: { $cond: { if: { $isArray: '$children' }, then: { $size: '$children' }, else: 'N/A'} },
                children: '$children'
            }},
            { $match: { childrenCount: { $lt: 3 } } },
            { $sort: { createdAt: 1 } },
            { $limit: 1 },
            { $addFields: {
                children: { $concatArrays: [ '$children', [ user ] ] }
            }}
        ] )

        if (!writeUser.length) {
            const teams = await User.aggregate([
                { $match: { _id: userRef._id } },
                { $unwind: '$teams' },
                { $lookup: {
                    from: 'users',
                    localField: 'teams',
                    foreignField: '_id',
                    as: 'team_users'
                }},
                { $unwind: '$team_users' },
                { $addFields: {
                    childrenSize: { $size: '$team_users.children' }
                }},
                { $match: { childrenSize: { $lt: 3 } } },
                { $project: {
                    user: '$team_users'
                }}
            ])
            writeUser.push(Object.assign(writeUser, teams[0].user))
        }

        const parentUser = await User.findOne({ _id: writeUser[0]._id })

        const newChild = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            class: user.class,
            rank: user.rank,
            children: user.children
        }

        await User.findByIdAndUpdate(parentUser._id, {
            $push: { children: newChild, teams: user._id }
        })

        // parent is not the sponsor
        if (String(parentUser._id) !== String(userRef._id)) {
            // sponsor bonus
            await User.findByIdAndUpdate(userRef._id, {
                $push: { teams: user._id, subAccounts: user._id }
            })
        // parent is the sponsor
        } else {
            // sponsor bonus
            await User.findByIdAndUpdate(userRef._id, {
                $push: { subAccounts: user._id }
            })
        }

        // save parent to new registered user 
        user.parent = parentUser._id

        console.log('Parent User >>> ', parentUser.name)
        console.log('New User >>> ', user.name)

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: 'Forbidden !' })
        await user.save()
        return res.status(201).json({ message: 'Sub Account Created Successfully.', user })
    } catch(error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.loginUser = async (req, res) => {
    console.log("<<< API POST LOGIN USER >>>")

    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user)
            return res.status(422).json({ error: 'User not found, with the given email!' })

        const isMatch = await user.comparePassword(password)
        if (!isMatch)
            return res.status(422).json({ error: 'Credentials are incorrect!' })

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: '7d',
        })

        let oldTokens = user.tokens || []

        if (oldTokens.length) {
            oldTokens = oldTokens.filter(t => {
                const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000
                if (timeDiff < 86400) {
                    return t
                }
            })
        }
    
        await User.findByIdAndUpdate(user._id, {
            tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
        })

        const userInfo = {
            id: user._id,
            name: user.name,
            email: user.email,
            areacode: user.areacode,
            mobilenum: user.mobilenum,
            refnum: user.refnum,
            eWalletnum: user.eWalletnum,
            epacashTotal: user.epacashTotal,
            epacash: user.epacash,
            epacredits: user.epacredits,
            epaCreditsMonth: user.epaCreditsMonth,
            ecomVault: user.ecomVault,
            epatokens: user.epatokens,
            epavault: user.epavault,
            totalIncome: user.totalIncome,
            quota: user.quota,
            quotaSubWeek: user.quotaSubWeek,
            isSuspended: user.isSuspended,
            stores: user.stores,
            role: user.role,
            class: user.class,
            rank: user.rank,
            avatar: user.avatar ? user.avatar : '',
            idImage1: user.idImage1 ? user.idImage1 : '',
            idImage2: user.idImage2 ? user.idImage2 : '',
            idImage1: user.idImage3 ? user.idImage3 : '',
            religion: user.religion,
            isLegsComplete: user.isLegsComplete,
            isVerified: user.isVerified,
            status: user.status,
            spouse: user.spouse,
            father: user.father,
            mother: user.mother,
            sibling1: user.sibling1,
            sibling2: user.sibling2,
            sibling3: user.sibling3,
            sibling4: user.sibling4,
            sibling5: user.sibling5,
            otherSiblings: user.otherSiblings,
            currentCompany: user.currentCompany,
            currentJob: user.currentJob,
            dreamJob: user.dreamJob,
            salaryEmployed: user.salaryEmployed,
            salarySelfEmployed: user.salarySelfEmployed,
            salaryPension: user.salaryPension,
            dependents: user.dependents,
            isSubAccount: user.isSubAccount,
            entrepreneur: user.entrepreneur,
            supervisor: user.supervisor,
            manager: user.manager,
            ceo: user.ceo,
            businessempire: user.businessempire,
            delegatePin: user.delegatePin,
            createdAt: user.createdAt
        }

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: 'Forbidden !' })
        return res.status(201).json({ message: 'Logging in. Please wait...', httpOnly: true, secure: true, user: userInfo, token })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

const createEpaAccount = async (epaRef, lvl, isSubAcc) => {
    console.log("<<< CREATE EPA ACCOUNT >>>", lvl)

    const children = { 
        level1: [], level2: [], level3: [], level4: [], level5: [],
        level6: [], level7: [], level8: [], level9: [], level10: []
    }

    const user = await User({
        createdAt: dateTime.DateTime.local().toISO(),
        updatedAt: dateTime.DateTime.local().toISO(),
        refnum: uuid.generate(),
        name: 'EPA Account ' + lvl.replace('level', ''),
        email: 'store' + lvl.replace('level', '') + '@epabusiness.com',
        mobilenum: '90000000' + lvl.replace('level', ''),
        password: epaRef.password,
        shippingAddress: epaRef.address,
        sponsor: '',
        children,
        eWalletnum: crypto.randomBytes(10).toString('hex'),
        epacashTotal: 0,
        epacash: 0,
        epatokens: 0,
        epavault: 0,
        epacredits: 0,
        epaCreditsMonth: 0,
        ecomVault: 0,
        totalIncome: 0,
        loanamount: [],
        quota: 0,
        quotaSubWeek: 0,
        isSuspended: false,
        role: 'admin',
        class: 'Member',
        rank: '',
        avatar: '',
        idImage1: '',
        idImage2: '',
        idImage3: '',
        gender: '',
        birthday: 'MM/DD/YYYY',
        isVerified: false,
        status: '',
        spouse: '',
        father: '',
        mother: '',
        sibling1: '',
        sibling2: '',
        sibling3: '',
        sibling4: '',
        sibling5: '',
        otherSiblings: '',
        currentCompany: '',
        currentJob: '',
        dreamJob: '',
        salaryEmployed: 0,
        salarySelfEmployed: 0,
        salaryPension: 0,
        dependents: 0,
        isSubAccount: isSubAcc,
        subAccounts: [],
        iou: [],
        entrepreneur: 'Pending',
        supervisor: 'Pending',
        manager: 'Pending',
        ceo: 'Pending',
        businessempire: 'Pending',
        delegatePin: ''
    })

    await user.save()

    if (lvl === 'level1') {
        console.log(lvl, user.name)

        user.sponsor = process.env.EPA_ACCT_ID
        
        await User.findByIdAndUpdate(String(user._id), {
            sponsor: process.env.EPA_ACCT_ID
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level1": user }
        })

        console.log("<<< CREATE EDWARD ACCOUNT >>>", lvl)

        const edUser1 = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: "Edward Chan",
            email: "edchan333@gmail.com",
            mobilenum: '099000000' + '1',
            password: "password",
            shippingAddress: '',
            sponsor: process.env.EPA_ACCT_ID,
            children,
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'admin',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: isSubAcc,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        const edUser2 = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: "Edward Chan " + '2',
            email: "edchan333" + '2' + "@gmail.com",
            mobilenum: '099000000' + '2',
            password: "password",
            shippingAddress: '',
            sponsor: process.env.EPA_ACCT_ID,
            children,
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'admin',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: isSubAcc,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        await edUser1.save()
        await edUser2.save()

        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level1": edUser1 }
        })

        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level1": edUser2 }
        })
    }

    if (lvl === 'level2') {
        console.log(lvl, user.name)

        const epaUser = await User.findOne({ email: 'store1@epabusiness.com' })
        user.sponsor = String(epaUser._id)
        
        await User.findByIdAndUpdate(String(user._id), {
            sponsor: String(epaUser._id)
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level2": user }
        })

        console.log("<<< CREATE EDWARD ACCOUNT >>>", lvl)

        const edUser1 = await User.findOne({ email: 'edchan333@gmail.com' })
        const edUser2 = await User.findOne({ email: 'edchan3332@gmail.com' })

        const edUser3 = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: "Edward Chan " + '3',
            email: "edchan333" + '3' + "@gmail.com",
            mobilenum: '099000000' + '3',
            password: "password",
            shippingAddress: '',
            sponsor: process.env.EPA_ACCT_ID,
            children,
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'admin',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: isSubAcc,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        const edUser4 = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: "Edward Chan " + '4',
            email: "edchan333" + '4' + "@gmail.com",
            mobilenum: '099000000' + '4',
            password: "password",
            shippingAddress: '',
            sponsor: process.env.EPA_ACCT_ID,
            children,
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'admin',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: isSubAcc,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        const edUser5 = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: "Edward Chan " + '5',
            email: "edchan333" + '5' + "@gmail.com",
            mobilenum: '099000000' + '5',
            password: "password",
            shippingAddress: '',
            sponsor: String(edUser1._id),
            children,
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'admin',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: isSubAcc,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        const edUser6 = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: "Edward Chan " + '6',
            email: "edchan333" + '6' + "@gmail.com",
            mobilenum: '099000000' + '6',
            password: "password",
            shippingAddress: '',
            sponsor: String(edUser1._id),
            children,
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'admin',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: isSubAcc,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        const edUser7 = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: "Edward Chan " + '7',
            email: "edchan333" + '7' + "@gmail.com",
            mobilenum: '099000000' + '7',
            password: "password",
            shippingAddress: '',
            sponsor: String(edUser1._id),
            children,
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'admin',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: isSubAcc,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        const edUser8 = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: "Edward Chan " + '8',
            email: "edchan333" + '8' + "@gmail.com",
            mobilenum: '099000000' + '8',
            password: "password",
            shippingAddress: '',
            sponsor: String(edUser2._id),
            children,
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'admin',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: isSubAcc,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        const edUser9 = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: "Edward Chan " + '9',
            email: "edchan333" + '9' + "@gmail.com",
            mobilenum: '099000000' + '9',
            password: "password",
            shippingAddress: '',
            sponsor: String(edUser2._id),
            children,
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'admin',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: isSubAcc,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        const edUser10 = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            name: "Edward Chan " + '10',
            email: "edchan333" + '10' + "@gmail.com",
            mobilenum: '099000000' + '10',
            password: "password",
            shippingAddress: '',
            sponsor: String(edUser2._id),
            children,
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: 'admin',
            class: 'Member',
            rank: '',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: isSubAcc,
            subAccounts: [],
            iou: [],
            entrepreneur: 'Pending',
            supervisor: 'Pending',
            manager: 'Pending',
            ceo: 'Pending',
            businessempire: 'Pending',
            delegatePin: ''
        })

        await edUser3.save()
        await edUser4.save()
        await edUser5.save()
        await edUser6.save()
        await edUser7.save()
        await edUser8.save()
        await edUser9.save()
        await edUser10.save()

        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level2": edUser3 }
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level2": edUser4 }
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level2": edUser5 }
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level2": edUser6 }
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level2": edUser7 }
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level2": edUser8 }
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level2": edUser9 }
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level2": edUser10 }
        })

        // await User.findByIdAndUpdate(String(edUser1._id), {
        //     $push: { "children.level1": edUser3 }
        // })

        // await User.findByIdAndUpdate(String(edUser1._id), {
        //     $push: { "children.level1": edUser4 }
        // })

        await User.findByIdAndUpdate(String(edUser1._id), {
            $push: { "children.level1": edUser5 }
        })

        await User.findByIdAndUpdate(String(edUser1._id), {
            $push: { "children.level1": edUser6 }
        })

        await User.findByIdAndUpdate(String(edUser1._id), {
            $push: { "children.level1": edUser7 }
        })

        await User.findByIdAndUpdate(String(edUser2._id), {
            $push: { "children.level1": edUser8 }
        })

        await User.findByIdAndUpdate(String(edUser2._id), {
            $push: { "children.level1": edUser9 }
        })

        await User.findByIdAndUpdate(String(edUser2._id), {
            $push: { "children.level1": edUser10 }
        })
    }

    if (lvl === 'level3') {
        console.log(lvl, user.name)

        const epaUser = await User.findOne({ email: 'store2@epabusiness.com' })
        user.sponsor = String(epaUser._id)

        await User.findByIdAndUpdate(String(user._id), {
            sponsor: String(epaUser._id)
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level3": user }
        })
    }

    if (lvl === 'level4') {
        console.log(lvl, user.name)

        const epaUser = await User.findOne({ email: 'store3@epabusiness.com' })
        user.sponsor = String(epaUser._id)

        await User.findByIdAndUpdate(String(user._id), {
            sponsor: String(epaUser._id)
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level4": user }
        })
    }

    if (lvl === 'level5') {
        console.log(lvl, user.name)

        const epaUser = await User.findOne({ email: 'store4@epabusiness.com' })
        user.sponsor = String(epaUser._id)

        await User.findByIdAndUpdate(String(user._id), {
            sponsor: String(epaUser._id)
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level5": user }
        })
    }

    if (lvl === 'level6') {
        console.log(lvl, user.name)

        const epaUser = await User.findOne({ email: 'store5@epabusiness.com' })
        user.sponsor = String(epaUser._id)

        await User.findByIdAndUpdate(String(user._id), {
            sponsor: String(epaUser._id)
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level6": user }
        })
    }

    if (lvl === 'level7') {
        console.log(lvl, user.name)

        const epaUser = await User.findOne({ email: 'store6@epabusiness.com' })
        user.sponsor = String(epaUser._id)

        await User.findByIdAndUpdate(String(user._id), {
            sponsor: String(epaUser._id)
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level7": user }
        })
    }

    if (lvl === 'level8') {
        console.log(lvl, user.name)

        const epaUser = await User.findOne({ email: 'store7@epabusiness.com' })
        user.sponsor = String(epaUser._id)

        await User.findByIdAndUpdate(String(user._id), {
            sponsor: String(epaUser._id)
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level8": user }
        })
    }

    if (lvl === 'level9') {
        console.log(lvl, user.name)

        const epaUser = await User.findOne({ email: 'store8@epabusiness.com' })
        user.sponsor = String(epaUser._id)

        await User.findByIdAndUpdate(String(user._id), {
            sponsor: String(epaUser._id)
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level9": user }
        })
    }

    if (lvl === 'level10') {
        console.log(lvl, user.name)

        const epaUser = await User.findOne({ email: 'store9@epabusiness.com' })
        user.sponsor = String(epaUser._id)

        await User.findByIdAndUpdate(String(user._id), {
            sponsor: String(epaUser._id)
        })
        // highest tier EPA account
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $push: { "children.level10": user }
        })
    }
}

exports.setReligion = async (req, res) => {
    console.log("<<< API PUT SET RELIGION >>>")

    try {
        const { id } = req.params

        const user = await User.findByIdAndUpdate(id, {
            updatedAt: dateTime.DateTime.local().toISO(),
            religion: req.body.religion
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Religion Updated!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}
  
exports.logoutUser = async (req, res) => {
    console.log("<<< API POST LOGOUT USER >>>")

    try {
        // if (req.headers && req.headers.authorization) {
            if (req.headers && req.headers.cookie) { // replace temp req.headers.authorization to req.headers.cookie
            // const token = req.headers.authorization.split(' ')[1]
            const token = req.headers.cookie.split(' ')[0].split('=')[1].slice(0, -1)
    
            if (!token) {
                return res.status(401).json({ message: 'Authorization failed!' })
            }
    
            const tokens = req.user.tokens
            const newTokens = tokens.filter(t => t.token !== token)

            await User.findByIdAndUpdate(req.user._id, { tokens: newTokens })
            return res.status(201).json({ message: 'Logged out successfully!' })
        }
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.switchUser = async (req, res) => {
    console.log("<<< API POST SWITCH USER >>>")

    try {
        const { email } = req.body

        const user = await User.findOne({ email })

        if (!user)
            return res.status(422).json({ error: 'User not found, with the given email!' })

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: '7d',
        })

        let oldTokens = user.tokens || []

        if (oldTokens.length) {
            oldTokens = oldTokens.filter(t => {
                const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000
                if (timeDiff < 86400) {
                    return t
                }
            })
        }
    
        await User.findByIdAndUpdate(user._id, {
            tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
        })

        const userInfo = {
            id: user._id,
            name: user.name,
            email: user.email,
            areacode: user.areacode,
            mobilenum: user.mobilenum,
            refnum: user.refnum,
            eWalletnum: user.eWalletnum,
            epacashTotal: user.epacashTotal,
            epacash: user.epacash,
            epacredits: user.epacredits,
            epaCreditsMonth: user.epaCreditsMonth,
            ecomVault: user.ecomVault,
            epatokens: user.epatokens,
            epavault: user.epavault,
            totalIncome: user.totalIncome,
            quota: user.quota,
            quotaSubWeek: user.quotaSubWeek,
            isSuspended: user.isSuspended,
            stores: user.stores,
            role: user.role,
            class: user.class,
            rank: user.rank,
            avatar: user.avatar ? user.avatar : '',
            idImage1: user.idImage1 ? user.idImage1 : '',
            idImage2: user.idImage2 ? user.idImage2 : '',
            idImage1: user.idImage3 ? user.idImage3 : '',
            religion: user.religion,
            isLegsComplete: user.isLegsComplete,
            isVerified: user.isVerified,
            status: user.status,
            spouse: user.spouse,
            father: user.father,
            mother: user.mother,
            sibling1: user.sibling1,
            sibling2: user.sibling2,
            sibling3: user.sibling3,
            sibling4: user.sibling4,
            sibling5: user.sibling5,
            otherSiblings: user.otherSiblings,
            currentCompany: user.currentCompany,
            currentJob: user.currentJob,
            dreamJob: user.dreamJob,
            salaryEmployed: user.salaryEmployed,
            salarySelfEmployed: user.salarySelfEmployed,
            salaryPension: user.salaryPension,
            dependents: user.dependents,
            isSubAccount: user.isSubAccount,
            entrepreneur: user.entrepreneur,
            supervisor: user.supervisor,
            manager: user.manager,
            ceo: user.ceo,
            businessempire: user.businessempire,
            delegatePin: user.delegatePin,
            createdAt: user.createdAt
        }

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: 'Forbidden !' })
        return res.status(201).json({ message: 'Switching User. Please wait...', httpOnly: true, secure: true, user: userInfo, token })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.requestPinCode = async (req, res) => {
    console.log("<<< API POST OTP PIN CODE REQUEST >>>")

    try {
        const { email, generatePin } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(422).json({ error: 'User not found, with the given email!' })
        }

        await Otp.deleteOne({ email })

        const token = jwt.sign({ email: email }, process.env.SECRET_KEY, {
            expiresIn: '1h'
        })
    
        const otp = await Otp({
            createdAt: dateTime.DateTime.local().toISO(),
            name: user.name,
            email: user.email,
            pin: generatePin,
            token: token
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: 'Forbidden!' })
        await otp.save()
        return res.status(201).json({ message: `Sending... OTP code to email : ${ email }`, otp })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.sentOtpEmail = async (req, res) => {
    console.log("<<< API POST SEND OTP EMAIL >>>")

    try {
        const { userName, email, pinCode } = req.body

        const transporter = nodemailer.createTransport({
            host: 'smtpout.secureserver.net', 
            secure: true,
            secureConnection: false, // TLS requires secureConnection to be false
            tls: {
                ciphers:'SSLv3'
            },
            requireTLS: true,
            port: process.env.MX_PORT,
            debug: true,
            auth: {
                user: process.env.SUPPORT_MX_SERVER,
                pass: process.env.MX_PASSWORD
            }
        })

        const mail_config = {
            from: { name: 'EPA Support', address: process.env.SUPPORT_MX_SERVER },
            to: email,
            subject: 'Password reset OTP request',
            html: `
                <h2>Hello ${ userName } !</h2>
                <h2>OTP Pin Code: ${ pinCode }</h2>`,
        }

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        transporter.sendMail(mail_config)
        return res.status(201).json({ message: 'Email sent successfully.', ...req.body })
    } catch (error) {
        console.error('An error has occured. Email not sent.', error)
        return res.status(500).json({ message: 'Server Error! Email not sent.' })
    }
}

exports.confirmPinCode = async (req, res) => {
    console.log("<<< API GET CONFIRM OTP PIN CODE >>>")
    
    try {
        const { email } = req.params
        const confirmOTP = req.headers.otp

        const otp = await Otp.findOne({ email })

        if (!otp)
            return res.status(422).json({ error: 'User not found, with the given email!' })

        if (!confirmOTP)
            return res.status(422).json({ error: 'Pin code is empty.' })

        if (confirmOTP !== otp.pin)
            return res.status(422).json({ error: 'Pin code is incorrect!' })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'OTP code match!', otp })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.passwordReset = async (req, res) => {
    console.log("<<< API PUT PASSWORD RESET REQUEST >>>")

    try {
        const { email } = req.params
        const { password } = req.body

        const user = await User.findOne({ email })

        if (!user)
            return res.status(422).json({ error: 'User not found, with the given email!' })

        const hashedPassw = await bcrypt.hash(password, 8)
    
        await User.findOneAndUpdate({ email: email }, {
            updatedAt: dateTime.DateTime.local().toISO(),
            password: hashedPassw
        })

        await Otp.deleteOne({ email })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Password changed successfully!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.accountTransfer = async (req, res) => {
    console.log("<<< API PUT ACCOUNT TRANSFER >>>")

    try {
        const { id } = req.params
        const { transferUserId, name, email, mobilenum, password } = req.body

        const shippingAddress = {
            address: '', city: '', province: '', zipcode: '', country: 'Philippines'
        }

        const user = await User.findOne({ _id: id })
        const transferUser = await User.findOne({ _id: transferUserId })

        if (name.match(/\d+/))
            return res.status(422).json({ error: 'Name must not contain a number!' })
        
        if (name.match(/[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~]/))
            return res.status(422).json({ error: 'Name must not contain special characters!' })
        
        if (mobilenum.length !== 10)
            return res.status(422).json({ error: 'Mobile number must be exactly 10 numbers!' })

        if (mobilenum.match(/[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~a-zA-Z ]/))
            return res.status(422).json({ error: 'Mobile number should be numeric.' })

        if (transferUser.iou.length)
            return res.status(422).json({ error: 'Can\'t transfer account with existing IOU.' })

        if (transferUser.loanamount.length)
            return res.status(422).json({ error: 'Can\'t transfer account with existing Loan.' })

        if (!transferUser.isSubAccount)
            return res.status(422).json({ error: 'Can\'t transfer non Sub-account.' })

        console.log('Transferring Account: ', transferUser.name, '>>', name)

        await User.findByIdAndUpdate(transferUser._id, {
            updatedAt: dateTime.DateTime.local().toISO(),
            name: name,
            email: email.toLowerCase(),
            mobilenum: mobilenum,
            password: await bcrypt.hash(password, 8),
            shippingAddress,
            role: 'enduser',
            avatar: '',
            idImage1: '',
            idImage2: '',
            idImage3: '',
            gender: '',
            birthday: 'MM/DD/YYYY',
            religion: '',
            isVerified: false,
            status: '',
            spouse: '',
            father: '',
            mother: '',
            sibling1: '',
            sibling2: '',
            sibling3: '',
            sibling4: '',
            sibling5: '',
            otherSiblings: '',
            currentCompany: '',
            currentJob: '',
            dreamJob: '',
            salaryEmployed: 0,
            salarySelfEmployed: 0,
            salaryPension: 0,
            dependents: 0,
            isSubAccount: false,
            $unset: { owner: 1 }
        })

        user.subAccounts.splice(user.subAccounts.indexOf(user._id), 0)

        // remove sub-account from previous user 
        await User.findByIdAndUpdate(id, {
            subAccounts: user.subAccounts
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Account Transfer Success!!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.editProfile = async (req, res) => {
    console.log("<<< API PUT EDIT PROFILE >>>")

    try {
        const { id } = req.params
        const { name, mobilenum, gender, birthday } = req.body

        if (name.match(/\d+/))
            return res.status(422).json({ error: 'Name must not contain a number!' })
        
        if (name.match(/[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~]/))
            return res.status(422).json({ error: 'Name must not contain special characters!' })
        
        if (mobilenum.length !== 10)
            return res.status(422).json({ error: 'Mobile number must be exactly 10 numbers!' })

        if (mobilenum.match(/[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~a-zA-Z ]/))
            return res.status(422).json({ error: 'Mobile number should be numeric.' })

        const user = await User.findByIdAndUpdate(id, {
            updatedAt: dateTime.DateTime.local().toISO(),
            avatar: req.file ? req.file.filename : req.body.avatar,
            ...req.body
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Profile Updated!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.submitVerification = async (req, res) => {
    console.log("<<< API PUT USER SUBMIT VERIFICATION >>>")

    try {
        const { id } = req.params
        const { salaryEmployed, salarySelfEmployed, salaryPension, spouse, father, mother, sibling1, sibling2, sibling3, sibling4, sibling5, otherSiblings, dependents, currentCompany, currentJob, dreamJob } = req.body

        if (req.files.verify.length < 3)
            return res.status(422).json({ error: 'Upload 3 Valid IDs!' })

        if (Number(dependents) > 3)
            return res.status(422).json({ error: 'Maximum of only (3) children.' })

        const user = await User.findByIdAndUpdate(id, {
            updatedAt: dateTime.DateTime.local().toISO(),
            idImage1: req.files.verify[0].filename,
            idImage2: req.files.verify[1].filename,
            idImage3: req.files.verify[2].filename,
            status: 'Pending',
            spouse: spouse,
            father: father,
            mother: mother,
            sibling1: sibling1,
            sibling2: sibling2,
            sibling3: sibling3,
            sibling4: sibling4,
            sibling5: sibling5,
            otherSiblings: otherSiblings,
            salaryEmployed: parseFloat(salaryEmployed),
            salarySelfEmployed: parseFloat(salarySelfEmployed),
            salaryPension: parseFloat(salaryPension),
            dependents: dependents,
            currentCompany: currentCompany,
            currentJob: currentJob,
            dreamJob: dreamJob
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Please wait for verification.', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.userVerify = async (req, res) => {
    console.log("<<< API PUT USER VERIFY >>>")

    try {
        const { id } = req.params
        const { type } = req.body

        const user = await User.findByIdAndUpdate(id, {
            updatedAt: dateTime.DateTime.local().toISO(),
            isVerified: type == 'approved' ? true : false,
            status: type == 'approved' ? 'Approved' : 'Rejected'
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: `${ type === 'approved' ? 'Verified !' : 'Rejected !' }`, type, user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.editShipping = async (req, res) => {
    console.log("<<< API PUT EDIT SHIPPING ADDRESS >>>")

    try {
        const { id } = req.params
        
        const user = await User.findByIdAndUpdate(id, {
            updatedAt: dateTime.DateTime.local().toISO(),
            shippingAddress: req.body
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Shipping Address Updated!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.addToCart = async (req, res) => {
    console.log("<<< API PUT ADD TO CART >>>")

    try {
        const { id } = req.params
        const { itemId, token } = req.body

        const user = await User.findOne({ _id: id })
        const itemExists = user.cart.find(item => item.itemId.includes(itemId))

        if (!itemExists) {
            user.cart.push({ itemId, token })
            
            await User.findByIdAndUpdate(id, {
                cart: user.cart
            })
        }
      
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Added to Cart', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.removeCart = async (req, res) => {
    console.log("<<< API PUT REMOVE FROM CART >>>")

    try {
        const { id } = req.params
        const { itemDetails } = req.body

        const user = await User.findOne({ _id: id })

        const filterItem = user.cart.filter(item => !item.itemId.includes(itemDetails._id))

        // if (filterItem)
        //     user.cart.splice(user.cart.indexOf(itemDetails._id, 1))

        await User.findByIdAndUpdate(user._id, { cart: filterItem })
      
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Removed from Cart', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

const bulkPurchasePkg = async (userObj) => {
    console.log("<<< API PUT PURCHASE SUBSCRIPTION PACKAGE >>>")

    const user = await User.findOne({ _id: userObj })
    const sponsor = await User.findOne({ _id: userObj.sponsor })

    console.log('House Upgrade Package: ', 'Entrepreneur')

    await User.findByIdAndUpdate(sponsor._id, {
        $inc: { 
            epacredits: -1000,
            epaCreditsMonth: 1000 //dont mirror  
        }
    })

    // Sponsor commission during associate package buy or upgrade
    // Earns 10% on Direct Guarantor
    await User.findByIdAndUpdate(sponsor._id, {
        $inc: { 
            epacash: 100,
            // epacredits: 100,
            // epaCreditsMonth: 100, //dont mirror
            // epavault: 100,
            totalIncome: 100
        }
    })

    const notif = await Notification({ 
        createdAt: dateTime.DateTime.local().toISO(),
        owner: sponsor._id,
        type: 'mynotif',
        message: `You earned P100 EPA Credits on 10% Direct Guarantor from ${ user.name }`,
        image: user.avatar,
        isRead: false,
        tags: 'sponsor-commission'
    })

    let parentTree = []
    let parentUser = await User.findOne({ _id: user.parent })
    let levelCount = 0

    while (parentUser) {
        levelCount ++

        parentTree.push(parentUser)

        if (levelCount === 1) {
            if (parentUser.class === 'Member') {
                // Add to notifications to upgrade package
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: parentUser._id,
                    type: 'mynotif',
                    message: `You need to buy the subscription package: Entrepreneur`,
                    isRead: false,
                    tags: 'package'
                })

                await notif.save()
            }
        }

        // if (levelCount === 2) {
        //     if (parentUser.class === 'Entrepreneur') {
        //         // Add to notifications to upgrade package
        //         const notif = await Notification({ 
        //             createdAt: dateTime.DateTime.local().toISO(),
        //             owner: parentUser._id,
        //             type: 'mynotif',
        //             message: `You need to upgrade the next subscription package: Supervisor`,
        //             isRead: false,
        //             tags: 'package'
        //         })

        //         await notif.save()
        //     }
        // }

        // if (levelCount === 4) {
        //     if (parentUser.class === 'Supervisor') {
        //         // Add to notifications to upgrade package
        //         const notif = await Notification({ 
        //             createdAt: dateTime.DateTime.local().toISO(),
        //             owner: parentUser._id,
        //             type: 'mynotif',
        //             message: `You need to upgrade the next subscription package: Manager`,
        //             isRead: false,
        //             tags: 'package'
        //         })

        //         await notif.save()
        //     }
        // }

        // if (levelCount === 6) {
        //     if (parentUser.class === 'Manager') {
        //         // Add to notifications to upgrade package
        //         const notif = await Notification({ 
        //             createdAt: dateTime.DateTime.local().toISO(),
        //             owner: parentUser._id,
        //             type: 'mynotif',
        //             message: `You need to upgrade the next subscription package: CEO`,
        //             isRead: false,
        //             tags: 'package'
        //         })

        //         await notif.save()
        //     }
        // }

        // if (levelCount === 8) {
        //     if (parentUser.class === 'CEO') {
        //         // Add to notifications to upgrade package
        //         const notif = await Notification({ 
        //             createdAt: dateTime.DateTime.local().toISO(),
        //             owner: parentUser._id,
        //             type: 'mynotif',
        //             message: `You need to upgrade the next subscription package: Business Empire`,
        //             isRead: false,
        //             tags: 'package'
        //         })

        //         await notif.save()
        //     }
        // }

        // if (levelCount >= 10) {
        //     if (parentUser.class === 'Business Empire') {
        //         // Add to notifications if 10th level reached
        //         const notif = await Notification({ 
        //             createdAt: dateTime.DateTime.local().toISO(),
        //             // owner: parentLvlTen,
        //             owner: parentUser._id,
        //             type: 'mynotif',
        //             message: `Youve'd reached the 10th level. You need to go down to the 11th level to help others.`,
        //             isRead: false,
        //             tags: 'package'
        //         })

        //         await notif.save()
        //     }
        //     // break
        // }

        if (!parentUser.parent)
            break

        parentUser = await User.findOne({ _id: parentUser.parent })
    }

    let epaCreditCommissionCount = 0, epaVaultCommissionCount = 0, epaUpgradeCommissionCount = 0, parentCount = 0
    parentTree.forEach(async usr => {
        if (usr.class !== 'Member' && String(usr._id) !== user._id && String(usr._id) !== process.env.EPA_ACCT_ID) {
            parentCount ++
            let subscriptionCheck = false

            if (parentCount <= 10) {
                subscriptionCheck = true
                // Entrepreneur
                // if (usr.class === 'Entrepreneur') {
                //     if (parentCount === 1 || parentCount === 2) {
                //         subscriptionCheck = true
                //     } else {
                //         // Add to notifications to upgrade package
                //         const notif = await Notification({ 
                //             createdAt: dateTime.DateTime.local().toISO(),
                //             owner: usr._id,
                //             type: 'mynotif',
                //             message: `Funds has been flushed out because you have not upgraded yet. Please upgrade ASAP to next subscription package: Supervisor`,
                //             isRead: false,
                //             tags: 'package'
                //         })

                //         await notif.save()
                //     }
                // }

                // if (usr.class === 'Supervisor') {
                //     if (parentCount === 1 || parentCount === 2 || parentCount === 3 || parentCount === 4) {
                //         subscriptionCheck = true
                //     } else {
                //         // Add to notifications to upgrade package
                //         const notif = await Notification({ 
                //             createdAt: dateTime.DateTime.local().toISO(),
                //             owner: usr._id,
                //             type: 'mynotif',
                //             message: `Funds has been flushed out because you have not upgraded yet. Please upgrade ASAP to next subscription package: Manager`,
                //             isRead: false,
                //             tags: 'package'
                //         })

                //         await notif.save()
                //     }
                // }

                // if (usr.class === 'Manager') {
                //     if (parentCount === 1 || parentCount === 2 || parentCount === 3 || parentCount === 4 || parentCount === 5 || parentCount === 6) {
                //         subscriptionCheck = true
                //     } else {
                //         // Add to notifications to upgrade package
                //         const notif = await Notification({ 
                //             createdAt: dateTime.DateTime.local().toISO(),
                //             owner: usr._id,
                //             type: 'mynotif',
                //             message: `Funds has been flushed out because you have not upgraded yet. Please upgrade ASAP to next subscription package: CEO`,
                //             isRead: false,
                //             tags: 'package'
                //         })

                //         await notif.save()
                //     }
                // }

                // if (usr.class === 'CEO') {
                //     if (parentCount === 1 || parentCount === 2 || parentCount === 3 || parentCount === 4 || parentCount === 5 || parentCount === 6 || parentCount === 7 || parentCount === 8) {
                //         subscriptionCheck = true
                //     } else {
                //         // Add to notifications to upgrade package
                //         const notif = await Notification({ 
                //             createdAt: dateTime.DateTime.local().toISO(),
                //             owner: usr._id,
                //             type: 'mynotif',
                //             message: `Funds has been flushed out because you have not upgraded yet. Please upgrade ASAP to next subscription package: Business Empire`,
                //             isRead: false,
                //             tags: 'package'
                //         })

                //         await notif.save()
                //     }
                // }

                // if (usr.class === 'Business Empire') {
                //     if (parentCount === 1 || parentCount === 2 || parentCount === 3 || parentCount === 4 || parentCount === 5 || parentCount === 6 || parentCount === 7 || parentCount === 8 || parentCount === 9 || parentCount === 10) {
                //         subscriptionCheck = true
                //     } else {
                //         // Add to notifications to upgrade package
                //         const notif = await Notification({ 
                //             createdAt: dateTime.DateTime.local().toISO(),
                //             owner: usr._id,
                //             type: 'mynotif',
                //             message: `Youve'd reached the 10th level. You need to go down to the 11th level to help others. Please create a new account under the 10th level.`,
                //             isRead: false,
                //             tags: 'package'
                //         })

                //         await notif.save()
                //     }
                // }

                // Each Business Associates under you can earn you a credit of 100 pesos each children
                if (!usr.isEpaCreditCommission) { // kani dili foundation sulod epacash
                    console.log('Parent Tree | Credit Commission: ', usr.name)
                    epaCreditCommissionCount ++
                    if (subscriptionCheck) {
                        await User.findByIdAndUpdate(usr._id, {
                            $inc: { 
                                epacredits: 100,
                                // epaCreditsMonth: 100, //dont mirror
                                // epavault: 100, // mirror
                                // totalIncome: 100
                            }
                        })

                        // Add to notifications to upgrade package
                        const notif = await Notification({ 
                            createdAt: dateTime.DateTime.local().toISO(),
                            owner: usr._id,
                            type: 'mynotif',
                            message: `You earned PHP 100 commission for every upgrade of member.`,
                            isRead: false,
                            tags: 'package'
                        })

                        await notif.save()
                    }
                }
                // Earns 10 pesos for every new member down depends to your package level
                if (!usr.isEpaVaultCommission) {
                    console.log('Parent Tree | Vault Commission: ', usr.name)
                    epaVaultCommissionCount ++
                    if (subscriptionCheck) {
                        await User.findByIdAndUpdate(usr._id, {
                            $inc: { 
                                epacash: 10,
                                // epavault: 10,
                                // epacredits: 10,
                                // epaCreditsMonth: 10, //dont mirror
                                totalIncome: 10
                            }
                        })

                        // Add to notifications to upgrade package
                        const notif = await Notification({ 
                            createdAt: dateTime.DateTime.local().toISO(),
                            owner: usr._id,
                            type: 'mynotif',
                            message: `You earned PHP 10 commission for every new member.`,
                            isRead: false,
                            tags: 'package'
                        })

                        await notif.save()
                    }
                }
                // Earns 100 pesos for every upgrade of member
                // if (!usr.isEpaUpgradeCommission) {
                //     // epaUpgradeCommissionCount ++
                //     console.log('Parent Tree | Upgrade Commission: ', usr.name)
                //     epaUpgradeCommissionCount ++
                //     if (subscriptionCheck) {
                //         await User.findByIdAndUpdate(usr._id, {
                //             $inc: { 
                //                 epavault: 100,
                //                 epacredits: 100,
                //                 epaCreditsMonth: 100, //mirror
                //                 totalIncome: 100
                //             }
                //         })
                //     }
                // }
            }

            // QUOTA
            const today = dateTime.DateTime.now().toISO()
            const date = dateTime.DateTime.fromISO(today)
            const dayName = date.toLocaleString({ weekday: 'long' })
            const settings = await Setting.findOne({})

            if (dayName !== 'Saturday') {
                console.log('< Add Quota Day >', dayName)

                const numAssociates = await User.aggregate([
                    { $match: { _id: new ObjectId(usr._id) } },
                    { $graphLookup: {
                        from: 'users',
                        startWith: '$children._id',
                        connectFromField: 'children._id',
                        connectToField: '_id',
                        as: 'allChildren',
                        depthField: 'depth'
                    }},
                    { $addFields: {
                        childrenMember: { $size: { $filter: {
                            input: '$allChildren',
                            as: 'child',
                            cond: { $eq: [ '$$child.class', 'Member' ] }}
                        }},
                    }},
                    { $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        childrenCount: { $sum: { $size: '$allChildren' } },
                        childrenMember: { $first: '$childrenMember' }
                    }}
                ])

                if (numAssociates.length) {
                    const validChildrenCount = numAssociates[0].childrenCount - numAssociates[0].childrenMember
                    const quotaBase = settings.base * validChildrenCount
                    const quotaFormula = (( quotaBase * validChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10
    
                    await User.findByIdAndUpdate(usr._id, {
                        quota: quotaFormula.toFixed(4)
                    })
    
                    console.log('< Add Quota >', usr.name, quotaFormula.toFixed(4))
                }
            } else {
                console.log('< Add Quota Day >', dayName)

                const numAssociates = await User.aggregate([
                    { $match: { _id: new ObjectId(usr._id) } },
                    { $graphLookup: {
                        from: 'users',
                        startWith: '$children._id',
                        connectFromField: 'children._id',
                        connectToField: '_id',
                        as: 'allChildren',
                        depthField: 'depth'
                    }},
                    { $addFields: {
                        childrenMember: { $size: { $filter: {
                            input: '$allChildren',
                            as: 'child',
                            cond: { $eq: [ '$$child.class', 'Member' ] }}
                        }},
                    }},
                    { $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        childrenCount: { $sum: { $size: '$allChildren' } },
                        childrenMember: { $first: '$childrenMember' }
                    }}
                ])

                if (numAssociates.length) {
                    const validChildrenCount = numAssociates[0].childrenCount - numAssociates[0].childrenMember
                    const quotaBase = settings.base * validChildrenCount
                    const quotaFormula = (( quotaBase * validChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10
    
                    await User.findByIdAndUpdate(usr._id, {
                        quotaSubWeek: quotaFormula.toFixed(4)
                    })
    
                    console.log('< Add Quota >', usr.name, quotaFormula.toFixed(4))
                }
            }
        }
    })

    if (epaCreditCommissionCount > 0) {
        // Give EPA Account extra bonuses
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $inc: {
                epacredits: 100 * (10 - epaCreditCommissionCount),
                // epaCreditsMonth: 100 * (10 - epaCreditCommissionCount), //dont mirror
                // totalIncome: 100 * (10 - epaCreditCommissionCount)
            }
        })

        console.log('EPA Credit Commission Count: ', epaCreditCommissionCount)
        console.log('Give EPA Account Credit Extra: ', 10 - epaCreditCommissionCount)   
    }

    if (epaVaultCommissionCount > 0) {
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $inc: {
                epacash: 10 * (10 - epaVaultCommissionCount),
                // epavault: 10 * (10 - epaVaultCommissionCount),
                // epacredits: 10 * (10 - epaVaultCommissionCount),
                // epaCreditsMonth: 10 * (10 - epaVaultCommissionCount), //dont mirror
                totalIncome: 10 * (10 - epaVaultCommissionCount)
            }
        })
    
        console.log('EPA Vault Commission Count: ', epaVaultCommissionCount)
        console.log('Give EPA Account Vault Extra: ', 10 - epaVaultCommissionCount)
    }

    let parentTree2 = []

    while (parentUser) {
        parentTree2.push(parentUser)

        if (!parentUser.parent)
            break

        parentUser = await User.findOne({ _id: parentUser.parent })
    }

    // console.log('Parent Tree 2: ', parentTree2)

    // Not 10 Levels
    parentTree2.forEach(async usr => {
        if (usr.class !== 'Member' && String(usr._id) !== user._id && String(usr._id) !== process.env.EPA_ACCT_ID) {
            console.log('Parent Tree 2 | Update User: ', usr.name)

            // await User.findByIdAndUpdate(usr._id, {
            //     $inc: {
            //         epatokens: 33.33 * 10
            //     }
            // })
        }
    })

    let notif2

    if (!parentUser.isLegsComplete && parentUser.children.length === 3) {
        let childrenTree = []
        let idx = 0
        let childrenUser = await User.findOne({ _id: parentUser.children[idx]._id })

        while (childrenUser) {                
            idx ++
            childrenTree.push(childrenUser)
            
            if (!parentUser.children[idx])
                break

            childrenUser = await User.findOne({ _id: parentUser.children[idx]._id })
        }

        let childCount = 0
        
        childrenTree.forEach(async child => {
            if (child.class !== 'Member') {
                console.log('Children Tree | Update User: ', child.name)
                childCount ++
                // await User.findByIdAndUpdate(child._id, {
                //     $inc: {
                //         epacredits: 10,
                //         epavault: 10,
                //         epatokens: 33.33 * 10
                //     }
                // })
            }
        })

        // Earn 100 pesos for every completed team of 3 Business Associates
        if (childCount === 3) {
            console.log('Legs Completed User: ', parentUser.name)
            await User.findByIdAndUpdate(parentUser._id, {
                isLegsComplete: true, // update legs
                $inc: { 
                    epacash: 100,
                    // epavault: 100,
                    // epacredits: 100, // mirror
                    // epaCreditsMonth: 100, //dont mirror
                    totalIncome: 100
                }
            })
            // Add to notifications
            notif2 = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: parentUser._id,
                type: 'mynotif',
                message: `You earned P100 EPA Credits for completing team of 3 Business Associates`,
                isRead: false,
                tags: 'package'
            })
        }
    }

    // Add to notifications
    const notif3 = await Notification({ 
        createdAt: dateTime.DateTime.local().toISO(),
        owner: user._id,
        type: 'mynotif',
        message: `Subscription package upgraded to Entrepreneur`,
        isRead: false,
        tags: 'package'
    })

    const load = await Load({ 
        createdAt: dateTime.DateTime.local().toISO(),
        type: `Upgraded Sub-account subscription package to Entrepreneur`,
        owner: sponsor._id,
        sender: sponsor.name,
        recipient: sponsor.name,
        email: sponsor.email,
        mobilenum: sponsor.mobilenum,
        eWalletnum: sponsor.eWalletnum,
        amount: parseFloat(1000).toFixed(2),
        refnum: gpc(12)
    })

    if (notif) await notif.save()
    if (notif2) await notif2.save()
    await notif3.save()
    // if (notif4) await notif4.save()
    await load.save()
}

const purchasePkgSilver = async (userObj) => {
    console.log("<<< API PUT PURCHASE SUBSCRIPTION PACKAGE SILVER >>>")

    const user = await User.findOne({ _id: userObj })
    const sponsor = await User.findOne({ _id: userObj.sponsor })

    console.log('New House Package: ', 'Silver')

    const settings = await Setting.findOne({})

    // Sponsor commission during associate package buy or upgrade
    // Earns 10% on Direct Guarantor
    await User.findByIdAndUpdate(sponsor._id, {
        $inc: { 
            epacash: 100,
            // epacredits: 100,
            // epaCreditsMonth: 100, //dont mirror
            // epavault: 100,
            totalIncome: 100
        }
    })

    const notif = await Notification({ 
        createdAt: dateTime.DateTime.local().toISO(),
        owner: sponsor._id,
        type: 'mynotif',
        message: `You earned P100 EPA Credits on 10% Direct Guarantor from ${ user.name }`,
        image: user.avatar,
        isRead: false,
        tags: 'sponsor-commission'
    })

    let parentTree = []
    let parentUser = await User.findOne({ _id: user.parent })
    let levelCount = 0

    while (parentUser) {
        levelCount ++

        parentTree.push(parentUser)

        if (levelCount === 1) {
            if (parentUser.class === 'Member') {
                // Add to notifications to upgrade package
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: parentUser._id,
                    type: 'mynotif',
                    message: `You need to buy the subscription package: Entrepreneur`,
                    isRead: false,
                    tags: 'package'
                })

                await notif.save()
            }
        }

        if (!parentUser.parent)
            break

        parentUser = await User.findOne({ _id: parentUser.parent })
    }

    let epaCreditCommissionCount = 0, epaVaultCommissionCount = 0, epaUpgradeCommissionCount = 0, parentCount = 0
    parentTree.forEach(async usr => {
        if (usr.class !== 'Member' && String(usr._id) !== user._id && String(usr._id) !== process.env.EPA_ACCT_ID) {
            parentCount ++

            if (parentCount <= 10) {
                // Each Business Associates under you can earn you a credit of 100 pesos each children
                if (!usr.isEpaCreditCommission) {
                    console.log('Parent Tree | Credit Commission: ', usr.name)
                    epaCreditCommissionCount ++

                    await User.findByIdAndUpdate(usr._id, {
                        $inc: { 
                            epacredits: 100,
                            // epaCreditsMonth: 100, //dont mirror
                            epavault: 100, // mirror
                            totalIncome: 100
                        }
                    })

                    // Add to notifications to upgrade package
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: usr._id,
                        type: 'mynotif',
                        message: `You earned PHP 100 commission for every upgrade of member.`,
                        isRead: false,
                        tags: 'package'
                    })

                    await notif.save()
                }
                // Earns 10 pesos for every new member down depends to your package level
                if (!usr.isEpaVaultCommission) {
                    console.log('Parent Tree | Vault Commission: ', usr.name)
                    epaVaultCommissionCount ++
                    await User.findByIdAndUpdate(usr._id, {
                        $inc: { 
                            epavault: 10,
                            epacredits: 10,
                            // epaCreditsMonth: 10, //dont mirror
                            totalIncome: 10
                        }
                    })

                    // Add to notifications to upgrade package
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: usr._id,
                        type: 'mynotif',
                        message: `You earned PHP 10 commission for every new member.`,
                        isRead: false,
                        tags: 'package'
                    })

                    await notif.save()
                }
            }

            // QUOTA
            const today = dateTime.DateTime.now().toISO()
            const date = dateTime.DateTime.fromISO(today)
            const dayName = date.toLocaleString({ weekday: 'long' })
            const settings = await Setting.findOne({})

            if (dayName !== 'Saturday') {
                console.log('< Add Quota Day >', dayName)

                const numAssociates = await User.aggregate([
                    { $match: { _id: new ObjectId(usr._id) } },
                    { $graphLookup: {
                        from: 'users',
                        startWith: '$children._id',
                        connectFromField: 'children._id',
                        connectToField: '_id',
                        as: 'allChildren',
                        depthField: 'depth'
                    }},
                    { $addFields: {
                        childrenMember: { $size: { $filter: {
                            input: '$allChildren',
                            as: 'child',
                            cond: { $eq: [ '$$child.class', 'Member' ] }}
                        }},
                    }},
                    { $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        childrenCount: { $sum: { $size: '$allChildren' } },
                        childrenMember: { $first: '$childrenMember' }
                    }}
                ])

                if (numAssociates.length) {
                    const validChildrenCount = numAssociates[0].childrenCount - numAssociates[0].childrenMember
                    const quotaBase = settings.base * validChildrenCount
                    const quotaFormula = (( quotaBase * validChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10
    
                    await User.findByIdAndUpdate(usr._id, {
                        quota: quotaFormula.toFixed(4)
                    })
    
                    console.log('< Add Quota >', usr.name, quotaFormula.toFixed(4))
                }
            } else {
                console.log('< Add Quota Day >', dayName)

                const numAssociates = await User.aggregate([
                    { $match: { _id: new ObjectId(usr._id) } },
                    { $graphLookup: {
                        from: 'users',
                        startWith: '$children._id',
                        connectFromField: 'children._id',
                        connectToField: '_id',
                        as: 'allChildren',
                        depthField: 'depth'
                    }},
                    { $addFields: {
                        childrenMember: { $size: { $filter: {
                            input: '$allChildren',
                            as: 'child',
                            cond: { $eq: [ '$$child.class', 'Member' ] }}
                        }},
                    }},
                    { $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        childrenCount: { $sum: { $size: '$allChildren' } },
                        childrenMember: { $first: '$childrenMember' }
                    }}
                ])

                if (numAssociates.length) {
                    const validChildrenCount = numAssociates[0].childrenCount - numAssociates[0].childrenMember
                    const quotaBase = settings.base * validChildrenCount
                    const quotaFormula = (( quotaBase * validChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10
    
                    await User.findByIdAndUpdate(usr._id, {
                        quotaSubWeek: quotaFormula.toFixed(4)
                    })
    
                    console.log('< Add Quota >', usr.name, quotaFormula.toFixed(4))
                }
            }
        }
    })

    if (epaCreditCommissionCount > 0) {
        // Give EPA Account extra bonuses
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $inc: { 
                epacredits: 100 * (10 - epaCreditCommissionCount),
                // epaCreditsMonth: 100 * (10 - epaCreditCommissionCount), //dont mirror
                totalIncome: 100 * (10 - epaCreditCommissionCount)
            }
        })

        console.log('EPA Credit Commission Count: ', epaCreditCommissionCount)
        console.log('Give EPA Account Credit Extra: ', 10 - epaCreditCommissionCount)
    }

    if (epaVaultCommissionCount > 0) {
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $inc: {
                epavault: 10 * (10 - epaVaultCommissionCount),
                epacredits: 10 * (10 - epaVaultCommissionCount),
                // epaCreditsMonth: 10 * (10 - epaVaultCommissionCount), //dont mirror
                totalIncome: 10 * (10 - epaVaultCommissionCount)
            }
        })
    
        console.log('EPA Vault Commission Count: ', epaVaultCommissionCount)
        console.log('Give EPA Account Vault Extra: ', 10 - epaVaultCommissionCount)
    }

    let parentTree2 = []

    while (parentUser) {
        parentTree2.push(parentUser)

        if (!parentUser.parent)
            break

        parentUser = await User.findOne({ _id: parentUser.parent })
    }

    // console.log('Parent Tree 2: ', parentTree2)

    // Not 10 Levels
    parentTree2.forEach(async usr => {
        if (usr.class !== 'Member' && String(usr._id) !== user._id && String(usr._id) !== process.env.EPA_ACCT_ID) {
            console.log('Parent Tree 2 | Update User: ', usr.name)

            // await User.findByIdAndUpdate(usr._id, {
            //     $inc: {
            //         epatokens: 33.33 * 10
            //     }
            // })
        }
    })

    let notif2

    if (!parentUser.isLegsComplete && parentUser.children.length === 3) {
        let childrenTree = []
        let idx = 0
        let childrenUser = await User.findOne({ _id: parentUser.children[idx]._id })

        while (childrenUser) {                
            idx ++
            childrenTree.push(childrenUser)
            
            if (!parentUser.children[idx])
                break

            childrenUser = await User.findOne({ _id: parentUser.children[idx]._id })
        }

        let childCount = 0
        
        childrenTree.forEach(async child => {
            if (child.class !== 'Member') {
                console.log('Children Tree | Update User: ', child.name)
                childCount ++
                // await User.findByIdAndUpdate(child._id, {
                //     $inc: {
                //         epacredits: 10,
                //         epavault: 10,
                //         epatokens: 33.33 * 10
                //     }
                // })
            }
        })

        // Earn 100 pesos for every completed team of 3 Business Associates
        if (childCount === 3) {
            console.log('Legs Completed User: ', parentUser.name)
            await User.findByIdAndUpdate(parentUser._id, {
                isLegsComplete: true, // update legs
                $inc: { 
                    epacash: 100,
                    // epavault: 100,
                    // epacredits: 100, // mirror
                    // epaCreditsMonth: 100, //dont mirror
                    totalIncome: 100
                }
            })
            // Add to notifications
            notif2 = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: parentUser._id,
                type: 'mynotif',
                message: `You earned P100 EPA Credits for completing team of 3 Business Associates`,
                isRead: false,
                tags: 'package'
            })
        }
    }

    // Add to notifications
    const notif3 = await Notification({ 
        createdAt: dateTime.DateTime.local().toISO(),
        owner: id,
        type: 'mynotif',
        message: `Congratulations! You are now promoted to Silver Entrepreneur`,
        isRead: false,
        tags: 'package'
    })

    const load = await Load({ 
        createdAt: dateTime.DateTime.local().toISO(),
        type: `Subscription package upgraded to Silver Entrepreneur`,
        owner: user._id,
        sender: user.name,
        recipient: user.name,
        email: user.email,
        mobilenum: user.mobilenum,
        eWalletnum: user.eWalletnum,
        amount: parseFloat(settings.silverEntrepreneurFee).toFixed(2),
        refnum: gpc(12)
    })

    if (notif) await notif.save()
    if (notif2) await notif2.save()
    await notif3.save()
    // if (notif4) await notif4.save()
    await load.save()
}

const purchasePkgGold = async (userObj) => {
    console.log("<<< API PUT PURCHASE SUBSCRIPTION PACKAGE GOLD >>>")

    const user = await User.findOne({ _id: userObj })
    const sponsor = await User.findOne({ _id: userObj.sponsor })

    console.log('New House Package: ', 'Gold')

    const settings = await Setting.findOne({})

    // Sponsor commission during associate package buy or upgrade
    // Earns 10% on Direct Guarantor
    await User.findByIdAndUpdate(sponsor._id, {
        $inc: {
            epacash: 100,
            // epacredits: 100,
            // epaCreditsMonth: 100, //dont mirror
            // epavault: 100,
            totalIncome: 100
        }
    })

    const notif = await Notification({ 
        createdAt: dateTime.DateTime.local().toISO(),
        owner: sponsor._id,
        type: 'mynotif',
        message: `You earned P100 EPA Credits on 10% Direct Guarantor from ${ user.name }`,
        image: user.avatar,
        isRead: false,
        tags: 'sponsor-commission'
    })

    let parentTree = []
    let parentUser = await User.findOne({ _id: user.parent })
    let levelCount = 0

    while (parentUser) {
        levelCount ++

        parentTree.push(parentUser)

        if (levelCount === 1) {
            if (parentUser.class === 'Member') {
                // Add to notifications to upgrade package
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: parentUser._id,
                    type: 'mynotif',
                    message: `You need to buy the subscription package: Entrepreneur`,
                    isRead: false,
                    tags: 'package'
                })

                await notif.save()
            }
        }

        if (!parentUser.parent)
            break

        parentUser = await User.findOne({ _id: parentUser.parent })
    }

    let epaCreditCommissionCount = 0, epaVaultCommissionCount = 0, epaUpgradeCommissionCount = 0, parentCount = 0
    parentTree.forEach(async usr => {
        if (usr.class !== 'Member' && String(usr._id) !== user._id && String(usr._id) !== process.env.EPA_ACCT_ID) {
            parentCount ++

            if (parentCount <= 10) {
                // Each Business Associates under you can earn you a credit of 100 pesos each children
                if (!usr.isEpaCreditCommission) {
                    console.log('Parent Tree | Credit Commission: ', usr.name)
                    epaCreditCommissionCount ++

                    await User.findByIdAndUpdate(usr._id, {
                        $inc: { 
                            epacredits: 100,
                            // epaCreditsMonth: 100, //dont mirror
                            epavault: 100, // mirror
                            totalIncome: 100
                        }
                    })

                    // Add to notifications to upgrade package
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: usr._id,
                        type: 'mynotif',
                        message: `You earned PHP 100 commission for every upgrade of member.`,
                        isRead: false,
                        tags: 'package'
                    })

                    await notif.save()
                }
                // Earns 10 pesos for every new member down depends to your package level
                if (!usr.isEpaVaultCommission) {
                    console.log('Parent Tree | Vault Commission: ', usr.name)
                    epaVaultCommissionCount ++
                    await User.findByIdAndUpdate(usr._id, {
                        $inc: { 
                            epavault: 10,
                            epacredits: 10,
                            // epaCreditsMonth: 10, //dont mirror
                            totalIncome: 10
                        }
                    })

                        // Add to notifications to upgrade package
                        const notif = await Notification({ 
                            createdAt: dateTime.DateTime.local().toISO(),
                            owner: usr._id,
                            type: 'mynotif',
                            message: `You earned PHP 10 commission for every new member.`,
                            isRead: false,
                            tags: 'package'
                        })

                        await notif.save()
                }
            }

            // QUOTA
            const today = dateTime.DateTime.now().toISO()
            const date = dateTime.DateTime.fromISO(today)
            const dayName = date.toLocaleString({ weekday: 'long' })
            const settings = await Setting.findOne({})

            if (dayName !== 'Saturday') {
                console.log('< Add Quota Day >', dayName)

                const numAssociates = await User.aggregate([
                    { $match: { _id: new ObjectId(usr._id) } },
                    { $graphLookup: {
                        from: 'users',
                        startWith: '$children._id',
                        connectFromField: 'children._id',
                        connectToField: '_id',
                        as: 'allChildren',
                        depthField: 'depth'
                    }},
                    { $addFields: {
                        childrenMember: { $size: { $filter: {
                            input: '$allChildren',
                            as: 'child',
                            cond: { $eq: [ '$$child.class', 'Member' ] }}
                        }},
                    }},
                    { $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        childrenCount: { $sum: { $size: '$allChildren' } },
                        childrenMember: { $first: '$childrenMember' }
                    }}
                ])

                if (numAssociates.length) {
                    const validChildrenCount = numAssociates[0].childrenCount - numAssociates[0].childrenMember
                    const quotaBase = settings.base * validChildrenCount
                    const quotaFormula = (( quotaBase * validChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10
    
                    await User.findByIdAndUpdate(usr._id, {
                        quota: quotaFormula.toFixed(4)
                    })
    
                    console.log('< Add Quota >', usr.name, quotaFormula.toFixed(4))
                }
            } else {
                console.log('< Add Quota Day >', dayName)

                const numAssociates = await User.aggregate([
                    { $match: { _id: new ObjectId(usr._id) } },
                    { $graphLookup: {
                        from: 'users',
                        startWith: '$children._id',
                        connectFromField: 'children._id',
                        connectToField: '_id',
                        as: 'allChildren',
                        depthField: 'depth'
                    }},
                    { $addFields: {
                        childrenMember: { $size: { $filter: {
                            input: '$allChildren',
                            as: 'child',
                            cond: { $eq: [ '$$child.class', 'Member' ] }}
                        }},
                    }},
                    { $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        childrenCount: { $sum: { $size: '$allChildren' } },
                        childrenMember: { $first: '$childrenMember' }
                    }}
                ])

                if (numAssociates.length) {
                    const validChildrenCount = numAssociates[0].childrenCount - numAssociates[0].childrenMember
                    const quotaBase = settings.base * validChildrenCount
                    const quotaFormula = (( quotaBase * validChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10
    
                    await User.findByIdAndUpdate(usr._id, {
                        quotaSubWeek: quotaFormula.toFixed(4)
                    })
    
                    console.log('< Add Quota >', usr.name, quotaFormula.toFixed(4))
                }
            }
        }
    })

    if (epaCreditCommissionCount > 0) {
        // Give EPA Account extra bonuses
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $inc: { 
                epacredits: 100 * (10 - epaCreditCommissionCount),
                // epaCreditsMonth: 100 * (10 - epaCreditCommissionCount), //dont mirror
                totalIncome: 100 * (10 - epaCreditCommissionCount)
            }
        })

        console.log('EPA Credit Commission Count: ', epaCreditCommissionCount)
        console.log('Give EPA Account Credit Extra: ', 10 - epaCreditCommissionCount)
    }

    if (epaVaultCommissionCount > 0) {
        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
            $inc: {
                epavault: 10 * (10 - epaVaultCommissionCount),
                epacredits: 10 * (10 - epaVaultCommissionCount),
                // epaCreditsMonth: 10 * (10 - epaVaultCommissionCount), //dont mirror
                totalIncome: 10 * (10 - epaVaultCommissionCount)
            }
        })
    
        console.log('EPA Vault Commission Count: ', epaVaultCommissionCount)
        console.log('Give EPA Account Vault Extra: ', 10 - epaVaultCommissionCount)
    }

    let parentTree2 = []

    while (parentUser) {
        parentTree2.push(parentUser)

        if (!parentUser.parent)
            break

        parentUser = await User.findOne({ _id: parentUser.parent })
    }

    // console.log('Parent Tree 2: ', parentTree2)

    // Not 10 Levels
    parentTree2.forEach(async usr => {
        if (usr.class !== 'Member' && String(usr._id) !== user._id && String(usr._id) !== process.env.EPA_ACCT_ID) {
            console.log('Parent Tree 2 | Update User: ', usr.name)

            // await User.findByIdAndUpdate(usr._id, {
            //     $inc: {
            //         epatokens: 33.33 * 10
            //     }
            // })
        }
    })

    let notif2

    if (!parentUser.isLegsComplete && parentUser.children.length === 3) {
        let childrenTree = []
        let idx = 0
        let childrenUser = await User.findOne({ _id: parentUser.children[idx]._id })

        while (childrenUser) {                
            idx ++
            childrenTree.push(childrenUser)
            
            if (!parentUser.children[idx])
                break

            childrenUser = await User.findOne({ _id: parentUser.children[idx]._id })
        }

        let childCount = 0
        
        childrenTree.forEach(async child => {
            if (child.class !== 'Member') {
                console.log('Children Tree | Update User: ', child.name)
                childCount ++
                // await User.findByIdAndUpdate(child._id, {
                //     $inc: {
                //         epacredits: 10,
                //         epavault: 10,
                //         epatokens: 33.33 * 10
                //     }
                // })
            }
        })

        // Earn 100 pesos for every completed team of 3 Business Associates
        if (childCount === 3) {
            console.log('Legs Completed User: ', parentUser.name)
            await User.findByIdAndUpdate(parentUser._id, {
                isLegsComplete: true, // update legs
                $inc: { 
                    epacash: 100,
                    // epavault: 100,
                    // epacredits: 100, // mirror
                    // epaCreditsMonth: 100, //dont mirror
                    totalIncome: 100
                }
            })
            // Add to notifications
            notif2 = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: parentUser._id,
                type: 'mynotif',
                message: `You earned P100 EPA Credits for completing team of 3 Business Associates`,
                isRead: false,
                tags: 'package'
            })
        }
    }

    // Add to notifications
    const notif3 = await Notification({ 
        createdAt: dateTime.DateTime.local().toISO(),
        owner: user._id,
        type: 'mynotif',
        message: `Congratulations! You are now promoted to Gold Entrepreneur`,
        isRead: false,
        tags: 'package'
    })

    const load = await Load({ 
        createdAt: dateTime.DateTime.local().toISO(),
        type: `Subscription package upgraded to Gold Entrepreneur`,
        owner: user._id,
        sender: user.name,
        recipient: user.name,
        email: user.email,
        mobilenum: user.mobilenum,
        eWalletnum: user.eWalletnum,
        amount: parseFloat(settings.goldEntrepreneurFee).toFixed(2),
        refnum: gpc(12)
    })

    if (notif) await notif.save()
    if (notif2) await notif2.save()
    await notif3.save()
    // if (notif4) await notif4.save()
    await load.save()
}

exports.purchasePkg = async (req, res) => {
    console.log("<<< API PUT PURCHASE SUBSCRIPTION PACKAGE >>>")

    try {
        const { id } = req.params
        const { package, price } = req.body

        const user = await User.findOne({ _id: id })
        const sponsor = await User.findOne({ _id: user.sponsor })

        if (user.class === 'Member' && parseFloat(user.epacash) < parseFloat(price))
            return res.status(422).json({ error: 'Not enough EPA Cash.' })

        if (user.class !== 'Member' && parseFloat(user.epacredits) < parseFloat(price))
            return res.status(422).json({ error: 'Not enough EPA Credits.' })

        let newPkg

        if (package === 'entrepreneur')
            newPkg = 'Entrepreneur'
        if (package === 'supervisor')
            newPkg = 'Supervisor'
        if (package === 'manager')
            newPkg = 'Manager'
        if (package === 'ceo')
            newPkg = 'CEO'
        if (package === 'businessempire')
            newPkg = 'Business Empire'

        let buy = false

        // During first time Purchase
        if (user.class === 'Member') {
            console.log('Purchase Package: ', newPkg)
            await User.findByIdAndUpdate(user._id, {
                class: newPkg,
                rank: 'Solopreneur',
                $inc: { epacash: -parseFloat(price).toFixed(2) }
            })
            buy = true
        // During Upgrade
        } else {
            console.log('Upgrade Package: ', newPkg)
            await User.findByIdAndUpdate(user._id, {
                class: newPkg,
                $inc: { 
                    epacredits: -parseFloat(price).toFixed(2),
                    epaCreditsMonth: parseFloat(price).toFixed(2) //mirror
                }
            })
        }

        let bonusCredit = 0

        if (newPkg === 'Entrepreneur')
            bonusCredit = 100
        if (newPkg === 'Supervisor')
            bonusCredit = 300
        if (newPkg === 'Manager')
            bonusCredit = 500
        if (newPkg === 'CEO')
            bonusCredit = 800
        if (newPkg === 'Business Empire')
            bonusCredit = 1000

        // Sponsor commission during associate package buy or upgrade
        // Earns 10% on Direct Guarantor
        let notif

        const today = dateTime.DateTime.now().toISO()
        const date = dateTime.DateTime.fromISO(today)
        const dayName = date.toLocaleString({ weekday: 'long' })
        const settings = await Setting.findOne({})

        if (buy) {
            await User.findByIdAndUpdate(sponsor._id, {
                $inc: { 
                    epacredits: bonusCredit,
                    // epaCreditsMonth: bonusCredit, //dont mirror
                    // epavault: bonusCredit,
                    totalIncome: bonusCredit
                    // epatokens: 0.30 * 10
                }
            })

            notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: sponsor._id,
                type: 'mynotif',
                message: `You earned PHP ${ bonusCredit } EPA Credits on 10% Direct Guarantor from ${ user.name }`,
                image: user.avatar,
                isRead: false,
                tags: 'sponsor-commission'
            })
        }

        let parentTree = []
        let parentUser = await User.findOne({ _id: user.parent })
        let levelCount = 0

        while (parentUser) {
            levelCount ++

            parentTree.push(parentUser)

            if (levelCount === 1) {
                if (parentUser.class === 'Member') {
                    // Add to notifications to upgrade package
                    const notif = await Notification({ 
                        createdAt: dateTime.DateTime.local().toISO(),
                        owner: parentUser._id,
                        type: 'mynotif',
                        message: `You need to buy the subscription package: Entrepreneur`,
                        isRead: false,
                        tags: 'package'
                    })

                    await notif.save()
                }
            }

            // if (levelCount === 2) {
            //     if (parentUser.class === 'Entrepreneur') {
            //         // Add to notifications to upgrade package
            //         const notif = await Notification({ 
            //             createdAt: dateTime.DateTime.local().toISO(),
            //             owner: parentUser._id,
            //             type: 'mynotif',
            //             message: `You need to upgrade the next subscription package: Supervisor`,
            //             isRead: false,
            //             tags: 'package'
            //         })
    
            //         await notif.save()
            //     }
            // }

            // if (levelCount === 4) {
            //     if (parentUser.class === 'Supervisor') {
            //         // Add to notifications to upgrade package
            //         const notif = await Notification({ 
            //             createdAt: dateTime.DateTime.local().toISO(),
            //             owner: parentUser._id,
            //             type: 'mynotif',
            //             message: `You need to upgrade the next subscription package: Manager`,
            //             isRead: false,
            //             tags: 'package'
            //         })
    
            //         await notif.save()
            //     }
            // }

            // if (levelCount === 6) {
            //     if (parentUser.class === 'Manager') {
            //         // Add to notifications to upgrade package
            //         const notif = await Notification({ 
            //             createdAt: dateTime.DateTime.local().toISO(),
            //             owner: parentUser._id,
            //             type: 'mynotif',
            //             message: `You need to upgrade the next subscription package: CEO`,
            //             isRead: false,
            //             tags: 'package'
            //         })
    
            //         await notif.save()
            //     }
            // }

            // if (levelCount === 8) {
            //     if (parentUser.class === 'CEO') {
            //         // Add to notifications to upgrade package
            //         const notif = await Notification({ 
            //             createdAt: dateTime.DateTime.local().toISO(),
            //             owner: parentUser._id,
            //             type: 'mynotif',
            //             message: `You need to upgrade the next subscription package: Business Empire`,
            //             isRead: false,
            //             tags: 'package'
            //         })
    
            //         await notif.save()
            //     }
            // }

            // if (levelCount >= 10) {
            //     if (parentUser.class === 'Business Empire') {
            //         // Add to notifications if 10th level reached
            //         const notif = await Notification({ 
            //             createdAt: dateTime.DateTime.local().toISO(),
            //             // owner: parentLvlTen,
            //             owner: parentUser._id,
            //             type: 'mynotif',
            //             message: `Youve'd reached the 10th level. You need to go down to the 11th level to help others.`,
            //             isRead: false,
            //             tags: 'package'
            //         })
    
            //         await notif.save()
            //     }
            //     // break
            // }

            if (!parentUser.parent)
                break

            parentUser = await User.findOne({ _id: parentUser.parent })
        }

        let epaCreditCommissionCount = 0, epaVaultCommissionCount = 0, epaUpgradeCommissionCount = 0, parentCount = 0
        
        parentTree.forEach(async usr => {
            if (usr.class !== 'Member' && String(usr._id) !== user._id && String(usr._id) !== process.env.EPA_ACCT_ID) {
                parentCount ++
                let subscriptionCheck = false

                if (parentCount <= 10) {
                    subscriptionCheck = true
                    // // Entrepreneur
                    // if (usr.class === 'Entrepreneur') {
                    //     if (parentCount === 1 || parentCount === 2) {
                    //         subscriptionCheck = true
                    //     } else {
                    //         // Add to notifications to upgrade package
                    //         const notif = await Notification({ 
                    //             createdAt: dateTime.DateTime.local().toISO(),
                    //             owner: usr._id,
                    //             type: 'mynotif',
                    //             message: `Funds has been flushed out because you have not upgraded yet. Please upgrade ASAP to next subscription package: Supervisor`,
                    //             isRead: false,
                    //             tags: 'package'
                    //         })

                    //         await notif.save()
                    //     }
                    // }

                    // if (usr.class === 'Supervisor') {
                    //     if (parentCount === 1 || parentCount === 2 || parentCount === 3 || parentCount === 4) {
                    //         subscriptionCheck = true
                    //     } else {
                    //         // Add to notifications to upgrade package
                    //         const notif = await Notification({ 
                    //             createdAt: dateTime.DateTime.local().toISO(),
                    //             owner: usr._id,
                    //             type: 'mynotif',
                    //             message: `Funds has been flushed out because you have not upgraded yet. Please upgrade ASAP to next subscription package: Manager`,
                    //             isRead: false,
                    //             tags: 'package'
                    //         })

                    //         await notif.save()
                    //     }
                    // }

                    // if (usr.class === 'Manager') {
                    //     if (parentCount === 1 || parentCount === 2 || parentCount === 3 || parentCount === 4 || parentCount === 5 || parentCount === 6) {
                    //         subscriptionCheck = true
                    //     } else {
                    //         // Add to notifications to upgrade package
                    //         const notif = await Notification({ 
                    //             createdAt: dateTime.DateTime.local().toISO(),
                    //             owner: usr._id,
                    //             type: 'mynotif',
                    //             message: `Funds has been flushed out because you have not upgraded yet. Please upgrade ASAP to next subscription package: CEO`,
                    //             isRead: false,
                    //             tags: 'package'
                    //         })

                    //         await notif.save()
                    //     }
                    // }

                    // if (usr.class === 'CEO') {
                    //     if (parentCount === 1 || parentCount === 2 || parentCount === 3 || parentCount === 4 || parentCount === 5 || parentCount === 6 || parentCount === 7 || parentCount === 8) {
                    //         subscriptionCheck = true
                    //     } else {
                    //         // Add to notifications to upgrade package
                    //         const notif = await Notification({ 
                    //             createdAt: dateTime.DateTime.local().toISO(),
                    //             owner: usr._id,
                    //             type: 'mynotif',
                    //             message: `Funds has been flushed out because you have not upgraded yet. Please upgrade ASAP to next subscription package: Business Empire`,
                    //             isRead: false,
                    //             tags: 'package'
                    //         })

                    //         await notif.save()
                    //     }
                    // }

                    // if (usr.class === 'Business Empire') {
                    //     if (parentCount === 1 || parentCount === 2 || parentCount === 3 || parentCount === 4 || parentCount === 5 || parentCount === 6 || parentCount === 7 || parentCount === 8 || parentCount === 9 || parentCount === 10) {
                    //         subscriptionCheck = true
                    //     } else {
                    //         // Add to notifications to upgrade package
                    //         const notif = await Notification({ 
                    //             createdAt: dateTime.DateTime.local().toISO(),
                    //             owner: usr._id,
                    //             type: 'mynotif',
                    //             message: `Youve'd reached the 10th level. You need to go down to the 11th level to help others. Please create a new account under the 10th level.`,
                    //             isRead: false,
                    //             tags: 'package'
                    //         })

                    //         await notif.save()
                    //     }
                    // }

                    // Each Business Associates under you can earn you a credit of 100 pesos each children
                    if (!usr.isEpaCreditCommission && buy) {
                        console.log('Parent Tree | Credit Commission: ', usr.name)
                        epaCreditCommissionCount ++
                        if (subscriptionCheck) {
                            await User.findByIdAndUpdate(usr._id, {
                                $inc: { 
                                    epacredits: 100,
                                    // epaCreditsMonth: 100, //dont mirror
                                    // epavault: 100,
                                    // totalIncome: 100
                                }
                            })

                            // Add to notifications to upgrade package
                            const notif = await Notification({ 
                                createdAt: dateTime.DateTime.local().toISO(),
                                owner: usr._id,
                                type: 'mynotif',
                                message: `You earned PHP 100 commission for every upgrade of member.`,
                                isRead: false,
                                tags: 'package'
                            })

                            await notif.save()
                        }
                    }
                    // Earns 10 pesos for every new member down depends to your package level
                    if (!usr.isEpaVaultCommission && buy) {
                        console.log('Parent Tree | Vault Commission: ', usr.name)
                        epaVaultCommissionCount ++
                        if (subscriptionCheck) {
                            await User.findByIdAndUpdate(usr._id, {
                                $inc: { 
                                    epacash: 10,
                                    // epavault: 10,
                                    // epacredits: 10, // mirror
                                    // epaCreditsMonth: 10, //dont mirror
                                    totalIncome: 10
                                }
                            })

                            // Add to notifications to upgrade package
                            const notif = await Notification({ 
                                createdAt: dateTime.DateTime.local().toISO(),
                                owner: usr._id,
                                type: 'mynotif',
                                message: `You earned PHP 10 commission for every new member.`,
                                isRead: false,
                                tags: 'package'
                            })

                            await notif.save()
                        }
                    }
                    // Earns 100 pesos for every upgrade of member
                    // if (!usr.isEpaUpgradeCommission) {
                    //     // epaUpgradeCommissionCount ++

                    //     if (!buy) {
                    //         console.log('Parent Tree | Upgrade Commission: ', usr.name)
                    //         epaUpgradeCommissionCount ++
                    //         if (subscriptionCheck) {
                    //             await User.findByIdAndUpdate(usr._id, {
                    //                 $inc: { 
                    //                     epavault: 100,
                    //                     epacredits: 100, // mirror
                    //                     // epaCreditsMonth: 100, //dont mirror
                    //                     totalIncome: 100
                    //                 }
                    //             })
                    //         }
                    //     } else {
                    //         console.log('Parent Tree | Upgrade Commission: ', usr.name)
                    //         epaUpgradeCommissionCount ++
                    //         // await User.findByIdAndUpdate(usr._id, {
                    //         //     $inc: { epatokens: 0.30 * 10 }
                    //         // })
                    //     }
                    // }
                }

                if (buy) {
                    // QUOTA
                    const today = dateTime.DateTime.now().toISO()
                    const date = dateTime.DateTime.fromISO(today)
                    const dayName = date.toLocaleString({ weekday: 'long' })
                    const settings = await Setting.findOne({})

                    if (dayName !== 'Saturday') {
                        console.log('< Add Quota Day >', dayName)

                        const numAssociates = await User.aggregate([
                            { $match: { _id: new ObjectId(usr._id) } },
                            { $graphLookup: {
                                from: 'users',
                                startWith: '$children._id',
                                connectFromField: 'children._id',
                                connectToField: '_id',
                                as: 'allChildren',
                                depthField: 'depth'
                            }},
                            { $addFields: {
                                childrenMember: { $size: { $filter: {
                                    input: '$allChildren',
                                    as: 'child',
                                    cond: { $eq: [ '$$child.class', 'Member' ] }}
                                }},
                            }},
                            { $group: {
                                _id: '$_id',
                                name: { $first: '$name' },
                                childrenCount: { $sum: { $size: '$allChildren' } },
                                childrenMember: { $first: '$childrenMember' }
                            }}
                        ])

                        if (numAssociates.length) {
                            const validChildrenCount = numAssociates[0].childrenCount - numAssociates[0].childrenMember
                            const quotaBase = settings.base * validChildrenCount
                            const quotaFormula = (( quotaBase * validChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10
            
                            await User.findByIdAndUpdate(usr._id, {
                                quota: quotaFormula.toFixed(4)
                            })
            
                            console.log('< Add Quota >', usr.name, quotaFormula.toFixed(4))
                        }
                    } else {
                        console.log('< Add Quota Day >', dayName)
        
                        const numAssociates = await User.aggregate([
                            { $match: { _id: new ObjectId(usr._id) } },
                            { $graphLookup: {
                                from: 'users',
                                startWith: '$children._id',
                                connectFromField: 'children._id',
                                connectToField: '_id',
                                as: 'allChildren',
                                depthField: 'depth'
                            }},
                            { $addFields: {
                                childrenMember: { $size: { $filter: {
                                    input: '$allChildren',
                                    as: 'child',
                                    cond: { $eq: [ '$$child.class', 'Member' ] }}
                                }},
                            }},
                            { $group: {
                                _id: '$_id',
                                name: { $first: '$name' },
                                childrenCount: { $sum: { $size: '$allChildren' } },
                                childrenMember: { $first: '$childrenMember' }
                            }}
                        ])
        
                        if (numAssociates.length) {
                            const validChildrenCount = numAssociates[0].childrenCount - numAssociates[0].childrenMember
                            const quotaBase = settings.base * validChildrenCount
                            const quotaFormula = (( quotaBase * validChildrenCount * settings.lvlBonus ) * settings.passive ) * 6 * 10
            
                            await User.findByIdAndUpdate(usr._id, {
                                quotaSubWeek: quotaFormula.toFixed(4)
                            })
            
                            console.log('< Add Quota >', usr.name, quotaFormula.toFixed(4))
                        }
                    }
                }
            }
        })

        // Give EPA Account extra bonuses
        if (buy && epaCreditCommissionCount > 0) {
            await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
                $inc: { 
                    epacredits: 100 * (10 - epaCreditCommissionCount),
                    // totalIncome: 100 * (10 - epaCreditCommissionCount)
                }
            })

            console.log('EPA Credit Commission Count: ', epaCreditCommissionCount)
            console.log('Give EPA Account Credit Extra: ', 10 - epaCreditCommissionCount)
        }

        if (buy && epaVaultCommissionCount > 0) {
            await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
                $inc: { 
                    epacash: 10 * (10 - epaVaultCommissionCount),
                    // epavault: 10 * (10 - epaVaultCommissionCount),
                    // epacredits: 10 * (10 - epaVaultCommissionCount), // mirror
                    // epaCreditsMonth: 10 * (10 - epaVaultCommissionCount), //dont mirror
                    totalIncome: 10 * (10 - epaVaultCommissionCount)
                }
            })

            console.log('EPA Vault Commission Count: ', epaVaultCommissionCount)
            console.log('Give EPA Account Vault Extra: ', 10 - epaVaultCommissionCount)
        }

        // if (!buy && epaUpgradeCommissionCount > 0) {
        //     await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
        //         $inc: { 
        //             epavault: 100 * (10 - epaUpgradeCommissionCount),
        //             epacredits: 100 * (10 - epaUpgradeCommissionCount), // mirro
        //             // epaCreditsMonth: 100 * (10 - epaUpgradeCommissionCount), //dont mirror
        //             totalIncome: 100 * (10 - epaUpgradeCommissionCount)
        //         }
        //     })

        //     console.log('EPA Upgrade Commission Count: ', epaUpgradeCommissionCount)
        //     console.log('Give EPA Account Upgrade Extra: ', 10 - epaUpgradeCommissionCount)
        // }

        let parentTree2 = []

        while (parentUser) {
            parentTree2.push(parentUser)

            if (!parentUser.parent)
                break

            parentUser = await User.findOne({ _id: parentUser.parent })
        }

        // console.log('Parent Tree 2: ', parentTree2)

        // Not 10 Levels
        parentTree2.forEach(async usr => {
            if (usr.class !== 'Member' && String(usr._id) !== id && String(usr._id) !== process.env.EPA_ACCT_ID) {
                console.log('Parent Tree 2 | Update User: ', usr.name)

                // await User.findByIdAndUpdate(usr._id, {
                //     $inc: {
                //         epatokens: 33.33 * 10
                //     }
                // })
            }
        })

        let notif2

        if (!parentUser.isLegsComplete && parentUser.children.length === 3) {
            let childrenTree = []
            let idx = 0
            let childrenUser = await User.findOne({ _id: parentUser.children[idx]._id })

            while (childrenUser) {                
                idx ++
                childrenTree.push(childrenUser)
                
                if (!parentUser.children[idx])
                    break

                childrenUser = await User.findOne({ _id: parentUser.children[idx]._id })
            }

            let childCount = 0
            
            childrenTree.forEach(async child => {
                if (child.class !== 'Member') {
                    console.log('Children Tree | Update User: ', child.name)
                    childCount ++
                    // await User.findByIdAndUpdate(child._id, {
                    //     $inc: {
                    //         epacredits: 10,
                    //         epavault: 10,
                    //         epatokens: 33.33 * 10
                    //     }
                    // })
                }
            })

            // Earn 100 pesos for every completed team of 3 Business Associates
            if (childCount === 3) {
                console.log('Legs Completed User: ', parentUser.name)
                await User.findByIdAndUpdate(parentUser._id, {
                    isLegsComplete: true, // update legs
                    $inc: { 
                        epacash: 100,
                        // epavault: 100,
                        // epacredits: 100, // mirror
                        // epaCreditsMonth: 100, //dont mirror
                        totalIncome: 100
                    }
                })
                // Add to notifications
                notif2 = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: parentUser._id,
                    type: 'mynotif',
                    message: `You earned P100 EPA Credits for completing team of 3 Business Associates`,
                    isRead: false,
                    tags: 'package'
                })
            }
        }

        // Add to notifications
        const notif3 = await Notification({ 
            createdAt: dateTime.DateTime.local().toISO(),
            owner: id,
            type: 'mynotif',
            message: `Subscription package upgraded to ${ newPkg }`,
            isRead: false,
            tags: 'package'
        })
 
        const load = await Load({ 
            createdAt: dateTime.DateTime.local().toISO(),
            type: `Subscription package upgraded to ${ newPkg }`,
            owner: user._id,
            sender: user.name,
            recipient: user.name,
            email: user.email,
            mobilenum: user.mobilenum,
            eWalletnum: user.eWalletnum,
            amount: parseFloat(price).toFixed(2),
            refnum: gpc(12)
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        if (notif) await notif.save()
        if (notif2) await notif2.save()
        await notif3.save()
        // if (notif4) await notif4.save()
        await load.save()
        return res.status(201).json({ message: `Purchase Success: ${ newPkg }`, user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

// exports.convertEpaCash = async (req, res) => {
//     console.log("<<< API PUT CONVERT TO EPA CASH >>>")

//     try {
//         const { id } = req.params
//         const { amount } = req.body

//         const user = await User.findOne({ _id: id })

//         if (user.class === 'Member')
//             return res.status(422).json({ error: 'Purchase subscription package first to send EPA Cash.' })
        
//         if (!amount)
//             return res.status(422).json({ error: 'Amount is required!' })

//         if (parseFloat(user.epacredits) < parseFloat(amount))
//             return res.status(422).json({ error: 'Not enough balance.' })

//         await User.findByIdAndUpdate(id, {
//             updatedAt: dateTime.DateTime.local().toISO(),
//             $inc: {
//                 epacredits: -parseFloat(amount).toFixed(2),
//                 epaCreditsMonth: parseFloat(amount).toFixed(2), // mirror
//                 epacash: parseFloat(amount).toFixed(2)
//             }
//         })

//         const load = await Load({ 
//             createdAt: dateTime.DateTime.local().toISO(),
//             type: 'Send EPA Cash',
//             owner: user._id,
//             sender: user.name,
//             recipient: user.name,
//             email: user.email,
//             mobilenum: user.mobilenum,
//             eWalletnum: user.eWalletnum,
//             amount: parseFloat(amount).toFixed(2),
//             refnum: gpc(12)
//         })

//         // add to notifications
//         const notif = await Notification({ 
//             createdAt: dateTime.DateTime.local().toISO(),
//             owner: id,
//             type: 'mynotif',
//             message: `Transferred ${ parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } to EPA Cash`,
//             isRead: false,
//             tags: 'epacash'
//         })

//         // Protect API for Internal Use Only
//         if (req.header('X-Api-Key') !== process.env.API_KEY)
//             return res.status(403).json({ error: 'Forbidden' })
//         await load.save()
//         await notif.save()
//         return res.status(201).json({ message: 'Converted to EPA Cash.', user })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

exports.collectIOU = async (req, res) => {
    console.log("<<< API PUT COLLECT IOU >>>")

    try {
        const { id } = req.params

        const user = await User.findOne({ _id: id })

        if (!user.iou.length)
            return res.status(422).json({ error: 'No Existing IOU: ' })

        const today = dateTime.DateTime.now().toObject().day

        for (idx in user.iou) {
            let duration = user.iou[idx].duration === 'week' ? 7 : user.iou[idx].duration === 'month' ? 30 : 365
            let terms = user.iou[idx].terms
            let dueDate = new Date(user.iou[idx].createdAt).getDate() + duration * terms
            let payables = ( parseFloat(user.iou[idx].amount).toFixed(2) * user.iou[idx].interest ) + parseFloat(user.iou[idx].amount).toFixed(2)
            // let collectedAmount = user.iou[idx].collectedAmount
            // let balance = payables - collectedAmount
            let youOweMe = await User.findOne({ eWalletnum: user.iou[idx].eWalletNum })

            // auto debit
            if (today >= dueDate) {                

                // if creditor not enough epa cash reverse to avoid negative amount
                if (parseFloat(youOweMe.epacash) < parseFloat(payables)) {
                    console.log('Collect Remaining Balance: ',`Creditor: ${ youOweMe.name }-${ parseFloat(youOweMe.epacash).toFixed(2) } | Payables: ${ parseFloat(payables).toFixed(2) }`)
                    let balance = parseFloat(payables).toFixed(2) - parseFloat(youOweMe.epacash).toFixed(2)
                    console.log('balance >> ', parseFloat(balance).toFixed(2))

                    if (parseFloat(youOweMe.epacash) > 0) {
                        // you owe me
                        await User.findByIdAndUpdate(youOweMe._id, {
                            $inc: {
                                epacash: -parseFloat(youOweMe.epacash).toFixed(2),
                            }
                        })
                        // i owe you
                        await User.findByIdAndUpdate(id, {
                            $inc: {
                                epacash: parseFloat(youOweMe.epacash).toFixed(2)
                            }
                        })

                        let currentDate = new Date(new Date().setDate(new Date(user.iou[idx].createdAt).getDate() + 1)).toISOString()
                        user.iou[idx].amount -= parseFloat(youOweMe.epacash).toFixed(2)
                        user.iou[idx].createdAt = currentDate

                        const loans = user.iou

                        loans.forEach(async item => {
                            if (item.eWalletNum === youOweMe.eWalletnum) {
                                // item.push({ isFullPaid: false })
                                await User.findByIdAndUpdate(youOweMe._id, {
                                    loanamount: user.loanamount
                                })
                            }
                        })
                    }
                } else {
                    console.log('Full Payment: ', youOweMe.name, parseFloat(payables).toFixed(2))
                    // you owe me
                    await User.findByIdAndUpdate(youOweMe._id, {
                        $inc: {
                            epacash: -parseFloat(youOweMe.epacash).toFixed(2)
                        }
                    })
                    // i owe you
                    await User.findByIdAndUpdate(id, {
                        $inc: {
                            epacash: parseFloat(youOweMe.epacash).toFixed(2)
                        }
                    })

                    
                    // remove creditor from list if fully paid
                    // const userIOU = []
                    // let userIOU = (user.iou.find(item => String(item.eWalletNum) === String(user.iou[idx].eWalletNum, console.log('item.eWalletNum | user.iou[idx].eWalletNum >>> ', item.eWalletNum, user.iou[idx].eWalletNum))))
                    // console.log('userIOU >> ', userIOU)
                    user.iou.splice(youOweMe.eWalletnum, 1)
                        // userIOU.push(uid)
                    
                    // const filterIOU = user.io.ufind(usr => usr.eWalletnum.includes(user.iou[idx].eWalletNum))
        
                    // if (filterIOU)
                    //     user.io.splice(user.io.indexOf(filterIOU, 1))
            
                    // filterIOU.push({
                    //     eWalletNum: user.iou[idx].eWalletNum,
                    //     amount: user.iou[idx].amount,

                    // })
            
                    await User.findByIdAndUpdate(id, {
                        iou: user.iou
                    })
                    // await User.findByIdAndUpdate(user._id, { iou: userIOU })
                }
            }
        }

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: ' Forbidden' })
        return res.status(201).json({ message: 'Collect User IOU Success!', iou })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.collectLoan = async (req, res) => {
    console.log("<<< API PUT COLLECT LOAN >>>")

    try {
        const { id } = req.params

        const user = await User.findOne({ _id: id })

        if (!user.loanamount.length)
            return res.status(422).json({ error: 'No Existing Loan: ' })

        const today = dateTime.DateTime.now().toObject().day

        for (idx in user.loanamount) {
            let duration = 30
            let terms = 1
            let dueDate = new Date(user.loanamount[idx].createdAt).getDate() + duration * terms
            let payables = ( parseFloat(user.loanamount[idx].amount).toFixed(2) * user.loanamount[idx].interest ) + parseFloat(user.loanamount[idx].amount).toFixed(2)
            // let collectedAmount = user.iou[idx].collectedAmount
            // let balance = payables - collectedAmount
            let youOweMe = await User.findOne({ eWalletnum: user.loanamount[idx].eWalletNum })

            // auto debit
            if (today >= dueDate) {       
                // if creditor not enough epa cash reverse to avoid negative amount
                if (parseFloat(youOweMe.epacredits) < parseFloat(payables)) {
                    console.log('Collect Remaining Balance: ',`Creditor: ${ youOweMe.name }-${ parseFloat(youOweMe.epacredits).toFixed(2) } | Payables: ${ payables }`)
                    // return res.status(422).json({ error: 'Insufficient Balance.' }) // temporary
                    let balance = parseFloat(payables).toFixed(2) - parseFloat(youOweMe.epacredits).toFixed(2)
                    console.log('balance >> ', parseFloat(balance).toFixed(2))
                    
                    if (parseFloat(youOweMe.epacredits) > 0) {
                        // you owe me
                        await User.findByIdAndUpdate(youOweMe._id, {
                            $inc: {
                                epacredits: -parseFloat(youOweMe.epacredits).toFixed(2),
                                epaCreditsMonth: parseFloat(youOweMe.epacredits).toFixed(2) //dont mirror
                            }
                        })
                        // i owe you
                        await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
                            $inc: {
                                epacredits: parseFloat(youOweMe.epacredits).toFixed(2),
                                // epaCreditsMonth: parseFloat(youOweMe.epacredits).toFixed(2) //dont mirror
                            }
                        })

                        let currentDate = new Date(new Date().setDate(new Date(user.loanamount[idx].createdAt).getDate() + 1)).toISOString()
                        user.loanamount[idx].amount -= parseFloat(youOweMe.epacredits).toFixed(2)
                        user.loanamount[idx].createdAt = currentDate

                        const loans = user.loanamount

                        loans.forEach(async item => {
                            if (item.eWalletNum === youOweMe.eWalletnum) {
                                // item.push({ isFullPaid: false })
                                await User.findByIdAndUpdate(youOweMe._id, {
                                    loanamount: user.loanamount
                                })
                            }
                        })
                    }
                } else {
                    console.log('Full Payment: ', youOweMe.name, parseFloat(payables).toFixed(2))
                    // you owe me
                    await User.findByIdAndUpdate(youOweMe._id, {
                        $inc: {
                            // epacredits: -parseFloat(youOweMe.epacredits).toFixed(2),
                            // epaCreditsMonth: -parseFloat(youOweMe.epacredits).toFixed(2) //mirror
                            epacredits: -parseFloat(payables).toFixed(2),
                            epaCreditsMonth: parseFloat(payables).toFixed(2) //mirror
                        }
                    })
                    // i owe you
                    await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
                        $inc: {
                            // epacredits: parseFloat(youOweMe.epacredits).toFixed(2),
                            // epaCreditsMonth: parseFloat(youOweMe.epacredits).toFixed(2) //mirror
                            epacredits: parseFloat(payables).toFixed(2),
                            // epaCreditsMonth: parseFloat(payables).toFixed(2) //dont mirror
                        }
                    })
                    
                    // remove creditor from list if fully paid
                    // const userIOU = []
                    // let userIOU = (user.iou.find(item => String(item.eWalletNum) === String(user.iou[idx].eWalletNum, console.log('item.eWalletNum | user.iou[idx].eWalletNum >>> ', item.eWalletNum, user.iou[idx].eWalletNum))))
                    // console.log('userIOU >> ', userIOU)
                    user.loanamount.splice(youOweMe.eWalletnum, 1)
                        // userIOU.push(uid)
                    
                    // const filterIOU = user.io.ufind(usr => usr.eWalletnum.includes(user.iou[idx].eWalletNum))
        
                    // if (filterIOU)
                    //     user.io.splice(user.io.indexOf(filterIOU, 1))
            
                    // filterIOU.push({
                    //     eWalletNum: user.iou[idx].eWalletNum,
                    //     amount: user.iou[idx].amount,

                    // })
            
                    await User.findByIdAndUpdate(id, {
                        loanamount: user.loanamount
                    })
                    // await User.findByIdAndUpdate(user._id, { iou: userIOU })
                }
            }
        }

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: ' Forbidden' })
        return res.status(201).json({ message: 'Loan Payment Success!', loan })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.donationUhw = async (req, res) => {
    console.log("<<< API PUT DONATE UHW >>>")

    try {
        const { id } = req.params
        const { isChecked } = req.body

        const user = await User.findOne({ _id: id })

        await User.findByIdAndUpdate(id, {  
            isAutoDonateUhw: isChecked
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: ' Forbidden' })
        return res.status(201).json({ message: 'Set Donate to UHW Auto Success!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.pkgStatus = async (req, res) => {
    console.log("<<< API PUT PACKAGE STATUS >>>")

    try {
        const { id } = req.params
        const { pkgStatus, userClass } = req.body
        
        const user = await User.findOne({ _id: id })

        if (userClass === 'entrepreneur') {
            await User.findByIdAndUpdate(id, {  
                entrepreneur: pkgStatus
            })
        }

        if (userClass === 'supervisor') {
            await User.findByIdAndUpdate(id, {  
                supervisor: pkgStatus
            })
        }

        if (userClass === 'manager') {
            await User.findByIdAndUpdate(id, {  
                manager: pkgStatus
            })
        }

        if (userClass === 'ceo') {
            await User.findByIdAndUpdate(id, {  
                ceo: pkgStatus
            })
        }

        if (userClass === 'businessempire') {
            await User.findByIdAndUpdate(id, {  
                businessempire: pkgStatus
            })
        }

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: ' Forbidden' })
        return res.status(201).json({ message: 'Set Package Status Success!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setDelegatePin = async (req, res) => {
    console.log("<<< API PUT DELEGATE PIN >>>")

    try {
        const { id } = req.params
        const { otp } = req.body

        const user = await User.findOne({ _id: id })

        await User.findByIdAndUpdate(id, {  
            delegatePin: otp
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: ' Forbidden' })
        return res.status(201).json({ message: 'Set Delegate Pin Success!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.unDelegatePin = async (req, res) => {
    console.log("<<< API PUT UNDELEGATE PIN >>>")

    try {
        const { id } = req.params
        const { unOtp } = req.body

        const user = await User.findOne({ _id: id })

        if (unOtp !== user.delegatePin)
            return res.status(422).json({ error: 'PIN not matched!' })

        await User.findByIdAndUpdate(id, {  
            delegatePin: ''
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: ' Forbidden' })
        return res.status(201).json({ message: 'Undelegate Pin Success!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

// exports.giveAllowance = async (req, res) => {
//     console.log("<<< API PUT GIVE ALLOWANCE >>>")

//     try {
//         const { id } = req.params

//         const user = await User.findOne({ _id: id })

//         // const today = dateTime.DateTime.now()
//         // // const today = dateTime.DateTime.now().plus({ days: 30 }) /* Test Next Month */
//         // const date = dateTime.DateTime.fromISO(today.toISO())
//         // const dayName = date.toLocaleString({ weekday: 'long' })

//         // console.log('Date Today:', today)
//         // console.log('Leap Year:', today.isInLeapYear)
//         // console.log('Month:', today.toObject().month)
//         // console.log('Day:', today.toObject().day)
//         // console.log('Day Name:', dayName)
        
//         // const thirtyOneDays = [ 1, 3, 5, 7, 8, 10, 12 ]
//         // const thirtyDays = [ 4, 6, 9, 11 ]
//         // let thirty = false, thirtyOne = false, february = false

//         // if (thirtyOneDays.includes(today.toObject().month)) {
//         //     thirtyOne = true
//         // }
//         // else if (thirtyDays.includes(today.toObject().month)) {
//         //     thirty = true
//         // }
//         // else {
//         //     february = true
//         // }

//         // let lastWeekDay = today.set({ month: today.toObject().month }).endOf('month').startOf('week').toObject().day

//         // console.log('Last Week Day (Monday):', lastWeekDay)
//         // console.log('is 31 day month ? :', thirtyOne)
//         // console.log('is 30 day month ? :', thirty)
//         // console.log('is 29 day month ? :', february)

//         // // let firstFriday = lastMonday - 24
//         // let lastWeek

//         // if (thirtyOne) {
//         //     if ((lastWeekDay + 4) >= 31)
//         //         lastWeek = lastWeekDay - 24
//         // } 

//         // if (thirty) {
//         //     if ((lastWeekDay + 4) >= 30)
//         //         lastWeek = lastWeekDay - 24
//         // }

//         // if (february) {
//         //     if ((lastWeekDay + 4) >= today.isInLeapYear ? 29 : 28)
//         //         lastWeek = lastWeekDay - 24
//         // }
            
//         // lastWeek = lastWeekDay
//         // const thirdWeek = lastWeekDay - 3
//         // const secondWeek = thirdWeek - 7
//         // const firstWeek = secondWeek +- 7

//         // console.log('First Week Day: ', firstWeek)
//         // console.log('Second Week Day: ', secondWeek)
//         // console.log('Third Week Day: ', thirdWeek)
//         // console.log('Last Week Day: ', lastWeek)

//         // if (dayName !== 'Friday')
//         //     return res.status(422).json({ error: 'Not Allowance Day: ', dayName })

//         // if (!user.isVerified) 
//         //     return res.status(422).json({ error: 'Please verify your account to receive allowance.' })

//         // if (user.class === 'Member') 
//         //     return res.status(422).json({ error: 'Please purchase subscription package to receive allowance.' })

//         // if (user._id === process.env.EPA_ACCT_ID) 
//         //     return res.status(422).json({ error: 'EPA Account not included in allowance.' })

//         // console.log('Allowance Day !!! Today | First Friday: ', today.toObject().day, firstFriday)

//         // Update User Children First
//         const childrenTree = await User.aggregate([
//             { $project: {
//                 name: '$name',
//                 childrenCount: { $cond: { if: { $isArray: '$children' }, then: { $size: '$children' }, else: 'N/A'} },
//                 children: '$children',
//                 createdAt: '$createdAt'
//             }},
//             { $match: { childrenCount: { $gte: 0 } } },
//             { $unwind: '$children' },
//             { $lookup: {
//                 from: 'users',
//                 localField: 'children._id',
//                 foreignField: '_id',
//                 as: 'childrenDetails'
//             }},
//             { $addFields: { 'children': { 
//                 $mergeObjects: [
//                     '$children', 
//                     { $arrayElemAt: [ '$childrenDetails', 0 ] }
//                 ] 
//             }}},
//             { $project: { 'childrenDetails': 0 } },
//             { $group: {
//                 _id: '$_id',
//                 name: { $first: '$name' },
//                 children: { $push: '$children' },
//                 createdAt: { $first: '$createdAt' }
//             }},
//             { $sort: { createdAt: -1 } }
//         ])

//         if (childrenTree.length) {
//             childrenTree.forEach(async usr => {
//                 console.log('Update User: ', usr.name)

//                 let childrenArray = []
//                 for (idx in usr.children) {                    
//                     childrenArray.push({
//                         '_id': usr.children[idx]._id,
//                         'name': usr.children[idx].name,
//                         'email': usr.children[idx].email,
//                         'avatar': usr.children[idx].avatar,
//                         'class': usr.children[idx].class,
//                         'rank': usr.children[idx].rank,
//                         'children': usr.children[idx].children
//                     })
//                 }

//                 await User.findByIdAndUpdate(usr._id, {
//                     children: childrenArray
//                 })
//             })

//             console.log('Total Users Updated: ', childrenTree.length)
//         } else {
//             console.log('No Users Changed.')
//         }

//         const userTeams = await User.aggregate([
//             { $match: { _id: new ObjectId(user._id) }},
//             { $unwind: '$children' },
//             { $lookup: {
//                 from: 'users',
//                 localField: 'children._id',
//                 foreignField: '_id',
//                 as: 'childrenDetails'
//             }},
//             { $addFields: { 'children': { 
//                 $mergeObjects: [
//                     '$children', 
//                     { $arrayElemAt: [ '$childrenDetails', 0 ] }
//                 ] 
//             }}},
//             { $project: { 'childrenDetails': 0 } },
//             { $group: {
//                 _id: '$_id',
//                 name: { $first: '$name' },
//                 children: { $push: '$children' }
//             }}
//         ])

//         let numAssociates = []

//         if (userTeams.length) {
//             numAssociates = await User.aggregate([
//                 { $match: { _id: new ObjectId(user._id) } },
//                 { $graphLookup: {
//                     from: 'users',
//                     startWith: '$children._id',
//                     connectFromField: 'children._id',
//                     connectToField: '_id',
//                     as: 'allChildren',
//                     depthField: 'depth'
//                     }
//                 },
//                 { $addFields: {
//                     childrenMember: { $size: { $filter: {
//                         input: '$allChildren',
//                         as: 'child',
//                         cond: { $eq: [ '$$child.class', 'Member' ] }}
//                     }},
//                 }},
//                 { $group: {
//                     _id: '$_id',
//                     name: { $first: '$name' },
//                     childrenCount: { $sum: { $size: '$allChildren' } },
//                     childrenMember: { $first: '$childrenMember' }
//                 }}
//             ])
//         }

//         console.log('numAssociates >> ', numAssociates.childrenCount)
//         // if (user.class === 'Member')  // number of associate zero
//         //     return res.status(422).json({ error: 'Please purchase subscription package to receive allowance. ' })

//         // if (teamBuyerCount.length) {
//         //     const validBuyerChildrenCount = teamBuyerCount[0].childrenCount - teamBuyerCount[0].childrenMember
//         //     const quotaBase = settings.base * validBuyerChildrenCount
//         //     recipientQuota = ( quotaBase * validBuyerChildrenCount * settings.lvlBonus ) * settings.passive * 6 * 10

//         //     console.log('Buyer Valid Children Count: ', validBuyerChildrenCount)
//         //     console.log('Quota Added: ', recipientQuota)

//         //     await User.findByIdAndUpdate(recepient._id, {
//         //         $inc: { 
//         //             quota: recipientQuota,
//         //             epavault: recipientQuota / 10,
//         //             epacredits: recipientQuota / 10
//         //         }
//         //     })
//         // }



//         // // Protect API for Internal Use Only
//         if (req.header('X-Api-Key') !== process.env.API_KEY)
//             return res.status(403).json({ message: ' Forbidden' })
//         return res.status(201).json({ message: 'Give Allowance Success!', loan })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

exports.getTeams = async (req, res) => {
    console.log("<<< API GET TEAMS >>>")
    
    try {
        const { id } = req.params

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
                        'email': usr.children[idx].email,
                        'avatar': usr.children[idx].avatar,
                        'class': usr.children[idx].class,
                        'rank': usr.children[idx].rank,
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

        const userTeams = await User.aggregate([
            { $match: { _id: new ObjectId(id) }},
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
                children: { $push: '$children' }
            }}
        ])
          
        if (!userTeams.length) return res.status(422).json({ error: 'No Team Members Yet.' })

        console.log('Org Chart User: ', userTeams[0].name)

        let teamCount = []

        if (userTeams.length) {
            teamCount = await User.aggregate([
                { $match: { _id: new ObjectId(id) } },
                { $graphLookup: {
                    from: 'users',
                    startWith: '$children._id',
                    connectFromField: 'children._id',
                    connectToField: '_id',
                    as: 'allChildren',
                    depthField: 'depth'
                  }
                },
                { $addFields: {
                    childrenMember: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Member' ] }}
                    }},
                    childrenEntrep: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Entrepreneur' ] }}
                    }},
                    childrenSupervisor: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Supervisor' ] }}
                    }},
                    childrenManager: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Manager' ] }}
                    }},
                    childrenCeo: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'CEO' ] }}
                    }},
                    childrenBusiness: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Business Empire' ] }}
                    }},
                    childrenSilver: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Silver' ] }}
                    }},
                    childrenGold: { $size: { $filter: {
                        input: '$allChildren',
                        as: 'child',
                        cond: { $eq: [ '$$child.class', 'Gold' ] }}
                    }}
                }},
                { $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    childrenCount: { $sum: { $size: '$allChildren' } },
                    childrenMember: { $first: '$childrenMember' },
                    childrenEntrep: { $first: '$childrenEntrep' },
                    childrenSupervisor: { $first: '$childrenSupervisor' },
                    childrenManager: { $first: '$childrenManager' },
                    childrenCeo: { $first: '$childrenCeo' },
                    childrenBusiness: { $first: '$childrenBusiness' },
                    childrenSilver: { $first: '$childrenSilver' },
                    childrenGold: { $first: '$childrenGold' }
                }}
            ])
        }

        let childrenCount = 0, childrenMember = 0, childrenEntrep = 0, childrenSupervisor = 0,
            childrenManager = 0, childrenCeo = 0, childrenBusiness = 0, childrenSilver = 0, childrenGold = 0

        if (teamCount.length) {
            childrenCount = teamCount[0].childrenCount
            childrenMember = teamCount[0].childrenMember
            childrenEntrep = teamCount[0].childrenEntrep
            childrenSupervisor = teamCount[0].childrenSupervisor
            childrenManager = teamCount[0].childrenManager
            childrenCeo = teamCount[0].childrenCeo
            childrenBusiness = teamCount[0].childrenBusiness
            childrenSilver = teamCount[0].childrenSilver
            childrenGold = teamCount[0].childrenGold
        }

        console.log('Children Count : ', childrenCount)
        console.log('Children Entrepreneur Count : ', childrenEntrep)
        console.log('Children Supervisor Count : ', childrenSupervisor)
        console.log('Children Manager Count : ', childrenManager)
        console.log('Children CEO Count : ', childrenCeo)
        console.log('Children Business Empire Count : ', childrenBusiness)
        console.log('Children Silver Count : ', childrenSilver)
        console.log('Children Gold Count : ', childrenGold)
        console.log('Valid Children Count : ', childrenCount - childrenMember)

        const teams = userTeams[0].children
        const count = { childrenCount, childrenMember, childrenEntrep, childrenSupervisor, childrenManager, childrenCeo, childrenBusiness, childrenSilver, childrenGold }

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get Teams Success!', teams, count })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getTopJba = async (req, res) => {
    console.log("<<< API GET TOP JBA >>>")
    
    try {
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
                        'email': usr.children[idx].email,
                        'avatar': usr.children[idx].avatar,
                        'class': usr.children[idx].class,
                        'rank': usr.children[idx].rank,
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

        const users = await User.aggregate([
            { $graphLookup: {
                from: 'users',
                startWith: '$children._id',
                connectFromField: 'children._id',
                connectToField: '_id',
                as: 'allChildren',
                depthField: 'depth'
            }},
            { $addFields: {
                childrenEntrep: { $size: { $filter: {
                    input: '$allChildren',
                    as: 'child',
                    cond: { $eq: [ '$$child.class', 'Entrepreneur' ] }}
                }},
                childrenSupervisor: { $size: { $filter: {
                    input: '$allChildren',
                    as: 'child',
                    cond: { $eq: [ '$$child.class', 'Supervisor' ] }}
                }},
                childrenManager: { $size: { $filter: {
                    input: '$allChildren',
                    as: 'child',
                    cond: { $eq: [ '$$child.class', 'Manager' ] }}
                }},
                childrenCeo: { $size: { $filter: {
                    input: '$allChildren',
                    as: 'child',
                    cond: { $eq: [ '$$child.class', 'CEO' ] }}
                }},
                childrenBusiness: { $size: { $filter: {
                    input: '$allChildren',
                    as: 'child',
                    cond: { $eq: [ '$$child.class', 'Business Empire' ] }}
                }},
                childrenSilver: { $size: { $filter: {
                    input: '$allChildren',
                    as: 'child',
                    cond: { $eq: [ '$$child.class', 'Silver' ] }}
                }},
                childrenGold: { $size: { $filter: {
                    input: '$allChildren',
                    as: 'child',
                    cond: { $eq: [ '$$child.class', 'Gold' ] }}
                }}
            }},
            { $group: {
                _id: '$_id',
                name: { $first: '$name' },
                email: { $first: '$email' },
                avatar: { $first: '$avatar' },
                rank: { $first: '$rank' },
                class: { $first: '$class' },
                childrenCount: { $sum: { $size: '$allChildren' } }
            }},
            { $sort: { childrenCount: -1 } },
            { $limit: 10 }
        ])

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get Top JBA Success!', users })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.upgradePkg = async (req, res) => {
    console.log("<<< API PUT UPGRADE PACKAGE >>>")

    try {
        const { id } = req.params
        const { validChildrenCount } = req.body

        const user = await User.findOne({ _id: id })

        if (user.class === 'Member')
            return res.status(422).json({ error: 'No Subscription Package yet.' })

        console.log('Current Class: ', user.class)
        console.log('Current Rank: ', user.rank)

        const settings = await Setting.findOne({})

        if (user.class === 'Entrepreneur') {
            if (validChildrenCount >= settings.entrepSolopreneurJBA && user.rank === '') {
                console.log('Upgrading to: Solopreneur')
                await User.findByIdAndUpdate(id, {
                    rank: 'Solopreneur',
                    // $inc: { 
                    //     epacredits: -settings.entrepSolopreneurFee,
                    //     epaCreditsMonth: settings.entrepSolopreneurFee //dont mirror  
                    // }
                })

                // Add to notifications
                // const notif = await Notification({ 
                //     createdAt: dateTime.DateTime.local().toISO(),
                //     owner: id,
                //     type: 'mynotif',
                //     message: `Congratulations! You are now promoted to Solopreneur`,
                //     isRead: false,
                //     tags: 'package'
                // })
        
                // const load = await Load({ 
                //     createdAt: dateTime.DateTime.local().toISO(),
                //     type: `Subscription package upgraded to Solopreneur`,
                //     owner: user._id,
                //     sender: user.name,
                //     recipient: user.name,
                //     email: user.email,
                //     mobilenum: user.mobilenum,
                //     eWalletnum: user.eWalletnum,
                //     amount: parseFloat(settings.entrepSolopreneurFee).toFixed(2),
                //     refnum: gpc(12)
                // })

                // await notif.save()
                // await load.save()
            }

            if (validChildrenCount >= settings.entrepApprenticeJBA && user.rank === 'Solopreneur') {
                console.log('Upgrading to: Apprentice')
                await User.findByIdAndUpdate(id, {
                    rank: 'Apprentice',
                    $inc: { 
                        epacredits: -settings.entrepApprenticeFee,
                        epaCreditsMonth: settings.entrepApprenticeFee //dont mirror  
                    }
                })

                // Add to notifications
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: id,
                    type: 'mynotif',
                    message: `Congratulations! You are now promoted to Apprentice`,
                    isRead: false,
                    tags: 'package'
                })
        
                const load = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Subscription package upgraded to Apprentice`,
                    owner: user._id,
                    sender: user.name,
                    recipient: user.name,
                    email: user.email,
                    mobilenum: user.mobilenum,
                    eWalletnum: user.eWalletnum,
                    amount: parseFloat(settings.entrepApprenticeFee).toFixed(2),
                    refnum: gpc(12)
                })

                await notif.save()
                await load.save()
            }

            if (validChildrenCount >= settings.entrepTeamLeaderJBA && user.rank === 'Apprentice') {
                console.log('Upgrading to: Team Leader')
                await User.findByIdAndUpdate(id, {
                    rank: 'Team Leader',
                    $inc: { 
                        epacredits: -settings.entrepTeamLeaderFee,
                        epaCreditsMonth: settings.entrepTeamLeaderFee //dont mirror  
                    }
                })

                // Add to notifications
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: id,
                    type: 'mynotif',
                    message: `Congratulations! You are now promoted to Team Leader`,
                    isRead: false,
                    tags: 'package'
                })
        
                const load = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Subscription package upgraded to Team Leader`,
                    owner: user._id,
                    sender: user.name,
                    recipient: user.name,
                    email: user.email,
                    mobilenum: user.mobilenum,
                    eWalletnum: user.eWalletnum,
                    amount: parseFloat(settings.entrepTeamLeaderFee).toFixed(2),
                    refnum: gpc(12)
                })

                await notif.save()
                await load.save()
            }

            if (validChildrenCount >= settings.entrepEntrepJBA && user.rank === 'Team Leader') {
                console.log('Upgrading to: Entrepreneur')
                await User.findByIdAndUpdate(id, {
                    rank: 'Entrepreneur',
                    $inc: { 
                        epacredits: -settings.entrepEntrepFee,
                        epaCreditsMonth: settings.entrepEntrepFee //dont mirror  
                    }
                })

                // Add to notifications
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: id,
                    type: 'mynotif',
                    message: `Congratulations! You are now promoted to Entrepreneur`,
                    isRead: false,
                    tags: 'package'
                })
        
                const load = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Subscription package upgraded to Entrepreneur`,
                    owner: user._id,
                    sender: user.name,
                    recipient: user.name,
                    email: user.email,
                    mobilenum: user.mobilenum,
                    eWalletnum: user.eWalletnum,
                    amount: parseFloat(settings.entrepEntrepFee).toFixed(2),
                    refnum: gpc(12)
                })

                await notif.save()
                await load.save()
            }

            if (validChildrenCount >= settings.supervSupervisorJBA && user.rank === 'Entrepreneur') {
                console.log('Upgrading to: Supervisor')
                await User.findByIdAndUpdate(id, {
                    class: 'Supervisor',
                    rank: '',
                    $inc: { 
                        epacredits: -settings.supervSupervisorFee,
                        epaCreditsMonth: settings.supervSupervisorFee //dont mirror  
                    }
                })

                // Add to notifications
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: id,
                    type: 'mynotif',
                    message: `Congratulations! You are now promoted to Supervisor`,
                    isRead: false,
                    tags: 'package'
                })
        
                const load = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Subscription package upgraded to Supervisor`,
                    owner: user._id,
                    sender: user.name,
                    recipient: user.name,
                    email: user.email,
                    mobilenum: user.mobilenum,
                    eWalletnum: user.eWalletnum,
                    amount: parseFloat(settings.supervSupervisorFee).toFixed(2),
                    refnum: gpc(12)
                })

                await notif.save()
                await load.save()
            }
        }

        if (user.class === 'Supervisor' && validChildrenCount >= settings.managerManagerJBA && user.rank === '') {
            console.log('Upgrading to: Manager')
            await User.findByIdAndUpdate(id, {
                class: 'Manager',
                rank: '',
                $inc: { 
                    epacredits: -settings.managerManagerFee,
                    epaCreditsMonth: settings.managerManagerFee //dont mirror  
                }
            })

            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: id,
                type: 'mynotif',
                message: `Congratulations! You are now promoted to Manager`,
                isRead: false,
                tags: 'package'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Subscription package upgraded to Manager`,
                owner: user._id,
                sender: user.name,
                recipient: user.name,
                email: user.email,
                mobilenum: user.mobilenum,
                eWalletnum: user.eWalletnum,
                amount: parseFloat(settings.managerManagerFee).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        } 

        if (user.class === 'Manager' && validChildrenCount >= settings.ceoApprenticeJBA && user.rank === '') {
            console.log('Upgrading to: CEO')
            await User.findByIdAndUpdate(id, {
                class: 'CEO',
                rank: 'Apprentice CEO',
                $inc: { 
                    epacredits: -settings.ceoApprenticeFee,
                    epaCreditsMonth: settings.ceoApprenticeFee //dont mirror  
                }
            })

            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: id,
                type: 'mynotif',
                message: `Congratulations! You are now promoted to Apprentice CEO`,
                isRead: false,
                tags: 'package'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Subscription package upgraded to Apprentice CEO`,
                owner: user._id,
                sender: user.name,
                recipient: user.name,
                email: user.email,
                mobilenum: user.mobilenum,
                eWalletnum: user.eWalletnum,
                amount: parseFloat(settings.ceoApprenticeFee).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        }

        if (user.class === 'CEO') {
            if (validChildrenCount >= settings.ceoCeoJBA && user.rank === 'Apprentice CEO') {
                console.log('Upgrading to: Apprentice CEO')
                await User.findByIdAndUpdate(id, {
                    rank: 'CEO',
                    $inc: { 
                        epacredits: -settings.ceoCeoFee,
                        epaCreditsMonth: settings.ceoCeoFee //dont mirror  
                    }
                })

                // Add to notifications
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: id,
                    type: 'mynotif',
                    message: `Congratulations! You are now promoted to CEO`,
                    isRead: false,
                    tags: 'package'
                })
        
                const load = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Subscription package upgraded to CEO`,
                    owner: user._id,
                    sender: user.name,
                    recipient: user.name,
                    email: user.email,
                    mobilenum: user.mobilenum,
                    eWalletnum: user.eWalletnum,
                    amount: parseFloat(settings.ceoCeoFee).toFixed(2),
                    refnum: gpc(12)
                })

                await notif.save()
                await load.save()
            }

            if (validChildrenCount >= settings.businessEmpireJBA && user.rank === 'CEO') {
                console.log('Upgrading to: Business Empire')
                await User.findByIdAndUpdate(id, {
                    class: 'Business Empire',
                    rank: '',
                    $inc: { 
                        epacredits: -settings.businessEmpireFee,
                        epaCreditsMonth: settings.businessEmpireFee //dont mirror  
                    }
                })

                // Add to notifications
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: id,
                    type: 'mynotif',
                    message: `Congratulations! You are now promoted to Business Empire`,
                    isRead: false,
                    tags: 'package'
                })
        
                const load = await Load({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    type: `Subscription package upgraded to Business Empire`,
                    owner: user._id,
                    sender: user.name,
                    recipient: user.name,
                    email: user.email,
                    mobilenum: user.mobilenum,
                    eWalletnum: user.eWalletnum,
                    amount: parseFloat(settings.businessEmpireFee).toFixed(2),
                    refnum: gpc(12)
                })

                await notif.save()
                await load.save()
            }
        }

        if (user.class === 'Business Empire' && validChildrenCount >= settings.silverEntrepreneurJBA && user.rank === '') {
            console.log('Upgrading to: Silver Account')
            // Create New Silver Account
            await User.findByIdAndUpdate(id, {
                $inc: { 
                    epacredits: -settings.silverEntrepreneurFee,
                    epaCreditsMonth: settings.silverEntrepreneurFee //dont mirror  
                }
            })

            const newUser = await User({
                createdAt: dateTime.DateTime.local().toISO(),
                updatedAt: dateTime.DateTime.local().toISO(),
                refnum: uuid.generate(),
                owner: String(user._id),
                name: user.name,
                email: '02' + user.email.toLowerCase(),
                areacode: '+63',
                mobilenum: user.mobilenum,
                password: await bcrypt.hash(user.password, 8),
                shippingAddress: user.shippingAddress,
                sponsor: String(user._id),
                children: [],
                parent: '',
                isEpaCreditCommission: false,
                isEpaVaultCommission: false,
                isEpaUpgradeCommission: false,
                isLegsComplete: false,
                teams: [],
                eWalletnum: crypto.randomBytes(10).toString('hex'),
                epacashTotal: 0,
                epacash: 0,
                epatokens: 0,
                epavault: 0,
                epacredits: 0,
                epaCreditsMonth: 0,
                ecomVault: 0,
                totalIncome: 0,
                loanamount: [],
                quota: 0,
                quotaSubWeek: 0,
                isSuspended: false,
                role: user.role,
                class: 'Silver',
                rank: 'Entrepreneur',
                avatar: user.avatar,
                idImage1: user.idImage1,
                idImage2: user.idImage2,
                idImage3: user.idImage3,
                gender: user.gender,
                birthday: user.birthday,
                religion: user.religion,
                isVerified: user.isVerified,
                status: user.status,
                spouse: user.spouse,
                father: user.father,
                mother: user.mother,
                sibling1: user.sibling1,
                sibling2: user.sibling2,
                sibling3: user.sibling3,
                sibling4: user.sibling4,
                sibling5: user.sibling5,
                otherSiblings: user.otherSiblings,
                currentCompany: user.currentCompany,
                currentJob: user.currentJob,
                dreamJob: user.dreamJob,
                salaryEmployed: user.salaryEmployed,
                salarySelfEmployed: user.salarySelfEmployed,
                salaryPension: user.salaryPension,
                dependents: user.dependents,
                isSubAccount: true,
                subAccounts: [],
                iou: [],
                entrepreneur: user.entrepreneur,
                supervisor: user.supervisor,
                manager: user.manager,
                ceo: user.ceo,
                businessempire: user.businessempire,
                delegatePin: ''
            })

            const writeUser = await User.aggregate([
                { $match: { _id: user._id } },
                { $project: {
                    name: '$name',
                    childrenCount: { $cond: { if: { $isArray: '$children' }, then: { $size: '$children' }, else: 'N/A'} },
                    children: '$children'
                }},
                { $match: { childrenCount: { $lt: 3 } } },
                { $sort: { createdAt: 1 } },
                { $limit: 1 },
                { $addFields: {
                    children: { $concatArrays: [ '$children', [ newUser ] ] }
                }}
            ] )
    
            if (!writeUser.length) {
                const teams = await User.aggregate([
                    { $match: { _id: user._id } },
                    { $unwind: '$teams' },
                    { $lookup: {
                        from: 'users',
                        localField: 'teams',
                        foreignField: '_id',
                        as: 'team_users'
                    }},
                    { $unwind: '$team_users' },
                    { $addFields: {
                        childrenSize: { $size: '$team_users.children' }
                    }},
                    { $match: { childrenSize: { $lt: 3 } } },
                    { $project: {
                        user: '$team_users'
                    }}
                ])
                writeUser.push(Object.assign(writeUser, teams[0].user))
            }
    
            const parentUser = await User.findOne({ _id: writeUser[0]._id })
    
            const newChild = {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.avatar,
                class: newUser.class,
                rank: newUser.rank,
                children: newUser.children
            }

            await User.findByIdAndUpdate(parentUser._id, {
                $push: { children: newChild, teams: newUser._id }
            })

            // parent is not the sponsor
            if (String(parentUser._id) !== String(user._id)) {
                // sponsor bonus
                await User.findByIdAndUpdate(user._id, {
                    $push: { teams: newUser._id }
                })
            }

            // save parent to new registered user 
            newUser.parent = parentUser._id

            // add subaccount to main user
            await User.findByIdAndUpdate(user._id, {
                $push: { subAccounts: newUser._id }
            })

            console.log('Parent User >>> ', parentUser.name)
            console.log('New User >>> ', newUser.name)

            await newUser.save()

            // auto create Account for Silver
            await purchasePkgSilver(newUser)
        }

        if (user.class === 'Silver' && validChildrenCount >= settings.silverSupervisorJBA && user.rank === 'Entrepreneur') {
            await User.findByIdAndUpdate(id, {
                rank: 'Supervisor',
                $inc: { 
                    epacredits: -settings.silverSupervisorFee,
                    epaCreditsMonth: settings.silverSupervisorFee //dont mirror  
                }
            })
            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: id,
                type: 'mynotif',
                message: `Congratulations! You are now promoted to Silver Supervisor`,
                isRead: false,
                tags: 'package'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Subscription package upgraded to Silver Supervisor`,
                owner: user._id,
                sender: user.name,
                recipient: user.name,
                email: user.email,
                mobilenum: user.mobilenum,
                eWalletnum: user.eWalletnum,
                amount: parseFloat(settings.silverSupervisorFee).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        }

        if (user.class === 'Silver' && validChildrenCount >= settings.silverManagerJBA && user.rank === 'Supervisor') {
            await User.findByIdAndUpdate(id, {
                rank: 'Manager',
                $inc: { 
                    epacredits: -settings.silverManagerFee,
                    epaCreditsMonth: settings.silverManagerFee //dont mirror  
                }
            })
            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: id,
                type: 'mynotif',
                message: `Congratulations! You are now promoted to Silver Manager`,
                isRead: false,
                tags: 'package'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Subscription package upgraded to Silver Manager`,
                owner: user._id,
                sender: user.name,
                recipient: user.name,
                email: user.email,
                mobilenum: user.mobilenum,
                eWalletnum: user.eWalletnum,
                amount: parseFloat(settings.silverManagerFee).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        }

        if (user.class === 'Silver' && validChildrenCount >= settings.silverCeoJBA && user.rank === 'Manager') {
            await User.findByIdAndUpdate(id, {
                rank: 'CEO',
                $inc: { 
                    epacredits: -settings.silverCeoFee,
                    epaCreditsMonth: settings.silverCeoFee //dont mirror  
                }
            })
            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: id,
                type: 'mynotif',
                message: `Congratulations! You are now promoted to Silver CEO`,
                isRead: false,
                tags: 'package'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Subscription package upgraded to Silver CEO`,
                owner: user._id,
                sender: user.name,
                recipient: user.name,
                email: user.email,
                mobilenum: user.mobilenum,
                eWalletnum: user.eWalletnum,
                amount: parseFloat(settings.silverCeoFee).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        }

        if (user.class === 'Silver' && validChildrenCount >= settings.silverBusinessJBA && user.rank === 'CEO') {
            await User.findByIdAndUpdate(id, {
                rank: 'Business Empire',
                $inc: { 
                    epacredits: -settings.silverBusinessFee,
                    epaCreditsMonth: settings.silverBusinessFee //dont mirror  
                }
            })
            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: id,
                type: 'mynotif',
                message: `Congratulations! You are now promoted to Silver Business Empire`,
                isRead: false,
                tags: 'package'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Subscription package upgraded to Silver Business Empire`,
                owner: user._id,
                sender: user.name,
                recipient: user.name,
                email: user.email,
                mobilenum: user.mobilenum,
                eWalletnum: user.eWalletnum,
                amount: parseFloat(settings.silverBusinessFee).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        }

        if (user.class === 'Silver' && validChildrenCount >= settings.goldEntrepreneurJBA && user.rank === 'Business Empire') {
            // Option to Choose Upgrade or Not
            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: id,
                type: 'mynotif',
                message: `Congratulations! You are capable for promotion to Gold Entrepreneur. Go to Package Subscription to activate Gold Membership.`,
                isRead: false,
                tags: 'package'
            })
            await notif.save()
        }

        if (user.class === 'Gold' && validChildrenCount >= settings.goldSupervisorJBA && user.rank === 'Entrepreneur') {
            await User.findByIdAndUpdate(id, {
                rank: 'Supervisor',
                $inc: { 
                    epacredits: -settings.goldSupervisorFee,
                    epaCreditsMonth: settings.goldSupervisorFee //dont mirror  
                }
            })
            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: id,
                type: 'mynotif',
                message: `Congratulations! You are now promoted to Gold Supervisor`,
                isRead: false,
                tags: 'package'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Subscription package upgraded to Gold Supervisor`,
                owner: user._id,
                sender: user.name,
                recipient: user.name,
                email: user.email,
                mobilenum: user.mobilenum,
                eWalletnum: user.eWalletnum,
                amount: parseFloat(settings.goldSupervisorFee).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        }

        if (user.class === 'Gold' && validChildrenCount >= settings.goldManagerJBA && user.rank === 'Supervisor') {
            await User.findByIdAndUpdate(id, {
                rank: 'Manager',
                $inc: { 
                    epacredits: -settings.goldManagerFee,
                    epaCreditsMonth: settings.goldManagerFee //dont mirror  
                }
            })
            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: id,
                type: 'mynotif',
                message: `Congratulations! You are now promoted to Gold Manager`,
                isRead: false,
                tags: 'package'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Subscription package upgraded to Gold Manager`,
                owner: user._id,
                sender: user.name,
                recipient: user.name,
                email: user.email,
                mobilenum: user.mobilenum,
                eWalletnum: user.eWalletnum,
                amount: parseFloat(settings.goldManagerFee).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        }

        if (user.class === 'Gold' && validChildrenCount >= settings.goldCeoJBA && user.rank === 'Manager') {
            await User.findByIdAndUpdate(id, {
                rank: 'CEO',
                $inc: { 
                    epacredits: -settings.goldCeoFee,
                    epaCreditsMonth: settings.goldCeoFee //dont mirror  
                }
            })
            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: id,
                type: 'mynotif',
                message: `Congratulations! You are now promoted to Gold CEO`,
                isRead: false,
                tags: 'package'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Subscription package upgraded to Gold CEO`,
                owner: user._id,
                sender: user.name,
                recipient: user.name,
                email: user.email,
                mobilenum: user.mobilenum,
                eWalletnum: user.eWalletnum,
                amount: parseFloat(settings.goldCeoFee).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        }

        if (user.class === 'Gold' && validChildrenCount >= settings.goldBusinessJBA && user.rank === 'CEO') {
            await User.findByIdAndUpdate(id, {
                rank: 'Business Empire',
                $inc: { 
                    epacredits: -settings.goldBusinessFee,
                    epaCreditsMonth: settings.goldBusinessFee //dont mirror  
                }
            })
            // Add to notifications
            const notif = await Notification({ 
                createdAt: dateTime.DateTime.local().toISO(),
                owner: id,
                type: 'mynotif',
                message: `Congratulations! You are now promoted to Gold Business Empire`,
                isRead: false,
                tags: 'package'
            })
    
            const load = await Load({ 
                createdAt: dateTime.DateTime.local().toISO(),
                type: `Subscription package upgraded to Gold Business Empire`,
                owner: user._id,
                sender: user.name,
                recipient: user.name,
                email: user.email,
                mobilenum: user.mobilenum,
                eWalletnum: user.eWalletnum,
                amount: parseFloat(settings.goldBusinessFee).toFixed(2),
                refnum: gpc(12)
            })

            await notif.save()
            await load.save()
        }

        let parentTree = []
        let parentUser = await User.findOne({ _id: user.parent })
        let levelCount = 0

        while (parentUser) {
            levelCount ++

            parentTree.push(parentUser)

            if (parentUser.class === 'Member') {
                // Add to notifications to upgrade package
                const notif = await Notification({ 
                    createdAt: dateTime.DateTime.local().toISO(),
                    owner: parentUser._id,
                    type: 'mynotif',
                    message: `You need to buy the subscription package: Entrepreneur`,
                    isRead: false,
                    tags: 'package'
                })

                await notif.save()
            }

            if (levelCount >= 10 || !parentUser.parent)
                break

            parentUser = await User.findOne({ _id: parentUser.parent })
        }

        // let epaUpgradeCommissionCount = 0, parentCount = 0
        
        // parentTree.forEach(async usr => {
        //     if (usr.class !== 'Member' && String(usr._id) !== user._id && String(usr._id) !== process.env.EPA_ACCT_ID) {
        //         parentCount ++
        //         // let subscriptionCheck = false

        //         if (parentCount <= 10) {
        //             // Earns 100 pesos for every upgrade of member
        //             console.log('Parent Tree | Upgrade Commission: ', usr.name)
        //             epaUpgradeCommissionCount ++
        //             await User.findByIdAndUpdate(usr._id, {
        //                 $inc: { 
        //                     // epavault: 100,
        //                     epacash: 100, // mirror
        //                     // epaCreditsMonth: 100, //dont mirror
        //                     totalIncome: 100
        //                 }
        //             })
        //             // Add to notifications to upgrade package
        //             const notif = await Notification({ 
        //                 createdAt: dateTime.DateTime.local().toISO(),
        //                 owner: usr._id,
        //                 type: 'mynotif',
        //                 message: `You earned PHP 100 commission for every upgrade of member: ${ usr.name }<Auto-Upgrade>(epacash ni sulod).`,
        //                 isRead: false,
        //                 tags: 'package'
        //             })

        //             await notif.save()
        //         } else {
        //             // Add to notifications to upgrade package
        //             const notif = await Notification({ 
        //                 createdAt: dateTime.DateTime.local().toISO(),
        //                 owner: usr._id,
        //                 type: 'mynotif',
        //                 message: `Funds has been flushed out because you have not upgraded yet. Please upgrade ASAP to next subscription package: Supervisor`,
        //                 isRead: false,
        //                 tags: 'package'
        //             })

        //             await notif.save()
        //         }
        //     }
        // })

        // if (epaUpgradeCommissionCount > 0) {
        //     // Give EPA Account extra bonuses
        //     await User.findByIdAndUpdate(process.env.EPA_ACCT_ID, {
        //         $inc: { 
        //             // epavault: 100 * (10 - epaUpgradeCommissionCount),
        //             epacash: 100 * (10 - epaUpgradeCommissionCount), // mirro
        //             // epaCreditsMonth: 100 * (10 - epaUpgradeCommissionCount), //dont mirror
        //             totalIncome: 100 * (10 - epaUpgradeCommissionCount)
        //         }
        //     })

        //     console.log('EPA Upgrade Commission Count: ', epaUpgradeCommissionCount)
        //     console.log('Give EPA Account Upgrade Extra: ', 10 - epaUpgradeCommissionCount)
        // }

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: ' Forbidden' })
        // if (notif) await notif.save()
        // if (load) await load.save()
        return res.status(200).json({ message: 'Upgrade Package Success!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.activateGold = async (req, res) => {
    console.log("<<< API PUT ACTIVATE GOLD MEMBERSHIP >>>")
    
    try {
        const { id } = req.params
        const user = await User.findOne({ _id: id })
        const settings = await Setting.findOne({})

        if (parseFloat(settings.goldEntrepreneurFee < parseFloat(user.epacredits)))
            return res.status(422).json({ error: 'Not enough EPA Credits.' })

        await User.findByIdAndUpdate(id, {
            $inc: { 
                epacredits: -settings.goldEntrepreneurFee,
                epaCreditsMonth: settings.goldEntrepreneurFee //dont mirror  
            }
        })

        const newUser = await User({
            createdAt: dateTime.DateTime.local().toISO(),
            updatedAt: dateTime.DateTime.local().toISO(),
            refnum: uuid.generate(),
            owner: String(user._id),
            name: user.name,
            email: '02' + user.email.toLowerCase(),
            areacode: '+63',
            mobilenum: user.mobilenum,
            password: await bcrypt.hash(user.password, 8),
            shippingAddress: user.shippingAddress,
            sponsor: String(user._id),
            children: [],
            parent: '',
            isEpaCreditCommission: false,
            isEpaVaultCommission: false,
            isEpaUpgradeCommission: false,
            isLegsComplete: false,
            teams: [],
            eWalletnum: crypto.randomBytes(10).toString('hex'),
            epacashTotal: 0,
            epacash: 0,
            epatokens: 0,
            epavault: 0,
            epacredits: 0,
            epaCreditsMonth: 0,
            ecomVault: 0,
            totalIncome: 0,
            loanamount: [],
            quota: 0,
            quotaSubWeek: 0,
            isSuspended: false,
            role: user.role,
            class: 'Silver',
            rank: 'Entrepreneur',
            avatar: user.avatar,
            idImage1: user.idImage1,
            idImage2: user.idImage2,
            idImage3: user.idImage3,
            gender: user.gender,
            birthday: user.birthday,
            religion: user.religion,
            isVerified: user.isVerified,
            status: user.status,
            spouse: user.spouse,
            father: user.father,
            mother: user.mother,
            sibling1: user.sibling1,
            sibling2: user.sibling2,
            sibling3: user.sibling3,
            sibling4: user.sibling4,
            sibling5: user.sibling5,
            otherSiblings: user.otherSiblings,
            currentCompany: user.currentCompany,
            currentJob: user.currentJob,
            dreamJob: user.dreamJob,
            salaryEmployed: user.salaryEmployed,
            salarySelfEmployed: user.salarySelfEmployed,
            salaryPension: user.salaryPension,
            dependents: user.dependents,
            isSubAccount: true,
            subAccounts: [],
            iou: [],
            entrepreneur: user.entrepreneur,
            supervisor: user.supervisor,
            manager: user.manager,
            ceo: user.ceo,
            businessempire: user.businessempire,
            delegatePin: ''
        })
        
        const writeUser = await User.aggregate([
            { $match: { _id: user._id } },
            { $project: {
                name: '$name',
                childrenCount: { $cond: { if: { $isArray: '$children' }, then: { $size: '$children' }, else: 'N/A'} },
                children: '$children'
            }},
            { $match: { childrenCount: { $lt: 3 } } },
            { $sort: { createdAt: 1 } },
            { $limit: 1 },
            { $addFields: {
                children: { $concatArrays: [ '$children', [ newUser ] ] }
            }}
        ] )

        if (!writeUser.length) {
            const teams = await User.aggregate([
                { $match: { _id: user._id } },
                { $unwind: '$teams' },
                { $lookup: {
                    from: 'users',
                    localField: 'teams',
                    foreignField: '_id',
                    as: 'team_users'
                }},
                { $unwind: '$team_users' },
                { $addFields: {
                    childrenSize: { $size: '$team_users.children' }
                }},
                { $match: { childrenSize: { $lt: 3 } } },
                { $project: {
                    user: '$team_users'
                }}
            ])
            console.log('teams >> ', teams[0])
            writeUser.push(Object.assign(writeUser, teams[0].user))
        }

        const parentUser = await User.findOne({ _id: writeUser[0]._id })

        const newChild = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
            class: newUser.class,
            rank: newUser.rank,
            children: newUser.children
        }

        await User.findByIdAndUpdate(parentUser._id, {
            $push: { children: newChild, teams: newUser._id }
        })

        // parent is not the sponsor
        if (String(parentUser._id) !== String(user._id)) {
            // sponsor bonus
            await User.findByIdAndUpdate(user._id, {
                $push: { teams: newUser._id }
            })
        }

        // save parent to new registered user 
        newUser.parent = parentUser._id

        // add subaccount to main user
        await User.findByIdAndUpdate(user._id, {
            $push: { subAccounts: newUser._id }
        })

        console.log('Parent User >>> ', parentUser.name)
        console.log('New User >>> ', newUser.name)

        await newUser.save()

        // auto create Account for Silver
        await purchasePkgGold(newUser)

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Activate Gold Membership Success!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

// exports.validQuota = async (req, res) => {
//     console.log("<<< API PUT VALID QUOTA >>>")

//     try {
//         const { id, validChildrenCount } = req.params

//         const user = await User.findOne({ _id: id })

//         if (validChildrenCount < 175)
//             return res.status(422).json({ error: 'Valid Children Count not yet reached.' })

//         if (validChildrenCount >= 175 && user.isValidQuota)
//             return res.status(422).json({ error: 'Quota is already valid.' })

//         if (validChildrenCount >= 175 && !user.isValidQuota) {
//             await User.findByIdAndUpdate(id, {
//                 isValidQuota: true,
//                 $inc: {
//                     epatokens: 54424.71,
//                     quota: 54424.71
//                 }
//             })
//         }

//         // Protect API for Internal Use Only
//         if (req.header('X-Api-Key') !== process.env.API_KEY)
//             return res.status(403).json({ message: ' Forbidden' })
//         return res.status(200).json({ message: 'Quota Update Success!', user })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }

exports.getUsers = async (req, res) => {
    console.log("<<< API GET ALL USERS >>>")
    
    try {
        const users = await User.find({}).sort({ createdAt: -1 })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get All Users Success!', users })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getUser = async (req, res) => {
    console.log("<<< API GET USER >>>")

    try {
        const { id } = req.params
        const user = await User.findOne({ _id: id })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: ' Forbidden' })
        return res.status(200).json({ message: 'Get User Success!', user })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}
