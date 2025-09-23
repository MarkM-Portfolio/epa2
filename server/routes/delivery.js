const express = require('express')
const router = express.Router()
// const { AfterShip } = require('aftership');
// const aftership = new AfterShip('YOUR_API_KEY');

// aftership.courier.listAllCouriers()
//   .then(result => console.log(result))
//   .catch(err => console.log(err));

const { /*afterShip,*/
        setDelivery,
        // updateDelivery,
        getDeliveries,
        // getDeliverySender,
        getDeliveryRecepient } = require('../controllers/delivery')

// aftership
// router.post('/tracking', afterShip)

// set delivery
router.post('/setdelivery', setDelivery)
// update delivery
// router.put('/updatedelivery', updateDelivery)
// get all deliveries
router.get('/', getDeliveries)
// get delivery sender
// router.get('/sender/:id', getDeliverySender)
// get delivery recepient
// router.get('/recepient/:id', getDeliveryRecepient)

module.exports = router
