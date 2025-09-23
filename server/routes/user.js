const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')

const { registerUsers, 
        setReligion,
        createSubAccount,
        createAccount,
        accountTransfer,
        requestPinCode, 
        sentOtpEmail, 
        confirmPinCode, 
        passwordReset, 
        loginUser, 
        /*updateUser,*/ 
        /*updateUserRequest,*/ 
        /*updateRefBonus,*/ 
        /*enrollWithdrawalUser,*/ 
        /*vipBonus,*/ 
        /*updateLoginBonus,*/ 
        /*updateLoginCredit,*/ 
        /*updateLoginClaim,*/ 
        /*uploadScreenShot,*/ 
        /*uploadQR,*/ 
        logoutUser, 
        switchUser,
        /*purchaseYes,*/ 
        editProfile,
        submitVerification,
        userVerify,
        editShipping,
        addToCart,
        removeCart,
        purchasePkg,
        // convertEpaCash,
        collectIOU,
        collectLoan,
        donationUhw,
        pkgStatus,
        setDelegatePin,
        unDelegatePin,
        upgradePkg,
        activateGold,
        // calculateQuota,
        // giveAllowance,
        // validQuota,
        getTeams,
        getTopJba,
        getUsers, 
        getUser } = require('../controllers/user')
        
const { validateRegister, 
        userValidation, 
        validateForgotPassword,
        validateResetPassword, 
        validateLogin, 
        /* validateEditProfile, */
        /* validateWithdrawAccount */ } = require('../middlewares/validation/user')

const { isAuth } = require('../middlewares/auth')

const privatePath = './assets/private/'
const publicPath = './assets/public/'
const privateFields = [ 'avatar', 'verify' ]
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
// const multiUpload = multer({ dest: './assets/private/verify/' })

// users
router.post('/register', validateRegister, userValidation, registerUsers)
router.put('/setreligion/:id', setReligion)
router.post('/createsubaccount/:id', validateRegister, userValidation, createSubAccount)
router.post('/create-account/:id', validateRegister, userValidation, createAccount)
router.put('/account-transfer/:id', accountTransfer)
router.post('/login', validateLogin, userValidation, loginUser)
router.post('/logout', isAuth, logoutUser)
router.post('/switch', switchUser)
router.post('/requestpincode', validateForgotPassword, userValidation, requestPinCode)
router.post('/sendotpemail', sentOtpEmail)
router.get('/confirmpincode/:email', confirmPinCode)
router.put('/resetpassword/:email', validateResetPassword, userValidation, userValidation, passwordReset)
router.put('/editprofile/:id', /*validateEditProfile, userValidation,*/ upload.single('avatar'), editProfile)
router.put('/submitverification/:id', upload.fields([{ name: 'verify', maxCount: 3 }]), submitVerification)
router.put('/verify/:id', userVerify)
router.put('/editshipping/:id', editShipping)
router.put('/addtocart/:id', addToCart)
router.put('/removecart/:id', removeCart)
router.put('/purchasepackage/:id', purchasePkg)
// router.put('/convert-epacash/:id', convertEpaCash)
router.put('/iou/:id', collectIOU)
router.put('/loan/:id', collectLoan)
router.put('/donation-uhw/:id', donationUhw)
router.put('/edit-pkgstatus/:id', pkgStatus)
// router.put('/calc-quota/:id', calculateQuota)
// router.put('/allowance/:id', giveAllowance)
// router.put('/valid-quota/:id/:validChildrenCount', validQuota)
router.put('/delegate-pin/:id', setDelegatePin)
router.put('/undelegate-pin/:id', unDelegatePin)
router.put('/upgrade-package/:id', upgradePkg)
router.put('/activate-gold/:id', activateGold)

// get children
router.get('/teams/:id', getTeams)
// get top jba
router.get('/teams', getTopJba)
// get all users
router.get('/', getUsers)
// get user
router.get('/:id', getUser)

module.exports = router
