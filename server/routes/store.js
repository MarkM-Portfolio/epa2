const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')

const { buildStore,
        editStore,
        setFavorites,
        getStores, 
        getStore } = require('../controllers/store')

const privatePath = './assets/private/'
const publicPath = './assets/public/'
const privateFields = [ 'null' ]
const publicFields = [ 'stores' ]

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

// stores
router.post('/buildstore/:id', upload.single('stores'), buildStore)
router.put('/editstore/:id', upload.single('stores'), editStore)
router.put('/setfavorites/:id', setFavorites)

// get all stores
router.get('/', getStores)
// get store
router.get('/:id', getStore)

module.exports = router
