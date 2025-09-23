const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')

const { addService,
        editService,
        removeService,
        setRatings,
        setFavorites,
        getServices,
        getService } = require('../controllers/service')

const privatePath = './assets/private/'
const publicPath = './assets/public/'
const privateFields = [ 'null' ]
const publicFields = [ 'services' ]

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

router.post('/addservice/:id', upload.single('services'), addService)
router.put('/editservice/:id', upload.single('services'), editService)
router.delete('/remove-service/:itemId', removeService)
router.put('/setratings/:id', setRatings)
router.put('/setfavorites/:id', setFavorites)

// get all services
router.get('/', getServices)
// get service
router.get('/:id', getService)

module.exports = router
