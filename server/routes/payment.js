const express = require('express')
const router = express.Router()

const { /* auth, */
        payEpaCredits,
        payNow,
        paymentConfirm } = require('../controllers/payment')

// router.post('/', auth)

// payment
router.post('/pay-now', payNow)
router.post('/pay-epacredits/:id', payEpaCredits)

// payment webhook
router.post(`/${ process.env.DB_ENV === 'production' ? process.env.HITPAY_WEBHOOK : process.env.HITPAY_MOCK_WEBHOOK }`, paymentConfirm)

module.exports = router
