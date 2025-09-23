const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')

const { addProduct,
        editProduct,
        removeProduct,
        setRatings,
        setFavorites,
        getProducts, 
        getProduct } = require('../controllers/product')

const privatePath = './assets/private/'
const publicPath = './assets/public/'
const privateFields = [ 'null' ]
const publicFields = [ 'products' ]

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

router.post('/addproduct/:id', upload.single('products'), addProduct)
router.put('/editproduct/:id', upload.single('products'), editProduct)
router.delete('/remove-product/:itemId', removeProduct)
router.put('/setratings/:id', setRatings)
router.put('/setfavorites/:id', setFavorites)

// get all products
router.get('/', getProducts)
// get product
router.get('/:id', getProduct)

module.exports = router
