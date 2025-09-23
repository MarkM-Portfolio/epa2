const express = require('express')
const router = express.Router()

const { postNotifs,
        readNotifs,
        getNotifs,
        getNotif } = require('../controllers/notification')

router.post('/', postNotifs)
router.put('/:id', readNotifs)

// get all notifications
router.get('/', getNotifs)
// get notifications
router.get('/:id', getNotif)

module.exports = router
