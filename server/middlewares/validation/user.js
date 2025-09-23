const { check, validationResult } = require('express-validator')

exports.userValidation = (req, res, next) => {
    const result = validationResult(req).array()
    
    if (!result.length) return next()

    const error = result[0].msg
    return res.status(422).json({ error: error })
}

exports.validateRegister = [
    check('name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Name is required!')
        .isString()
        .withMessage('Name must be a valid!')
        .isLength({ min: 3, max: 30 })
        .withMessage('Name must be within 3 to 30 characters!')
        .custom((value) => {
            if (value.match(/\d+/))
                throw new Error('Name must not contain a number!')
            else if (value.match(/[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~]/))
                throw new Error('Name must not contain special characters!')
            else if (!value.match(/^[A-Za-z\s]+$/))
                throw new Error('Name must only contain letters!')
            return true
        }),
    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email is required!')
        .isEmail()
        .withMessage('Email is not valid!'),
    check('mobilenum')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Mobile number is required!')
        .isNumeric()
        .withMessage('Mobile number should be numeric.')
        .isLength({ min: 10 })
        .withMessage('Mobile number must be exactly 10 numbers!'),
    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is required!')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long!'),
    check('confirmpw')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Confirm password is required.')
        .custom((value, { req }) => {
            if (value !== req.body.password)
                throw new Error('Password don\'t match! Both must be the same.')
            return true
        })
]

exports.validateForgotPassword = [
    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email is required!')
        .isEmail()
        .withMessage('Email is not valid!')
]

exports.validateResetPassword = [
    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is required!')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long!'),
    check('confirmpw')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Confirm password is required.')
        .custom((value, { req }) => {
            if (value !== req.body.password)
                throw new Error('Passwords don\'t match! Both must be the same.')
            return true
        })
]

exports.validateLogin = [
    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email is required!')
        .isEmail()
        .withMessage('Email is not valid!'),
    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is required!')
]

// exports.validateEditProfile = [
//     check('name')
//         .trim()
//         .not()
//         .isEmpty()
//         .withMessage('Name is required!')
//         .isString()
//         .withMessage('Name must be a valid!')
//         .isLength({ min: 3, max: 30 })
//         .withMessage('Name must be within 3 to 30 characters!')
//         .custom((value) => {
//             if (value.match(/\d+/))
//                 throw new Error('Name must not contain a number!')
//             else if (value.match(/[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~]/))
//                 throw new Error('Name must not contain special characters!')
//             return true
//         }),
//     check('mobilenum')
//         .trim()
//         .not()
//         .isEmpty()
//         .withMessage('Mobile number is required!')
//         .isNumeric()
//         .withMessage('Mobile number should be numeric.')
//         .isLength({ min: 10 })
//         .withMessage('Mobile number must be exactly 10 numbers!')
// ]

// exports.validateWithdrawAccount = [
//     check('name')
//         .trim()
//         .not()
//         .isEmpty()
//         .withMessage('Name is required!')
//         .isString()
//         .withMessage('Name must be a valid!')
//         .isLength({ min: 3, max: 20 })
//         .withMessage('Name must be within 3 to 20 characters!'),
//     check('email')
//         .normalizeEmail()
//         .isEmail()
//         .withMessage('Invalid Email!'),
//     check('withdrawNum')
//         .trim()
//         .not()
//         .isEmpty()
//         .withMessage('Mobile number and Email are required!')
//         .isNumeric()
//         .withMessage('Mobile number should be numeric.')
// ]
