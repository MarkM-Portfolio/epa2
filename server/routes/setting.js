const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')

const { setBanners,
        setShowVoucher,
        setPaymentMode,
        setEpaCreateMode,
        setTokens,
        setQuota,
        setJba,
        setPercentCash,
        setPkgJBA,
        setPkgFee,
        getSettings } = require('../controllers/setting')

const privatePath = './assets/private/'
const publicPath = './assets/public/'
const privateFields = [ 'null' ]
const publicFields = [ 'banners' ]

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (privateFields.includes(file.fieldname))
            cb(null, privatePath + file.fieldname)

        if (publicFields.includes(file.fieldname))
            cb(null, publicPath + file.fieldname)
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname).toLowerCase())
    }
})

const upload = multer({ storage: storage })

// change banners
router.put('/banners/:id', upload.fields([{ name: 'banners' }]), setBanners)
// show voucher
router.put('/showvoucher/:id', setShowVoucher)
// change payment mode
router.put('/paymentmode/:id', setPaymentMode)
// auto create epa accounts
router.put('/createepamode/:id', setEpaCreateMode)
// set token values
router.put('/set-tokens/:id', setTokens)
// set quota variables
router.put('/set-quota/:id', setQuota)
// set jba variables
router.put('/set-jba/:id', setJba)
// set % cash variables
router.put('/set-percentcash/:id', setPercentCash)
// set pkg jba variables
router.put('/set-pkgjba/:id', setPkgJBA)
// set pkg fee variables
router.put('/set-pkgfee/:id', setPkgFee)

// get settings
router.get('/', getSettings)

module.exports = router
