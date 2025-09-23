const express = require('express')
const router = express.Router()
// const path = require('path')
// const multer = require('multer')

const { generateEpaCash,
        sendEpaCash,
        sendEpaVault,
        convertEpaVault,
        createIOU,
        confirmIOU,
        // topup,
        // withdraw,
        // updateStatusApprove,
        // updateStatusReject,
        // updateStatusApproveWithdraw,
        // updateStatusRejectWithdraw,
        getIOU,
        getLoad,
        getAllLoads } = require('../controllers/load')

// const privatePath = './assets/private/'
// const publicPath = './assets/public/'
// const privateFields = [ 'loads' ]
// const publicFields = [ 'null' ]

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         if (privateFields.includes(file.fieldname))
//             cb(null, privatePath + file.fieldname)

//         if (publicFields.includes(file.fieldname))
//             cb(null, publicPath + file.fieldname)
//     },
//     filename: (req, file, cb) => {
//         const userId = req.params.id
//         cb(null, file.fieldname + '-' + userId + '_' + Date.now() + path.extname(file.originalname).toLowerCase())
//     }
// })

// const upload = multer({ storage: storage })

router.put('/generate-epacash/:id', generateEpaCash)
router.post('/send-epacash/:id', sendEpaCash)
router.put('/send-epavault/:id', sendEpaVault)
router.put('/convert-epavault/:id', convertEpaVault)
router.post('/create-iou/:id', createIOU)
router.put('/send-iou/:id', confirmIOU)

// router.post('/topup/:id', upload.single('loads'), topup)
// router.post('/withdraw/:id', withdraw)

// router.put('/approve/:id', updateStatusApprove)
// router.put('/reject/:id', updateStatusReject)
// router.put('/approve-withdraw/:id', updateStatusApproveWithdraw)
// router.put('/reject-withdraw/:id', updateStatusRejectWithdraw)

// get iou load
router.get('/iou/:email', getIOU)

// get user load
router.get('/:id', getLoad)

// get all loads
router.get('/', getAllLoads)

module.exports = router
