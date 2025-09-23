import NavbarMobile from '../../MobileView/NavbarMobile'
import Cookies from 'universal-cookie'
import axios from 'axios'
import ModalMySales from '../../ModalMySales'
import ModalMyOrderReceipt from '../../ModalMyOrderReceipt'
import manualImg from '../../../assets/manual.png'
import borzoImg from '../../../assets/borzo.png'
import transportifyImg from '../../../assets/transportify.png'
import ninjaVanImg from '../../../assets/ninjavan.png'
import { useState, useEffect } from 'react'
import { FaArrowAltCircleLeft, FaReceipt } from 'react-icons/fa'
import { RiMoneyDollarCircleFill } from 'react-icons/ri'
import { NavLink, useNavigate } from 'react-router-dom'
// import { TbCurrencyPeso } from 'react-icons/tb'
import { Radio, RadioGroup, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
import epa_coin from '../../../assets/epa-coin.gif'

const MySales = () => {
    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ store, setStore ] = useState('')
    const [ orders, setOrders ] = useState([])
    const [ item, setItem ] = useState([])
    const [ details, setDetails ] = useState([])
    // const [ fees, setFees ] = useState('')
    // const [ extra, setExtra ] = useState('')
    // const [ deliveryStatus, setDeliveryStatus ] = useState([])
    const [ deliveryChannel, setDeliveryChannel ] = useState('manual')
    const [ deliveryType, setDeliveryType ] = useState('standard')
    const [ deliveryVehicle, setDeliveryVehicle ] = useState(8)
    const [ deliveryWeight, setDeliveryWeight ] = useState(0)
    const [ deliveryInsurance, setDeliveryInsurance ] = useState(0)
    const [ highToken, setHighToken ] = useState('')
    const [ lowToken, setLowToken ] = useState('')
    const [ show, setShow ] = useState(false)

    const showModal = () => setShow(true)
    const closeModal = () => setShow(false)

    const [ userImg1, setUserImg1 ] = useState('')
    const [ userImg2, setUserImg2 ] = useState('')
    const [ userImg3, setUserImg3 ] = useState('')

    const [ showOrderRpt, setshowOrderRpt ] = useState(false)

    const showModalOrderRpt = () => setshowOrderRpt(true)
    const closeModalOrderRpt = () => setshowOrderRpt(false)

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
    
        if (user && user.id) {
            axios.get(`/api/setting`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setHighToken(res.data.settings.highToken)
                setLowToken(res.data.settings.lowToken)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
    
        if (user && user.id) {
          axios.get(`/api/user/${ user.id }`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setCurrentUser(res.data.user)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
    
        if (currentUser && currentUser._id) {
          axios.get(`/api/store/${ currentUser._id }`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setStore(res.data.store)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ currentUser ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        const userSales = []

        if (currentUser && currentUser._id) {
            axios.get(`/api/order`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                res.data.orders.forEach(item => {
                    const newDetails = item.details.filter(det => det.owner.includes(currentUser._id))
                    item.details = newDetails
                    userSales.push(item)
                })

                userSales.sort((a, b) => {
                    // Check if any of the details is confirmed, cancelled, or received
                    const aConfirmed = a.details.some(detail => detail.isConfirmed)
                    const bConfirmed = b.details.some(detail => detail.isConfirmed)
                    const aCancelled = a.details.some(detail => detail.isCancelled)
                    const bCancelled = b.details.some(detail => detail.isCancelled)
                    const aReceived = a.details.some(detail => detail.isReceived)
                    const bReceived = b.details.some(detail => detail.isReceived)
                
                    // Sort based on isReceived first
                    if (!aReceived && bReceived) {
                        return -1 // a should come first if only a not received
                    } else if (aReceived && !bReceived) {
                        return 1 // b should come first if only b not received
                    } else {
                        // If isReceived is the same, sort based on isCancelled
                        if (!aCancelled && bCancelled) {
                            return -1 // a should come first if only a is not cancelled
                        } else if (aCancelled && !bCancelled) {
                            return 1 // b should come first if only b is not cancelled
                        } else {
                            // If isCancelled is the same, sort based on isConfirmed
                            if (!aConfirmed && bConfirmed) {
                                return -1 // a should come first if only a is not confirmed
                            } else if (aConfirmed && !bConfirmed) {
                                return 1 // b should come first if only b is not confirmed
                            } else {
                                return 0 // if both confirmed or both not confirmed, maintain order
                            }
                        }
                    }
                })
                
                setOrders(userSales)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ currentUser ])

    // useEffect(() => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()
    
    //     if (orders && orders.length) {
    //         axios.get('/api/borzo/borzo-my-orders', {
    //             headers: {
    //                 'X-DV-Auth-Token': process.env.NODE_ENV === 'production' ? process.env.BORZO_AUTH_TOKEN : process.env.BORZO_MOCK_AUTH_TOKEN,
    //                 'Content-Type': 'application/json charset=utf-8',
    //                 'Accept': 'application/json charset=utf-8'
    //             },
    //             data: { cancelToken: source.token }
    //         }).then(res => {
    //             console.log('Success OK: ', res.status)
    //             setDeliveryStatus(res.data.orders)
    //             return res
    //         }).catch((err) => {
    //             if (axios.isCancel(err)) {
    //                 console.log('Successfully Aborted')
    //                 console.log(err.response.data.error)
    //             } else if (err.response.status === 422) { // response >> validation errors
    //                 console.log('Validation Error: ', err.response.status)
    //                 console.log(err.response.data.meta.message)
    //             } else if (err.response.status === 403) { // response >> headers forbidden
    //                 console.log('Forbidden: ', err.response.status)
    //                 console.log(err.response.data.meta.message)
    //             } else { // response >> server/page not found 404,500
    //                 console.log('Server Error: ', err.response.status)
    //                 console.log(err.response.data.meta.message)
    //             }
    //             return err
    //         })
    //     }
    // }, [ orders ])

    // useEffect(() => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     if (deliveryStatus && orders && orders.length) {
    //         axios.get(`/api/delivery/sender/${ currentUser._id }`, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json',
    //                 'X-Api-Key': process.env.API_KEY
    //             },
    //             data: { cancelToken: source.token }
    //         }).then(res => {
    //             console.log('Success OK: ', res.status)
    //             res.data.delivery.forEach(item => {
    //                 deliveryStatus.forEach(bItem => {
    //                     if (bItem.order_id === item.deliveryData.order.order_id && bItem.status !== item.deliveryData.order.status) {
    //                         item.deliveryData.order = []
    //                         item.deliveryData.order = bItem
    //                         updateDelivery(item)
    //                     }
    //                 })
    //             })
    //         }).catch((err) => {
    //             if (axios.isCancel(err)) console.log('Successfully Aborted')
    //             else console.error(err)
    //         })
    //         return () => { source.cancel() }
    //     }
    // }, [ deliveryStatus ])

    const orderConfirm = async (e, itemId, detailsId) => {
        e.preventDefault()
        e.currentTarget.disabled = true

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/order/confirmorder/${ itemId }`, { 'detailsId': detailsId }, {
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

    const receiveConfirm = async (e, itemId, detailsId) => {
        e.preventDefault()
        e.currentTarget.disabled = true

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/order/receiveorder/${ itemId }`, { 'detailsId': detailsId }, {
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

    // const updateDelivery = async (data) => {

    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     await axios.put(`/api/delivery/updatedelivery`, data, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json',
    //             'X-Api-Key': process.env.API_KEY
    //         },
    //         data: { cancelToken: source.token }
    //     }).then(res => {
    //         console.log('Success OK: ', res.status)
    //         return res
    //     }).catch((err) => {
    //         if (axios.isCancel(err)) {
    //             console.log('Successfully Aborted')
    //             console.log(err.response.data.error)
    //         } else if (err.response.status === 422) { // response >> validation errors
    //             console.log('Validation Error: ', err.response.status)
    //             console.log(err.response.data.error)
    //         } else if (err.response.status === 403) { // response >> headers forbidden
    //             console.log('Forbidden: ', err.response.status)
    //             console.log(err.response.data.error)
    //         } else { // response >> server/page not found 404,500
    //             console.log('Server Error: ', err.response.status)
    //             console.log(err.response.data.error)
    //         }
    //         return err
    //     })
    // }

    // const readFileAsBlob = (file) => {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader()
    //         reader.onload = () => {
    //             const result = reader.result
    //             resolve(new Blob([result], { type: file.type }))
    //         }
    //         reader.onerror = reject
    //         reader.readAsArrayBuffer(file)
    //     })
    // }

    // const handleFileSave = async() => {

    //     const userImg1Blob = await readFileAsBlob(userImg1)
    //     const userImg2Blob = await readFileAsBlob(userImg2)
    //     const userImg3Blob = await readFileAsBlob(userImg3)

    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     const formData = new FormData()
    //     formData.append('order', userImg1Blob)
    //     formData.append('order', userImg2Blob)
    //     formData.append('order', userImg3Blob)
        
    //     console.log('Data >>', data)

    //     await axios.put(`/api/order/submit-orderReceipt/${ user.id }`, formData, {
    //         headers: {
    //             'Content-Type': 'multipart/form-data',
    //             'Accept': 'multipart/form-data',
    //             'X-Api-Key': process.env.API_KEY
    //         },
    //         data: { cancelToken: source.token }
    //     }).then(res => {
    //         console.log('Success OK: ', res.status)
    //         return res
    //     }).catch((err) => {
    //         if (axios.isCancel(err)) {
    //             console.log('Successfully Aborted')
    //             toast.error(err.response.data.error)
    //         } else if (err.response.status === 422) { // response >> validation errors
    //             console.log('Validation Error: ', err.response.status)
    //             toast.error(err.response.data.error)
    //         } else if (err.response.status === 403) { // response >> headers forbidden
    //             console.log('Forbidden: ', err.response.status)
    //             toast.error(err.response.data.error)
    //         } else { // response >> server/page not found 404,500
    //             console.log('Server Error: ', err.response.status)
    //             toast.error(err.response.data.error)
    //         }
    //         return err
    //     })
    // }

    const goBack = () => {
        navigate(-1)
    }

    return (
        <>
            <div className='font-montserrat lg:hidden'>
                <div className='px-6 mt-10'>
                    <div className='flex items-center gap-2'> 
                        <div className='grid grid-cols-2 font-bold font-montserrat'>
                            <FaArrowAltCircleLeft onClick={ () => goBack() } className='text-4xl' />
                        </div>   
                    </div>
                </div>
                <div className='flex justify-center gap-2 text-3xl -mt-7'>
                    <RiMoneyDollarCircleFill className='fill-emerald-400' />
                    <h1 className='text-2xl text-center font-semibold mb-10 pl-1'>My Sales</h1>
                </div>
                <hr />

                <div className='mt-2 px-6'>
                    { currentUser && currentUser._id && orders.length ? 
                        <div className='mt-4'>
                            { orders.map((item, idx) => (
                                <div className='flex flex-wrap gap-2 justify-center mb-4' key={ idx }>
                                    { item.details.map(det => (
                                        <div className="flex flex-2 items-end" key={ det._id }>
                                            <div className={ `border h-30 ${ innerWidth >=400 ? 'w-[178px]' : 'w-[152px]' } rounded-lg shadow-md` }>
                                                <div className='items-center'>
                                                    <img className='object-contain mb-2' src={ window.location.origin + '/public' + `${ det.stocks ? '/products/' : '/services/' }` + det.image } />
                                                </div>
                                                <div className='text-xs ml-2'>
                                                    <div className='font-semibold text-md'>{ det.name }</div>
                                                    <div className='flex items-center text-xl text-red-500'>
                                                        <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                                                        <div className='text-black-800'>{ det.stocks ? ((det.price * (det.token === 'high' ? highToken : lowToken) + det.price) * det.quantity + parseFloat(det.fees.$numberDecimal) + parseFloat(det.extra.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (det.price * (det.token === 'high' ? highToken : lowToken) + det.price + parseFloat(det.fees.$numberDecimal) + parseFloat(det.extra.$numberDecimal)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                                    </div>
                                                    <div className='mt-1 font-semibold text-md'>{ det.stocks ? 'Quantity: ' + det.quantity : '' }</div>
                                                    <div className='flex flex-cols-2 gap-1'>
                                                        <div className='font-semibold text-md'>Charge for Extra:</div>
                                                        <div className='text-blue-500 font-semibold text-md'>{ det.extra.$numberDecimal }</div>
                                                    </div>
                                                    <div className='flex flex-cols-2 gap-1'>
                                                        <div className='font-semibold text-md'>Delivery Fees:</div>
                                                        <div className='text-blue-500 font-semibold text-md'>{ det.fees.$numberDecimal }</div>
                                                    </div>
                                                    <div className='font-semibold text-md'>Buyer:</div>
                                                    <div className='font-semibold text-md px-3 text-emerald-500'>{ item.name }</div>
                                                    <div className='font-semibold text-md px-3 text-red-500'>{ item.mobilenum }</div>
                                                    <div className='font-semibold text-md px-3 text-blue-500'>{ item.shippingAddress.address }</div>
                                                    <div className='font-semibold text-md px-3 text-blue-500'>{ item.shippingAddress.city }</div>
                                                    <div className='font-semibold text-md px-3 text-blue-500'>{ item.shippingAddress.province }</div>
                                                    <div className='font-semibold text-md px-3 text-blue-500'>{ item.shippingAddress.zipcode }</div>
                                                    <div className='font-semibold text-md px-3 text-blue-500'>{ item.shippingAddress.country }</div>
                                                    {/* <div className={ `${ det.isCancelled ? 'text-red-500': 'text-blue-500' } font-semibold text-md` }>Payment: { item.isPaid ? 'Done' : det.isCancelled ? 'Order Cancelled' : 'Pending' }</div> */}
                                                    <div className='flex flex-cols-2 gap-1'>
                                                        <div className='font-semibold text-md'>Payment:</div>
                                                        <div className={ `${ det.isCancelled ? 'text-red-500': 'text-blue-500' } font-semibold text-md` }>{ det.isCancelled ? 'Order Cancelled' : 'Done' }</div>
                                                    </div>
                                                    <div className='m-2 flex flex-cols gap-2 justify-center'>
                                                        <button hidden={ det.isConfirmed } className={ `${ det.isCancelled ? 'bg-gray-300' : 'bg-blue-500' } font-semibold p-2 justify-center text-white rounded` } onClick={ (e) => { setItem(item), setDetails(det), orderConfirm(e, item._id, det._id) } }>{ det.isCancelled ? 'Cancelled' : 'Confirm' }</button>
                                                        <button hidden={ det.isConfirmed } className={ `${ det.isCancelled ? 'bg-gray-300' : 'bg-amber-500' } font-semibold p-2 justify-center text-white rounded` } onClick={ () => { setItem(item), setDetails(det), showModalOrderRpt() } }>{ det.isCancelled ? 'Cancelled' : 'Attach Receipt' }</button>
                                                        <button hidden={ !det.isConfirmed || det.isShipped } className={ `${ det.isCancelled ? 'bg-gray-300' : 'bg-orange-500' } font-semibold p-2 justify-center text-white rounded` } onClick={ () => { setItem(item), setDetails(det), showModal() } }>{ det.isCancelled ? 'Cancelled' : 'Ship Now' }</button>
                                                        <button hidden={ !det.isShipped } className={ `${ det.isReceived ? 'bg-gray-300' : 'bg-emerald-500' } font-semibold p-2 justify-center text-white rounded` } onClick={ (e) => { setItem(item), setDetails(det), receiveConfirm(e, item._id, det._id) } }>{ det.isReceived ? 'Received' : 'Is Received?' }</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) }
                                    {/* <div className='flex justify-end rounded-lg gap-2 pt-3'>
                                        <NavLink to="/display-orderReceipt" state={ item }>
                                        <div className='flex items-center text-gray-400'>
                                            <FaReceipt color='#84CC16' />
                                            <p className='text-xs'>View Order Receipt</p>
                                        </div>
                                        </NavLink>
                                    </div> */}
                                </div>
                            )) }
                        </div>
                        : 
                        <div className='mt-6'>
                            <div className='flex justify-center'>
                                <RiMoneyDollarCircleFill className='text-4xl' />
                            </div>
                            <h1 className='text-xl font-semibold text-center mt-4'>
                                No Sales Yet !
                            </h1>
                        </div>
                    }

                    <ModalMySales deliveryChannel={ deliveryChannel } deliveryType={ deliveryType } deliveryVehicle={ deliveryVehicle } deliveryWeight={ deliveryWeight } deliveryInsurance={ deliveryInsurance } item={ item } details={ details } currentUser={ currentUser } store={ store } show={ show } onClose={ closeModal }>
                        <h2 className="text-lg font-bold">Choose Delivery Channel</h2>
                        <div className='flex justify-center pt-2'>
                            <div className='p-6 flex items-center justify-between px-35'>
                                <RadioGroup name="use-radio-group" defaultValue="manual">
                                    <div className='p-3 grid grid-cols-3 gap-10 items-center justify-center'>
                                        <div className='flex flex-cols gap-2 items-center'>
                                            <img className='rounded' src={ manualImg } alt="Borzo Icon" />
                                            <p className='text-lg font-semibold'>Manual</p>
                                            <FormControlLabel control={<Radio value="manual" onChange={(e) => setDeliveryChannel(e.target.value)} style={{color: "#013220"}} />} />
                                        </div>
                                    </div>
                                    { deliveryChannel === 'manual' ? 
                                        <div className='ml-2 items-center'>
                                            <FormControl sx={{ m: 2, minWidth: 150 }} size="small">
                                                <InputLabel id="delivery-type-select-label">Delivery Type</InputLabel>
                                                <Select
                                                    labelId="delivery-type-select-label"
                                                    id='delivery-type-select'
                                                    value={ deliveryType }
                                                    label="Delivery Type"
                                                    onChange={ (e) => setDeliveryType(e.target.value) }
                                                >
                                                    <MenuItem value='standard'>Standard</MenuItem>
                                                    {/* <MenuItem value='same_day'>Same Day</MenuItem>
                                                    <MenuItem value='hyperlocal'>Hyperlocal</MenuItem> */}
                                                </Select>
                                            </FormControl>
                                            {/* <FormControl sx={{ m: 2, minWidth: 150 }} size="small">
                                                <InputLabel id="delivery-vehicle-select-label">Vehicle Type</InputLabel>
                                                <Select
                                                    labelId="delivery-vehicle-select-label"
                                                    id='delivery-vehicle-select'
                                                    value={ deliveryVehicle }
                                                    label="Vehicle Type"
                                                    onChange={ (e) => setDeliveryVehicle(e.target.value) }
                                                >
                                                    <MenuItem value={7}>Car</MenuItem>
                                                    <MenuItem value={8}>Motorbike</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <input 
                                                className='border-2 p-2 mt-2 bg-white-100 ml-4'
                                                type="text" 
                                                placeholder="Total Weight (kg)"
                                                onChange={ (e) => setDeliveryWeight(e.target.value)}
                                            />
                                            <input 
                                                className='border-2 p-2 mt-2 bg-white-100 ml-4 mb-2'
                                                type="text" 
                                                placeholder="Insurance Amount"
                                                onChange={ (e) => setDeliveryInsurance(e.target.value)}
                                            /> */}
                                        </div>
                                        : 
                                        ''
                                    }

                                    <div className='p-3 grid grid-cols-3 gap-10 items-center justify-center'>
                                        <div className='flex flex-cols gap-2 items-center'>
                                            <img className='rounded' src={ borzoImg } alt="Borzo Icon" />
                                            <p className='text-lg font-semibold'>Borzo</p>
                                            <FormControlLabel control={<Radio value="borzo" onChange={(e) => setDeliveryChannel(e.target.value)} style={{color: "#2E2EFF"}} />} />
                                        </div>
                                    </div>
                                    { deliveryChannel === 'borzo' ? 
                                        <div className='ml-2 items-center'>
                                            <FormControl sx={{ m: 2, minWidth: 150 }} size="small">
                                                <InputLabel id="delivery-type-select-label">Delivery Type</InputLabel>
                                                <Select
                                                    labelId="delivery-type-select-label"
                                                    id='delivery-type-select'
                                                    value={ deliveryType }
                                                    label="Delivery Type"
                                                    onChange={ (e) => setDeliveryType(e.target.value) }
                                                >
                                                    <MenuItem value='standard'>Standard</MenuItem>
                                                    {/* <MenuItem value='same_day'>Same Day</MenuItem>
                                                    <MenuItem value='hyperlocal'>Hyperlocal</MenuItem> */}
                                                </Select>
                                            </FormControl>
                                            <FormControl sx={{ m: 2, minWidth: 150 }} size="small">
                                                <InputLabel id="delivery-vehicle-select-label">Vehicle Type</InputLabel>
                                                <Select
                                                    labelId="delivery-vehicle-select-label"
                                                    id='delivery-vehicle-select'
                                                    value={ deliveryVehicle }
                                                    label="Vehicle Type"
                                                    onChange={ (e) => setDeliveryVehicle(e.target.value) }
                                                >
                                                    <MenuItem value={7}>Car</MenuItem>
                                                    <MenuItem value={8}>Motorbike</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <input 
                                                className='border-2 p-2 mt-2 bg-white-100 ml-4'
                                                type="text" 
                                                placeholder="Total Weight (kg)"
                                                onChange={ (e) => setDeliveryWeight(e.target.value)}
                                            />
                                            <input 
                                                className='border-2 p-2 mt-2 bg-white-100 ml-4 mb-2'
                                                type="text" 
                                                placeholder="Insurance Amount"
                                                onChange={ (e) => setDeliveryInsurance(e.target.value)}
                                            />
                                        </div>
                                        : 
                                        ''
                                    }
                                    <div className='p-3 grid grid-cols-3 gap-10 items-center justify-center'>
                                        <div className='flex flex-cols gap-2 items-center'>
                                            <img className='rounded' src={ transportifyImg } alt="Transportify Icon" /><p className='text-lg font-semibold'>Transportify</p>
                                            <FormControlLabel control={<Radio value="transportify" onChange={(e) => setDeliveryChannel(e.target.value)} style={{color: "#51BB5E"}} />} />
                                        </div>
                                    </div>
                                    { deliveryChannel === 'transportify' ? 
                                        <div className='ml-2 items-center'>
                                            <FormControl sx={{ m: 2, minWidth: 150 }} size="small">
                                                <InputLabel id="delivery-type-select-label">Delivery Type</InputLabel>
                                                <Select
                                                    labelId="delivery-type-select-label"
                                                    id='delivery-type-select'
                                                    value={ deliveryType }
                                                    label="Delivery Type"
                                                    onChange={ (e) => setDeliveryType(e.target.value) }
                                                >
                                                    <MenuItem value='standard'>Standard</MenuItem>
                                                    <MenuItem value='same_day'>Same Day</MenuItem>
                                                    <MenuItem value='hyperlocal'>Hyperlocal</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <FormControl sx={{ m: 2, minWidth: 150 }} size="small">
                                                <InputLabel id="delivery-vehicle-select-label">Vehicle Type</InputLabel>
                                                <Select
                                                    labelId="delivery-vehicle-select-label"
                                                    id='delivery-vehicle-select'
                                                    value={ deliveryVehicle }
                                                    label="Vehicle Type"
                                                    onChange={ (e) => setDeliveryVehicle(e.target.value) }
                                                >
                                                    <MenuItem value={7}>Car</MenuItem>
                                                    <MenuItem value={8}>Motorbike</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <input 
                                                className='border-2 p-2 mt-2 bg-white-100 ml-4'
                                                type="text" 
                                                placeholder="Total Weight (kg)"
                                                onChange={ (e) => setDeliveryWeight(e.target.value)}
                                            />
                                            <input 
                                                className='border-2 p-2 mt-2 bg-white-100 ml-4 mb-2'
                                                type="text" 
                                                placeholder="Insurance Amount"
                                                onChange={ (e) => setDeliveryInsurance(e.target.value)}
                                            />
                                        </div>
                                        : 
                                        ''
                                    }
                                    <div className='p-3 grid grid-cols-3 gap-10 items-center justify-center'>
                                        <div className='flex flex-cols gap-2 items-center'>
                                            <img className='rounded' src={ ninjaVanImg } alt="Ninjavan Icon" /><p className='text-lg font-semibold'>Ninjavan</p>
                                            <FormControlLabel control={<Radio value="ninjavan" onChange={(e) => setDeliveryChannel(e.target.value)} style={{color: "#B22222"}} />} />
                                        </div>
                                    </div>
                                    { deliveryChannel === 'ninjavan' ? 
                                        <div className='ml-2 items-center'>
                                            <FormControl sx={{ m: 2, minWidth: 150 }} size="small">
                                                <InputLabel id="delivery-type-select-label">Delivery Type</InputLabel>
                                                <Select
                                                    labelId="delivery-type-select-label"
                                                    id='delivery-type-select'
                                                    value={ deliveryType }
                                                    label="Delivery Type"
                                                    onChange={ (e) => setDeliveryType(e.target.value) }
                                                >
                                                    <MenuItem value='standard'>Standard</MenuItem>
                                                    <MenuItem value='same_day'>Same Day</MenuItem>
                                                    <MenuItem value='hyperlocal'>Hyperlocal</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <FormControl sx={{ m: 2, minWidth: 150 }} size="small">
                                                <InputLabel id="delivery-vehicle-select-label">Vehicle Type</InputLabel>
                                                <Select
                                                    labelId="delivery-vehicle-select-label"
                                                    id='delivery-vehicle-select'
                                                    value={ deliveryVehicle }
                                                    label="Vehicle Type"
                                                    onChange={ (e) => setDeliveryVehicle(e.target.value) }
                                                >
                                                    <MenuItem value={7}>Car</MenuItem>
                                                    <MenuItem value={8}>Motorbike</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <input 
                                                className='border-2 p-2 mt-2 bg-white-100 ml-4'
                                                type="text" 
                                                placeholder="Total Weight (kg)"
                                                onChange={ (e) => setDeliveryWeight(e.target.value)}
                                            />
                                            <input 
                                                className='border-2 p-2 mt-2 bg-white-100 ml-4 mb-2'
                                                type="text" 
                                                placeholder="Insurance Amount"
                                                onChange={ (e) => setDeliveryInsurance(e.target.value)}
                                            />
                                        </div>
                                        : 
                                        ''
                                    }
                                </RadioGroup>
                            </div>
                        </div>
                    </ModalMySales>

                    <ModalMyOrderReceipt  show={ showOrderRpt } item={ item } details={ details } userImg1={ userImg1 } userImg2={ userImg2 } userImg3={ userImg3 } onClose={ closeModalOrderRpt }>
                        <h2 className="text-lg font-bold">Upload Order Receipt</h2>
                            <div className='flex justify-center pt-2'>
                                <div className='flex flex-wrap justify-center'>
                                    <div className='p-6 flex items-center justify-between'>
                                        <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setUserImg1(e.target.files[0]) } />
                                    </div>
                                    <div className='p-6 flex items-center justify-between'>
                                        <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setUserImg2(e.target.files[0]) } />
                                    </div>
                                    <div className='p-6 flex items-center justify-between'>
                                        <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setUserImg3(e.target.files[0]) } />
                                    </div>
                                </div>
                            </div>

                             {/* <div className='flex justify-end text-white mt-4'>
                                <button onClick={ () => handleFileSave() } className='bg-orange-500 hover:bg-red-700 py-2 px-4 rounded'>Submit Receipt</button>
                            </div> */}
                    </ModalMyOrderReceipt>
                    <div className='mb-20'/>
                </div>
            </div>

            <ToastContainer
                position='bottom-center'
                autoClose={ 1000 }
                hideProgressBar={ true }
                newestOnTop={ false }
                closeOnClick
                rtl={ false }
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme='colored'
            />

            < NavbarMobile /> 
        </>
    )
}

export default MySales
