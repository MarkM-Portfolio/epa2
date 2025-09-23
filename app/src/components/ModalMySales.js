import axios from 'axios'
import classNames from 'classnames'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ModalMySales = ({ show, onClose, children, deliveryChannel, deliveryType, deliveryVehicle, deliveryWeight, deliveryInsurance, item, details, currentUser, store }) => {

    const overlayClasses = classNames(
        'fixed inset-0 flex items-center justify-center z-50',
        {
          'hidden': !show,
          'block': show
        }
    )
        
    const modalClasses = classNames(
        'bg-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto',
        {
            'hidden': !show,
            'block': show,
            'sm:w-3/4': show,
            'md:w-1/2': show,
            'lg:w-1/3': show
        }
    )
    
    const selectDeliveryChannel = async (e) => {
        if (deliveryChannel === 'manual') {
            toast.info(deliveryChannel.charAt(0).toUpperCase() + deliveryChannel.slice(1) + ' selected.')
            setDeliveries(e)
            onClose()
        }
        if (deliveryChannel === 'borzo') {
            toast.info(deliveryChannel.charAt(0).toUpperCase() + deliveryChannel.slice(1) + ' selected.')
            toast.info('Not Yet Available')
            // borzoAuth()
            onClose()
        }
        if (deliveryChannel === 'transportify') {
            toast.success(deliveryChannel.charAt(0).toUpperCase() + deliveryChannel.slice(1) + ' selected.')
            toast.info('Not Yet Available')
            // transportifyAuth(item, details)
            onClose()
        }
        if (deliveryChannel === 'ninjavan') {
            toast.error(deliveryChannel.charAt(0).toUpperCase() + deliveryChannel.slice(1) + ' selected.')
            toast.info('Not Yet Available')
            // ninjavanAuth(item, details)
            onClose()
        }
        if (!deliveryChannel) {
            toast.error('No delivery channel selected.')
        }
    }

    // const borzoAuth = async () => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()
    
    //     await axios.get('/api/borzo/borzo-auth', {
    //         headers: {
    //             'X-DV-Auth-Token': process.env.NODE_ENV === 'production' ? process.env.BORZO_AUTH_TOKEN : process.env.BORZO_MOCK_AUTH_TOKEN,
    //             'Content-Type': 'application/json; charset=utf-8',
    //             'Accept': 'application/json; charset=utf-8'
    //         },
    //         data: { cancelToken: source.token }
    //     }).then(res => {
    //         console.log('Success OK: ', res.status)
    //         console.log('Response Auth: ', res.data) //is_successful = true
    //         toast.success('Authentication Success!')
    //         borzoCalcOrder()
    //         return res
    //     }).catch((err) => {
    //         toast.error('Error Authentication !')
    //         if (axios.isCancel(err)) {
    //             console.log('Successfully Aborted')
    //             toast.error(err.response.data.error)
    //         } else if (err.response.status === 422) { // response >> validation errors
    //             console.log('Validation Error: ', err.response.status)
    //             toast.error(err.response.data.meta.message)
    //         } else if (err.response.status === 403) { // response >> headers forbidden
    //             console.log('Forbidden: ', err.response.status)
    //             toast.error(err.response.data.meta.message)
    //         } else { // response >> server/page not found 404,500
    //             console.log('Server Error: ', err.response.status)
    //             toast.error(err.response.data.meta.message)
    //         }
    //         return err
    //     })
    // }

    // const borzoCalcOrder = async () => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     const address = store.name.replace(/^\s+|\s+$/gm, ' ') + ' ' + store.address.replace(/^\s+|\s+$/gm, ' ') + ' ' + store.city.replace(/^\s+|\s+$/gm, ' ') + ' ' + store.province.replace(/^\s+|\s+$/gm, ' ') + ' ' + String(store.zipcode)

    //     const sender = {
    //         address: address,
    //         contact_person: {
    //             name: currentUser.name,
    //             phone: store.contactnumber
    //         },
    //         // is_order_payment_here: true,
    //         client_order_id: `${ item._id }-${ details._id }`,
    //         // packages: [
    //             // details._id, details.description, details.quantity, details.price
    //         // ]
    //     }
    
    //     const recepient = {
    //         // change recepient address later after test
    //         address: `${ store.name } ${ store.address } ${ store.city } ${ store.province } ${ store.zipcode }`,
    //         // latitude: JSON.stringify,
    //         // longitude: JSON.stringify,
    //         // delivery_id: ,
    //         is_cod_cash_voucher_required: true,
    //         // is_order_payment_here: true,
    //         taking_amount: 100,
    //         // buyout_amount: 0,
    //         // delivery_fee_amount: ,
    //         contact_person: {
    //             name: item.name,
    //             phone: item.mobilenum
    //         },
    //         client_order_id: `${ item._id }-${ details._id }`,
    //         // packages: packages
    //             // details._id, details.description, details.quantity, details.price
    //             // [ 123, 'desc', '2', '350' ]
    //     }
    
    //     const points = []
    //     points.push(sender)
    //     points.push(recepient)    
        
    //     const data = {
    //         'matter': 'Documents',
    //         'points': points,
    //         'type': deliveryType,
    //         'vehicle_type_id': deliveryVehicle,
    //         'total_weight_kg': deliveryWeight,
    //         'insurance_amount': deliveryInsurance,
    //         // is_client_notification_enabled: ,
    //         // is_contact_person_notification_enabled: ,
    //         // payment_method: ,
    //         // is_return_required: ,
    //     }

    //     console.log('DATA CALCULATE ORDER: ', data)
    //     // console.log('order ID: ', item._id)
    //     // console.log('details ID: ', details._id)
    //     // console.log('client_order ID: ', data.points[1].client_order_id)
    
    //     await axios.post('/api/borzo/borzo-calc-order', data, {
    //         headers: {
    //             'X-DV-Auth-Token': process.env.NODE_ENV === 'production' ? process.env.BORZO_AUTH_TOKEN : process.env.BORZO_MOCK_AUTH_TOKEN,
    //             'Content-Type': 'application/json; charset=utf-8',
    //             'Accept': 'application/json; charset=utf-8'
    //         },
    //         data: { cancelToken: source.token }
    //     }).then(res => {
    //         console.log('Success OK: ', res.status)
    //         console.log('Response Calculate Order >> ', res.data)
    //         toast.info('Calculating order...')
    //         borzoCOD()
    //         return res
    //     }).catch((err) => {
    //         if (axios.isCancel(err)) {
    //             console.log('Successfully Aborted')
    //             toast.error(err.message)
    //         } else if (err.response.status === 422) { // response >> validation errors
    //             console.log('Validation Error: ', err.response.status)
    //             toast.error(err.message)
    //         } else if (err.response.status === 403) { // response >> headers forbidden
    //             console.log('Forbidden: ', err.response.status)
    //             toast.error(err.message)
    //         } else { // response >> server/page not found 404,500
    //             console.log('Server Error: ', err.response.status)
    //             toast.error(err.message)
    //         }
    //         return err
    //     })
    // }

    // const borzoCOD = async () => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     const address = store.name.replace(/^\s+|\s+$/gm, ' ') + ' ' + store.address.replace(/^\s+|\s+$/gm, ' ') + ' ' + store.city.replace(/^\s+|\s+$/gm, ' ') + ' ' + store.province.replace(/^\s+|\s+$/gm, ' ') + ' ' + String(store.zipcode)
    //     console.log('ADDRESS: ', address) // test not accepting any address only Manila
    
    //     const sender = {
    //         address: "Unit 802, EcoTower, 32nd Street corner 9th Avenue, BGC, Taguig, 1634 Metro Manila",
    //         contact_person: {
    //             name: store.name,
    //             phone: store.contactnumber
    //         },
    //         // is_order_payment_here: true,
    //         client_order_id: `${ item._id }-${ details._id }`,
    //     }
    
    //     const recepient = {
    //         // change recepient address later after test
    //         address: "Unit 802, EcoTower, 32nd Street corner 9th Avenue, BGC, Taguig, 1634 Metro Manila",
    //         // address: `${ store.address } ${ store.city } ${ store.province } ${ store.zipcode }`,
    //         // latitude: JSON.stringify,
    //         // longitude: JSON.stringify,
    //         // delivery_id: ,
    //         is_cod_cash_voucher_required: true,
    //         // is_order_payment_here: true,
    //         taking_amount: 100,
    //         // buyout_amount: 0,
    //         // delivery_fee_amount: ,
    //         contact_person: {
    //             name: item.name,
    //             phone: item.mobilenum
    //         },
    //         client_order_id: `${ item._id }-${ details._id }`,
    //         // packages: [
    //         //     details._id, details.description, details.quantity, details.price
    //         // ]
    //     }
    
    //     const points = []
    //     points.push(sender)
    //     points.push(recepient)    
        
    //     const data = {
    //         'matter': 'Documents',
    //         'points': points,
    //         'type': deliveryType,
    //         'vehicle_type_id': deliveryVehicle,
    //         'total_weight_kg': deliveryWeight,
    //         'insurance_amount': deliveryInsurance,
    //         // is_client_notification_enabled: ,
    //         // is_contact_person_notification_enabled: ,
    //         // payment_method: ,
    //         // is_return_required: ,
    //     }

    //     // console.log('DATA COD: ', data)
    
    //     await axios.post('/api/borzo/borzo-cod', data, {
    //         headers: {
    //             'X-DV-Auth-Token': process.env.NODE_ENV === 'production' ? process.env.BORZO_AUTH_TOKEN : process.env.BORZO_MOCK_AUTH_TOKEN,
    //             'Content-Type': 'application/json; charset=utf-8',
    //             'Accept': 'application/json; charset=utf-8'
    //         },
    //         data: { cancelToken: source.token }
    //     }).then(res => {
    //         console.log('Success OK: ', res.status)
    //         console.log('Response Cash On Delivery: ', res.data)
    //         toast.success('Success COD !')
    //         setDeliveries(res.data)
    //         return res
    //     }).catch((err) => {
    //         if (axios.isCancel(err)) {
    //             console.log('Successfully Aborted')
    //             toast.error(err.message)
    //         } else if (err.response.status === 422) { // response >> validation errors
    //             console.log('Validation Error: ', err.response.status)
    //             toast.error(err.message)
    //         } else if (err.response.status === 403) { // response >> headers forbidden
    //             console.log('Forbidden: ', err.response.status)
    //             toast.error(err.message)
    //         } else { // response >> server/page not found 404,500
    //             console.log('Server Error: ', err.response.status)
    //             toast.error(err.message)
    //         }
    //         return err
    //     })
    // }

    const setDeliveries = async (e, deliveryData) => {
        e.preventDefault()
        e.currentTarget.disabled = true

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('sender', currentUser._id)
        formData.append('recepientEmail', item.email)
        formData.append('channel', deliveryChannel)
        formData.append('details', JSON.stringify(details))
        formData.append('deliveryData', JSON.stringify(deliveryData))

        await axios.post(`/api/delivery/setdelivery`, formData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            console.log('Reponse Delivery OK: ', res.data.message)
            toast.success(res.data.message)
            orderUpdate()
            return res
        }).catch((err) => {
            if (axios.isCancel(err)) {
                console.log('Successfully Aborted')
                toast.error(err.response.data.error)
            } else if (err.response.status === 422) { // response >> validation errors
                console.log('Validation Error: ', err.response.status)
                toast.error(err.response.data.error)
            } else if (err.response.status === 403) { // response >> headers forbidden
                console.log('Forbidden: ', err.response.status)
                toast.error(err.response.data.error)
            } else { // response >> server/page not found 404,500
                console.log('Server Error: ', err.response.status)
                toast.error(err.response.data.error)
            }
            return err
        })
    }

    const orderUpdate = async () => {

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/order/updateorder/${ item._id }`, { 'detailsId': details._id }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.success(res.data.message)
            setTimeout(() => {
                window.location.reload()
            }, 1000)
            return res
        }).catch((err) => {
            if (axios.isCancel(err)) {
                console.log('Successfully Aborted')
                toast.error(err.response.data.error)
            } else if (err.response.status === 422) { // response >> validation errors
                console.log('Validation Error: ', err.response.status)
                toast.error(err.response.data.error)
            } else if (err.response.status === 403) { // response >> headers forbidden
                console.log('Forbidden: ', err.response.status)
                toast.error(err.response.data.error)
            } else { // response >> server/page not found 404,500
                console.log('Server Error: ', err.response.status)
                toast.error(err.response.data.error)
            }
            return err
        })
    }

    return (
        <>
            <div className={ overlayClasses }>
                <div className={ modalClasses }>
                    <div className="flex justify-end">
                        <button className="text-gray-500 hover:text-gray-800 focus:outline-none" onClick={ () => onClose() } >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="mt-4">{ children }
                        <div className='flex justify-end text-white mt-4'>
                            <button onClick={ (e) => selectDeliveryChannel(e) } className='bg-orange-500 hover:bg-red-700 py-2 px-4 rounded'>Select</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </>
    )
}

export default ModalMySales
