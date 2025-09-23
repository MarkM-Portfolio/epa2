const { Setting, User } = require('../models/model')
const dateTime = require('luxon')

exports.setBanners = async (req, res) => {
    console.log("<<< API PUT SET BANNERS >>>")

    try {        
        const { id } = req.params

        const user = await User.findOne({ _id: id })
        const settings = await Setting.findOne({})

        const banners = []

        if (req.files.banners) {
            if (req.files.banners.length) {
                req.files.banners.forEach(item => {
                    banners.push(item.filename)
                })
            } else {
                banners.push(req.files.banners.filename)
            }
        }

        if (req.body.banners) {
            if (req.body.banners instanceof Object) {
                req.body.banners.forEach(item => {
                    banners.push(item)
                })
            } else {
                banners.push(req.body.banners)
            }
        }

        await Setting.findOneAndUpdate({ _id: settings._id }, {
            updatedBy: user.name,
            updatedAt: dateTime.DateTime.local().toISO(),
            banners: banners
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Banners Changed', settings })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setShowVoucher = async (req, res) => {
    console.log("<<< API PUT SET SHOW VOUCHER >>>")

    try {
        const { id } = req.params
        const { mode } = req.body
        
        const settings = await Setting.findOne({})
        const user = await User.findOne({ _id: id })

        await Setting.findOneAndUpdate({ _id: settings._id }, {
            updatedBy: user.name,
            updatedAt: dateTime.DateTime.local().toISO(),
            showVoucher: mode
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Voucher Display Changed.', settings })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setPaymentMode = async (req, res) => {
    console.log("<<< API PUT SET PAYMENT MODE >>>")

    try {
        const { id } = req.params
        const { mode } = req.body
        
        const settings = await Setting.findOne({})
        const user = await User.findOne({ _id: id })

        await Setting.findOneAndUpdate({ _id: settings._id }, {
            updatedBy: user.name,
            updatedAt: dateTime.DateTime.local().toISO(),
            isAutoPay: mode
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Payment Mode Changed', settings })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setEpaCreateMode = async (req, res) => {
    console.log("<<< API PUT SET EPA CREATE MODE >>>")

    try {
        const { id } = req.params
        const { mode } = req.body
        
        const settings = await Setting.findOne({})
        const user = await User.findOne({ _id: id })

        await Setting.findOneAndUpdate({ _id: settings._id }, {
            updatedBy: user.name,
            updatedAt: dateTime.DateTime.local().toISO(),
            isAutoCreateEpa: mode
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Payment Mode Changed', settings })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setTokens = async (req, res) => {
    console.log("<<< API PUT SET TOKENS >>>")

    try {
        const { id } = req.params
        const { lowToken, highToken } = req.body
        
        const settings = await Setting.findOne({})
        const user = await User.findOne({ _id: id })

        await Setting.findOneAndUpdate({ _id: settings._id }, {
            updatedBy: user.name,
            updatedAt: dateTime.DateTime.local().toISO(),
            highToken: highToken / 100,
            lowToken: lowToken / 100
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Token Set Value Changed', settings })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setQuota = async (req, res) => {
    console.log("<<< API PUT SET QUOTA >>>")

    try {
        const { id } = req.params
        const { base, lvlBonus, passive } = req.body
        
        const settings = await Setting.findOne({})
        const user = await User.findOne({ _id: id })

        await Setting.findOneAndUpdate({ _id: settings._id }, {
            updatedBy: user.name,
            updatedAt: dateTime.DateTime.local().toISO(),
            base: base,
            lvlBonus: lvlBonus,
            passive: passive
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Quota Set Value Changed', settings })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setJba = async (req, res) => {
    console.log("<<< API PUT SET JBA >>>")

    try {
        const { id } = req.params
        const { rewardsJBA, allowanceJBA, employedJBA, maxEmployedJBA, selfEmployedJBA, maxSelfEmployedJBA, pensionJBA, maxPensionJBA, dependentsJBA } = req.body
        
        const settings = await Setting.findOne({})
        const user = await User.findOne({ _id: id })

        await Setting.findOneAndUpdate({ _id: settings._id }, {
            updatedBy: user.name,
            updatedAt: dateTime.DateTime.local().toISO(),
            rewardsJBA: rewardsJBA,
            allowanceJBA: allowanceJBA,
            employedJBA: employedJBA,
            maxEmployedJBA: maxEmployedJBA,
            selfEmployedJBA: selfEmployedJBA,
            maxSelfEmployedJBA: maxSelfEmployedJBA,
            pensionJBA: pensionJBA,
            maxPensionJBA: maxPensionJBA,
            dependentsJBA: dependentsJBA
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Token Set Value Changed', settings })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setPercentCash = async (req, res) => {
    console.log("<<< API PUT SET PERCENT CASH >>>")

    try {
        const { id } = req.params
        const { entrepPercentCash, supervPercentCash, managerPercentCash, ceoPercentCash, businessPercentCash, silverPercentCash, goldPercentCash } = req.body
        
        const settings = await Setting.findOne({})
        const user = await User.findOne({ _id: id })

        await Setting.findOneAndUpdate({ _id: settings._id }, {
            updatedBy: user.name,
            updatedAt: dateTime.DateTime.local().toISO(),
            entrepPercentCash: entrepPercentCash / 100,
            supervPercentCash: supervPercentCash / 100,
            managerPercentCash: managerPercentCash / 100,
            ceoPercentCash: ceoPercentCash / 100,
            businessPercentCash: businessPercentCash / 100,
            silverPercentCash: silverPercentCash / 100,
            goldPercentCash: goldPercentCash / 100
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Percent Cash Set Value Changed', settings })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setPkgJBA = async (req, res) => {
    console.log("<<< API PUT SET PACKAGE JBA >>>")

    try {
        const { id } = req.params
        const { entrepSolopreneurJBA,
            entrepApprenticeJBA,
            entrepTeamLeaderJBA,
            entrepEntrepJBA,
            supervSupervisorJBA,
            managerManagerJBA,
            ceoApprenticeJBA,
            ceoCeoJBA,
            businessEmpireJBA,
            silverEntrepreneurJBA,
            silverSupervisorJBA,
            silverManagerJBA,
            silverCeoJBA,
            silverBusinessJBA,
            goldEntrepreneurJBA,
            goldSupervisorJBA,
            goldManagerJBA,
            goldCeoJBA,
            goldBusinessJBA } = req.body
        
        const settings = await Setting.findOne({})
        const user = await User.findOne({ _id: id })

        await Setting.findOneAndUpdate({ _id: settings._id }, {
            updatedBy: user.name,
            updatedAt: dateTime.DateTime.local().toISO(),
            entrepSolopreneurJBA: entrepSolopreneurJBA,
            entrepApprenticeJBA: entrepApprenticeJBA,
            entrepTeamLeaderJBA: entrepTeamLeaderJBA,
            entrepEntrepJBA: entrepEntrepJBA,
            supervSupervisorJBA: supervSupervisorJBA,
            managerManagerJBA: managerManagerJBA,
            ceoApprenticeJBA: ceoApprenticeJBA,
            ceoCeoJBA: ceoCeoJBA,
            businessEmpireJBA: businessEmpireJBA,
            silverEntrepreneurJBA: silverEntrepreneurJBA,
            silverSupervisorJBA: silverSupervisorJBA,
            silverManagerJBA: silverManagerJBA,
            silverCeoJBA: silverCeoJBA,
            silverBusinessJBA: silverBusinessJBA,
            goldEntrepreneurJBA: goldEntrepreneurJBA,
            goldSupervisorJBA: goldSupervisorJBA,
            goldManagerJBA: goldManagerJBA,
            goldCeoJBA: goldCeoJBA,
            goldBusinessJBA: goldBusinessJBA
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Package JBA Set Value Changed', settings })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.setPkgFee = async (req, res) => {
    console.log("<<< API PUT SET PACKAGE FEE >>>")

    try {
        const { id } = req.params
        const { entrepSolopreneurFee,
            entrepApprenticeFee,
            entrepTeamLeaderFee,
            entrepEntrepFee,
            supervSupervisorFee,
            managerManagerFee,
            ceoApprenticeFee,
            ceoCeoFee,
            businessEmpireFee,
            silverEntrepreneurFee,
            silverSupervisorFee,
            silverManagerFee,
            silverCeoFee,
            silverBusinessFee,
            goldEntrepreneurFee,
            goldSupervisorFee,
            goldManagerFee,
            goldCeoFee,
            goldBusinessFee } = req.body
        
        const settings = await Setting.findOne({})
        const user = await User.findOne({ _id: id })

        await Setting.findOneAndUpdate({ _id: settings._id }, {
            updatedBy: user.name,
            updatedAt: dateTime.DateTime.local().toISO(),
            entrepSolopreneurFee: entrepSolopreneurFee,
            entrepApprenticeFee: entrepApprenticeFee,
            entrepTeamLeaderFee: entrepTeamLeaderFee,
            entrepEntrepFee: entrepEntrepFee,
            supervSupervisorFee: supervSupervisorFee,
            managerManagerFee: managerManagerFee,
            ceoApprenticeFee: ceoApprenticeFee,
            ceoCeoFee: ceoCeoFee,
            businessEmpireFee: businessEmpireFee,
            silverEntrepreneurFee: silverEntrepreneurFee,
            silverSupervisorFee: silverSupervisorFee,
            silverManagerFee: silverManagerFee,
            silverCeoFee: silverCeoFee,
            silverBusinessFee: silverBusinessFee,
            goldEntrepreneurFee: goldEntrepreneurFee,
            goldSupervisorFee: goldSupervisorFee,
            goldManagerFee: goldManagerFee,
            goldCeoFee: goldCeoFee,
            goldBusinessFee: goldBusinessFee          
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Package Fee Set Value Changed', settings })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getSettings = async (req, res) => {
    console.log("<<< API GET SETTINGS >>>")

    try {
        const settings = await Setting.findOne({})

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: ' Forbidden' })
        return res.status(200).json({ message: 'Get Settings Success!', settings })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}
