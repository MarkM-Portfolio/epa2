const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')

const { setOrder,
        submitOrderReceipt,
        confirmOrder,
        updateOrder,
        cancelOrder,
        confirmReceiveOrder,
        declineReceiveOrder,
        getOrders, 
        getOrder } = require('../controllers/order')

const privatePath = './assets/private/'
const publicPath = './assets/public/'
const privateFields = [ 'order' ]
const publicFields = [ 'null' ]

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (privateFields.includes(file.fieldname))
            cb(null, privatePath + file.fieldname)

        if (publicFields.includes(file.fieldname))
            cb(null, publicPath + file.fieldname)
    },
    filename: (req, file, cb) => {
        const userId = req.params.id

        cb(null, file.fieldname + '-' + userId + '_' + Date.now() + path.extname(file.originalname).toLowerCase())
    }
})

const upload = multer({ storage: storage })


router.post('/setorder/:id', setOrder)

// order receipt
router.put('/submit-orderReceipt/:id', upload.fields([{ name: 'order' }]), submitOrderReceipt)

// update order
router.put('/confirmorder/:id', confirmOrder)
router.put('/updateorder/:id', updateOrder)
router.put('/cancelorder/:id', cancelOrder)
router.put('/receiveorder/:id', confirmReceiveOrder)
router.put('/declineorder/:id', declineReceiveOrder)

// get all orders
router.get('/', getOrders)
// get order
router.get('/:id', getOrder)

module.exports = router
