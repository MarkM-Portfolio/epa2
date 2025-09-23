import Cookies from 'universal-cookie'
import axios from 'axios'
import ModalVerification from '../../components/ModalVerification'
import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { FaBoxesPacking } from 'react-icons/fa6'
import { BiEdit } from 'react-icons/bi'
import { TiTimes } from 'react-icons/ti'
// import { TbCurrencyPeso } from 'react-icons/tb'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import epa_coin from '../../assets/epa-coin.gif'

const Order = () => {
    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ currentPayMode, setCurrentPayMode ] = useState('')
    const [ shippingAddress, setShippingAddress ] = useState([])
    const { state } = useLocation()
    const [ stores, setStores ] = useState([])
    const [ products, setProducts ] = useState([])
    const [ services, setServices ] = useState([])
    // const [ allowLoan, setAllowLoan ] = useState(false)
    const [ totalFees, setTotalFees ] = useState('')
    const [ totalExtra, setTotalExtra ] = useState('')
    const [ totalPrice, setTotalPrice ] = useState('')
    const [ highToken, setHighToken ] = useState('')
    const [ lowToken, setLowToken ] = useState('')
    const [ isLoading, setIsLoading ] = useState(false)
    const [ validChildrenCount, setValidChildrenCount ] = useState([])
    const [ show, setShow ] = useState(false)
    const [ event, setEvent ] = useState(false)

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
                setShippingAddress(res.data.user.shippingAddress)
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
            axios.get(`/api/user/teams/${ user.id }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setValidChildrenCount(res.data.count.childrenCount - res.data.count.childrenMember)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
        }
        return () => { source.cancel() }
    }, [ user ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (currentUser && currentUser._id) {
            axios.get(`/api/setting`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setCurrentPayMode(res.data.settings.isAutoPay)
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

        if (currentUser && currentUser._id) {
            axios.get(`/api/store`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setStores(res.data.stores)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ currentUser ])
    

    useEffect(() => {
        const orderProducts = [], orderServices = []
        let itemFees = 0, itemExtra = 0, itemPrice = 0

        if (state && state.length) {
            state.forEach(item => {                
                itemPrice += item.stocks ? (item.token === 'high' ? item.price * highToken + item.price : item.price * lowToken + item.price) * item.quantity : (item.token === 'high' ? item.price * highToken + item.price : item.price * lowToken + item.price)
                itemFees += parseFloat(item.fees.$numberDecimal)
                itemExtra += parseFloat(item.extra.$numberDecimal)
                if (item.stocks) orderProducts.push(item)
                else orderServices.push(item)
            })
        }

        // Single Item (BUY)
        if (state && !state.length) {
            itemPrice = state.stocks ? (state.token === 'high' ? state.price * highToken + state.price : state.price * lowToken + state.price) * state.quantity : (state.token === 'high' ? state.price * highToken + state.price : state.price * lowToken + state.price)
            itemFees += parseFloat(state.fees.$numberDecimal)
            itemExtra += parseFloat(state.extra.$numberDecimal)
            if (state.stocks) orderProducts.push(state)
            else orderServices.push(state)
        }

        setTotalFees(itemFees)
        setTotalExtra(itemExtra)
        setTotalPrice(itemPrice)
        setProducts(orderProducts)
        setServices(orderServices)
    }, [ highToken, lowToken ])

    const goBack = () => {
        navigate(-1)
    }

    const openModal = () => {
        setShow(true)
    }
 
    const closeModal = (e) => {
        setShow(false)
        if (e === 'yes') {
            placeOrders()
        }
    }

    const placeOrders = async (e) => {
        if (event) {
            e.preventDefault()
            e.currentTarget.disabled = true
        }

        if (shippingAddress.address && shippingAddress.city && shippingAddress.province && shippingAddress.zipcode && shippingAddress.country) {
            setIsLoading(true)

            const CancelToken = axios.CancelToken
            const source = CancelToken.source()
    
            const formData = new FormData()
            formData.append('products', JSON.stringify(products))
            formData.append('services', JSON.stringify(services))
            formData.append('price', totalPrice + totalFees + totalExtra)
            formData.append('validChildrenCount', validChildrenCount)
    
            await axios.post(`/api/order/setorder/${ user.id }`, formData, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json; charset=utf-8',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                toast.success(res.data.message)
                if (!currentPayMode) payEpaCredits(res.data.order)
                else payNow(res.data.order)
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
            }).finally(() => {
                setIsLoading(false)
            })
        } else {
            toast.error('Shipping Address not complete.')
        }
    }

    const payEpaCredits = async (orderData) => {
        setIsLoading(true)

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        
        const formData = new FormData()
        formData.append('order_id', orderData._id)
        formData.append('order_details', orderData.details)
        formData.append('name', orderData.name)
        formData.append('email', orderData.email)
        formData.append('phone', orderData.mobilenum)
        formData.append('address', orderData.shippingAddress)
        formData.append('amount', orderData.price)
        formData.append('currency', 'PHP')

        await axios.post(`/api/payment/pay-epacredits/${ user.id }`, formData, {    
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.success(res.data.message)
            notifySeller(orderData._id)
            return res
        }).catch((err) => {
            if (axios.isCancel(err)) {
                console.log('Successfully Aborted')
                toast.error(err.response.data.error)
            } else if (err.response.status === 422) { // response >> validation errors
                console.log('Validation Error: ', err.response.status)
                toast.error(err.response.data.error)
                setTimeout(() => {
                    window.location.href = '/epacredit'
                }, 2000)
            } else if (err.response.status === 403) { // response >> headers forbidden
                console.log('Forbidden: ', err.response.status)
                toast.error(err.response.data.error)
            } else { // response >> server/page not found 404,500
                console.log('Server Error: ', err.response.status)
                toast.error(err.response.data.error)
            }
            return err
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const payNow = async (orderData) => {
        setIsLoading(true)
        
        // const paymentMethod = [ "paynow_online", "card", "wechat", "alipay" ]
        // const paymentMethod2 = [ "upay_bayd", "upay_ecpy", "upay_gcash", "upay_instapay", "upay_online", "upay_pchc", "upay_plwn" ]
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        
        const formData = new FormData()
        formData.append('order_id', orderData._id)
        formData.append('order_details', orderData.details)
        formData.append('name', orderData.name)
        formData.append('email', orderData.email)
        formData.append('phone', orderData.mobilenum)
        // formData.append('address', orderData.shippingAddress)
        formData.append('amount', orderData.price)
        formData.append('currency', 'PHP')
        formData.append('reference_number', 'ABCD1234')
        // formData.append('payment_methods', [])
        // formData.append('line_items', )
        formData.append('send_sms', true)
        formData.append('send_email', true)
        formData.append('allow_repeated_payments', false)
        // formData.append('expiry_date', '2021-02-02 01:01:01')
        formData.append('redirect_url', `${ process.env.NODE_ENV === 'production' ? 'https://' : 'http://' }${ window.location.host }/myorders`)
        formData.append('webhook', process.env.NODE_ENV === 'production' ? `https://${ process.env.DOMAIN }/api/payment/${ process.env.HITPAY_WEBHOOK }` : `${ process.env.EPA_LOCAL_TUNNEL }/api/payment/${ process.env.HITPAY_MOCK_WEBHOOK }`)

        await axios.post('/api/payment/pay-now', formData, {    
            headers: {
                'X-Business-Api-Key' : process.env.NODE_ENV === 'production' ? process.env.HITPAY_API_KEY : process.env.HITPAY_MOCK_API_KEY,
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info('Redirecting to Payments page...')
            console.log('Sucess Data: ', res.data)
            setTimeout(() => {
                window.location.href = res.data.url
            }, 2000)
            return res
        }).catch((err) => {
            console.log('Error Data: ', err)
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
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const notifySeller = async (orderId) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.post(`/api/notification`, { 'id': orderId }, {    
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            console.log('Sucess Data: ', res.data)
            setTimeout(() => {
                window.location.href = '/myorders'
            }, 2000)
            return res
        }).catch((err) => {
            console.log('Error Data: ', err)
            if (axios.isCancel(err)) {
                console.log('Successfully Aborted')
                toast.error(err.response.data.error)
            } else if (err.response.status === 422) {
                console.log('Validation Error: ', err.response.status)
                toast.error(err.response.data.error)
            } else if (err.response.status === 403) {
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
            { isLoading && ((
                <div className="fixed top-0 left-0 w-full h-full bg-gray-300 opacity-50 z-50 flex justify-center items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                        <rect width={10} height={10} x={1} y={1} fill="#FF441F" rx={1}>
                            <animate id="svgSpinnersBlocksShuffle30" fill="freeze" attributeName="x" begin="0;svgSpinnersBlocksShuffle3b.end" dur="0.2s" values="1;13"></animate>
                            <animate id="svgSpinnersBlocksShuffle31" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle38.end" dur="0.2s" values="1;13"></animate>
                            <animate id="svgSpinnersBlocksShuffle32" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle39.end" dur="0.2s" values="13;1"></animate>
                            <animate id="svgSpinnersBlocksShuffle33" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle3a.end" dur="0.2s" values="13;1"></animate>
                        </rect>
                        <rect width={10} height={10} x={1} y={13} fill="#0D8CFF" rx={1}>
                            <animate id="svgSpinnersBlocksShuffle34" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle30.end" dur="0.2s" values="13;1"></animate>
                            <animate id="svgSpinnersBlocksShuffle35" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle31.end" dur="0.2s" values="1;13"></animate>
                            <animate id="svgSpinnersBlocksShuffle36" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle32.end" dur="0.2s" values="1;13"></animate>
                            <animate id="svgSpinnersBlocksShuffle37" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle33.end" dur="0.2s" values="13;1"></animate>
                        </rect><rect width={10} height={10} x={13} y={13} fill="#10A555" rx={1}>
                            <animate id="svgSpinnersBlocksShuffle38" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle34.end" dur="0.2s" values="13;1"></animate>
                            <animate id="svgSpinnersBlocksShuffle39" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle35.end" dur="0.2s" values="13;1"></animate>
                            <animate id="svgSpinnersBlocksShuffle3a" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle36.end" dur="0.2s" values="1;13"></animate>
                            <animate id="svgSpinnersBlocksShuffle3b" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle37.end" dur="0.2s" values="1;13"></animate>
                        </rect>
                    </svg>
                </div>
            )) }

            <div className='lg:hidden font-montserrat px-6 '>
                <div className='px-6 mt-10'>
                    <div className='flex items-center gap-2'> 
                        <div className='grid grid-cols-2 font-bold font-montserrat'>
                            <FaArrowAltCircleLeft onClick={ () => goBack() } className='text-4xl'/>
                        </div>   
                    </div>
                    </div>
                    <div className='flex justify-center gap-2 text-3xl -mt-7'>
                        <FaBoxesPacking className='fill-orange-500' />
                    <h1 className='text-2xl text-center font-semibold mb-10 pl-1'>Orders</h1>
                </div>
                <hr />

                <div className='mt-6 font-montserrat mb-6'>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='font-semibold'>MY INFO</h2>
                        <NavLink to="/shipping-address">
                            <BiEdit />
                        </NavLink>
                    </div>
                    <h2 className='font-semibold'>{ currentUser.name }</h2>
                    <p className='text-gray-500'>{ currentUser.email }</p>
                    <p className='text-gray-500'>{ currentUser.mobilenum }</p>
                    { shippingAddress.address && shippingAddress.city && shippingAddress.province && shippingAddress.zipcode && shippingAddress.country ? 
                        <div>
                            <p className='text-red-500'>{ shippingAddress.address }</p>
                            <p className='text-red-500'>{ shippingAddress.city } { shippingAddress.province }</p>
                            <p className='text-red-500'>{ shippingAddress.zipcode } { shippingAddress.country }</p>
                        </div>
                        :
                        <div>
                            <p className='text-red-500'>Shipping Address is incomplete</p>
                        </div>
                    }

                </div>

            </div>

            <div className="bg-gray-200 pb-3" />
                
                <div className='mt-4 mb-28 px-6 font-montserrat'>
                    <h2 className='font-semibold'>Items</h2>
                    { state.length ? 
                        state.map(item => (
                            <div className="mt-4" key={ item._id }>     
                                { stores && stores.map(storeItem => (
                                    <div key={ storeItem._id }>
                                        { storeItem.owner === item.owner ? 
                                            <div className='grid grid-rows gap-2 mb-2'>
                                                { item.owner === process.env.EPA_ACCT_ID ? 
                                                    <div className="flex flex-cols gap-2 font-bold">
                                                        <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                        <div className="text-lime-500 text-center text-xl">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                                                    </div>
                                                    : 
                                                    <div className="flex flex-cols gap-2 font-bold">
                                                        <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                        <div>{ storeItem.name }</div>
                                                    </div>
                                                }
                                                <div className="border h-28 w-full rounded-xl">
                                                    <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                                                        <img className="object-contain h-28 w-2/5 rounded-l-lg" src={ window.location.origin + '/public' + `${ item.stocks ? '/products/' : '/services/' }` + item.image } />
                                                        <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                                                            <h1 className='font-semibold'>{ item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name }</h1>
                                                            <h1 className='mt-1 text-sm'>{ item.description.length > 23 ? item.description.substring(0, 23) + "..." : item.description }</h1>
                                                            { item.stocks > 0 && <h1 className='mt-3 -mb-8 pl-3 text-white text-sm font-semibold bg-orange-400 w-20 rounded-t-lg'>Qty: { item.quantity }</h1> }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-xs text-black flex gap-1 items-center italic justify-end">Charge for Extra<img src={ epa_coin } className='epacoin-store' alt="epacoin" /><h1>{ String(parseFloat(item.extra.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</h1></div>
                                                <div className="text-xs text-black flex gap-1 items-center italic justify-end">Delivery Fee<img src={ epa_coin } className='epacoin-store' alt="epacoin" /><h1>{ String(parseFloat(item.fees.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</h1></div>
                                                <div className="text-xs text-black flex gap-1 items-center italic justify-end">Price<img src={ epa_coin } className='epacoin-store' alt="epacoin" /><h1>{ String(((parseFloat(item.price) * (item.token === 'high' ? highToken : lowToken) + parseFloat(item.price))).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</h1></div>
                                                { item.stocks > 0 && <div className="text-xs text-black flex gap-1 items-center italic justify-end">Quantity<TiTimes color='red' /><h1>{ item.quantity }</h1></div> }
                                                <div className="text-red-500 flex items-center italic font-semibold justify-end"><img src={ epa_coin } className='epacoin-store' alt="epacoin" /><h1 className='text-red-500'>{ item.stocks ? String(((parseFloat(item.price) * (item.token === 'high' ? highToken : lowToken) + parseFloat(item.price)) * item.quantity + parseFloat(item.fees.$numberDecimal) + parseFloat(item.extra.$numberDecimal)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : String(parseFloat(item.price * (item.token === 'high' ? highToken : lowToken) + item.price + parseFloat(item.fees.$numberDecimal) + parseFloat(item.extra.$numberDecimal)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</h1></div>
                                            </div>
                                            :
                                            ''
                                        }                                                      
                                    </div>
                                )) }

                                <div className="bg-gray-200 -mx-6 pb-3 mt-3" />
                            </div>
                        ))
                        :
                        <div className="mt-4">   
                            { stores && stores.map(storeItem => (
                                <div key={ storeItem._id }>
                                    { storeItem.owner === state.owner ? 
                                        <div className='grid grid-rows gap-2 mb-2'>
                                            { state.owner === process.env.EPA_ACCT_ID ? 
                                                <div className="flex flex-cols gap-2 font-bold">
                                                    <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                    <div className="text-lime-500 text-center text-xl">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                                                </div>
                                                : 
                                                <div className="flex flex-cols gap-2 font-bold">
                                                    <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                    <div>{ storeItem.name }</div>
                                                </div>
                                            }
                                            <div className="border h-28 w-full rounded-xl">
                                                <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                                                    <img className="object-contain h-28 w-2/5 rounded-l-lg" src={ window.location.origin + '/public' + `${ state.stocks ? '/products/' : '/services/' }` + state.image } />
                                                    <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                                                        <h1 className='font-semibold'>{ state.name.length > 20 ? state.name.substring(0, 20) + "..." : state.name }</h1>
                                                        <h1 className='mt-1 text-sm'>{ state.description.length > 23 ? state.description.substring(0, 23) + "..." : state.description }</h1>
                                                        { state.stocks > 0 && <h1 className='mt-3 -mb-8 pl-3 text-white text-sm font-semibold bg-orange-400 w-20 rounded-t-lg'>Qty: { state.quantity }</h1> }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-black flex gap-1 items-center italic justify-end">Charge for Extra<img src={ epa_coin } className='epacoin-store' alt="epacoin" /><h1>{ String(parseFloat(state.extra.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</h1></div>
                                            <div className="text-xs text-black flex gap-1 items-center italic justify-end">Delivery Fee<img src={ epa_coin } className='epacoin-store' alt="epacoin" /><h1>{ String(parseFloat(state.fees.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</h1></div>
                                            <div className="text-xs text-black flex gap-1 items-center italic justify-end">Price<img src={ epa_coin } className='epacoin-store' alt="epacoin" /><h1>{ String(((parseFloat(state.price) * (state.token === 'high' ? highToken : lowToken) + parseFloat(state.price))).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</h1></div>
                                            { state.stocks > 0 && <div className="text-xs text-black flex gap-1 items-center italic justify-end">Quantity<TiTimes color='red' /><h1>{ state.quantity }</h1></div> }
                                            <div className="text-red-500 flex items-center italic font-semibold justify-end"><img src={ epa_coin } className='epacoin-store' alt="epacoin" /><h1 className='text-red-500'>{ state.stocks ? String(((parseFloat(state.price) * (state.token === 'high' ? highToken : lowToken) + parseFloat(state.price)) * state.quantity + parseFloat(state.fees.$numberDecimal) + parseFloat(state.extra.$numberDecimal)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : String(parseFloat(state.price * (state.token === 'high' ? highToken : lowToken) + state.price + parseFloat(state.fees.$numberDecimal) + parseFloat(state.extra.$numberDecimal)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</h1></div>
                                        </div>
                                        :
                                        ''
                                    }                                                        
                                </div>
                            )) }
                        </div>
                    }
                </div>

                <hr />

                {/* <div className='mt-4 font-montserrat mb-6'>
                    <h2 className='font-semibold'>Shipping</h2>
                    <div className='border py-16 mt-4 rounded-lg'>
                        items shipping
                    </div>
                </div>

                <hr /> */}

                {/* <div className='mt-4 font-montserrat'>
                    <h2 className='font-semibold'>Payment Method</h2>
                    <div className='border py-16 mb-32 mt-4 rounded-lg'> */}
                        {/* items shipping */}
                    {/* </div> */}
                {/* </div> */}

            <div className='mb-20' />

            <div className='bg-white w-full lg:hidden mt-4 p-4 fixed bottom-0 right-0 left-0 inset-x-0'>
                <div className='flex justify-between mt-2 font-xs italic'>
                    <h2>Sub Total</h2>
                    <div className='flex items-center'>
                        <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                        <p>{ String(parseFloat(totalExtra).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                    </div>
                </div>
                <div className='flex justify-end font-xs italic'>
                    <div className='flex items-center'>
                        <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                        <p>{ String(parseFloat(totalFees).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } / 5 kms</p>
                    </div>
                </div>
                <div className='flex justify-between mt-2 mb-2 font-montserrat font-semibold'>
                    <h2>Total</h2>
                    <div className='flex items-center'>
                        <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                        <p>{ String(parseFloat(totalPrice + totalFees + totalExtra).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                    </div>
                </div>
                { currentUser && currentUser.epacredits && totalPrice && totalFees && totalExtra && parseFloat(currentUser.epacredits.$numberDecimal) < parseFloat(totalPrice + totalFees + totalExtra) ?
                    <button onClick={ (e) => openModal(e) } className='py-4 w-full bg-emerald-400 rounded-lg shadow-md text-white font-semibold font-montserrat'>Place Order ( { state.length ? state.length : 1 } )</button>
                    :
                    <button onClick={ (e) => { placeOrders(e), setEvent(true) } } className='py-4 w-full bg-emerald-400 rounded-lg shadow-md text-white font-semibold font-montserrat'>Place Order ( { state.length ? state.length : 1 } )</button>
                }
            </div>

            <ModalVerification show={ show } onClose={ closeModal }>
                <h2 className="text-lg font-bold mb-4">Insufficient Balance</h2>
                <div>Would you like to take a loan ?</div>
            </ModalVerification>

            <ToastContainer
                position="bottom-center"
                autoClose={3000}
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

export default Order
