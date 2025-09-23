import Cookies from 'universal-cookie'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
//         toast.success('Success Auth!')
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

//     const sender = {
//         address: "Capitol Park Homes, 71 Berlin Avenue, Matandang Balara, Quezon City, Metro Manila",
//         contact_person: {
//             phone: "09195380326"
//         }
//     }

//     const recepient = {
//         address: "Unit 802, EcoTower, 32nd Street corner 9th Avenue, BGC, Taguig, 1634 Metro Manila",
//         is_cod_cash_voucher_required: true,
//         taking_amount: 100,
//         contact_person: {
//             phone: "09195380326"
//         }
//     }

//     const points = []
//     points.push(sender)
//     points.push(recepient)    
    
//     const data = {
//         'matter': 'Documents',
//         'points': points
//     }

//     await axios.post('/api/borzo/borzo-calc-order', data, {
//         headers: {
//             'X-DV-Auth-Token': process.env.NODE_ENV === 'production' ? process.env.BORZO_AUTH_TOKEN : process.env.BORZO_MOCK_AUTH_TOKEN,
//             'Content-Type': 'application/json; charset=utf-8',
//             'Accept': 'application/json; charset=utf-8'
//         },
//         data: { cancelToken: source.token }
//     }).then(res => {
//         console.log('Success OK: ', res.status)
//         console.log('Response Calculate Order: ', res.data)
//         toast.success('Success Calc Order !')
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

    

//     const sender = {
//         // address: "Capitol Park Homes, 71 Berlin Avenue, Matandang Balara, Quezon City, Metro Manila",
//         address: "Capitol Park Homes, 71 Berlin Avenue, Matandang Balara, Quezon City, Metro Manila",    
//         contact_person: {
//             phone: "09195380326"
//         }
//     }

//     const recepient = {
//         address: "Unit 802, EcoTower, 32nd Street corner 9th Avenue, BGC, Taguig, 1634 Metro Manila",
//         is_cod_cash_voucher_required: true,
//         taking_amount: 100,
//         contact_person: {
//             phone: "09195380326"
//         }
//     }

//     const points = []
//     points.push(sender)
//     points.push(recepient)    
    
//     const data = {
//         'matter': 'Documents',
//         'points': points
//     }

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
//         return res
//     }).catch((err) => {
//         toast.error('Error COD !')
//         console.log('Error Resp: ', err)
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

// const borzoMyOrders = async () => {
//     const CancelToken = axios.CancelToken
//     const source = CancelToken.source()

//     await axios.get('/api/borzo/borzo-my-orders', {
//         headers: {
//             'X-DV-Auth-Token': process.env.NODE_ENV === 'production' ? process.env.BORZO_AUTH_TOKEN : process.env.BORZO_MOCK_AUTH_TOKEN,
//             'Content-Type': 'application/json; charset=utf-8',
//             'Accept': 'application/json; charset=utf-8'
//         },
//         data: { cancelToken: source.token }
//     }).then(res => {
//         console.log('Success OK: ', res.status)
//         console.log('Response  My Orders: ', res.data)
//         toast.success('Success My Orders !')
//         return res
//     }).catch((err) => {
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

// const borzoCourierInfo = async () => {
//     const CancelToken = axios.CancelToken
//     const source = CancelToken.source()

//     const orderId = "741825"

//     await axios.get(`/api/borzo/borzo-courier-info?order_id=741825`, {
//         headers: {
//             'X-DV-Auth-Token': process.env.NODE_ENV === 'production' ? process.env.BORZO_AUTH_TOKEN : process.env.BORZO_MOCK_AUTH_TOKEN,
//             'Content-Type': 'application/json; charset=utf-8',
//             'Accept': 'application/json; charset=utf-8'
//         },
//         data: { cancelToken: source.token }
//     }).then(res => {
//         console.log('Success OK: ', res.status)
//         console.log('Response Courier Info: ', res)
//         toast.success('Success Courier Info !')
//         return res
//     }).catch((err) => {
//         toast.error('Error Courier Info !')
//         console.log('Error Courier Info: ', err)
//         if (axios.isCancel(err)) {
//             console.log('Successfully Aborted')
//             toast.error(err.response.data)
//         } else if (err.response.status === 422) { // response >> validation errors
//             console.log('Validation Error: ', err.response.status)
//             toast.error(err.response.data)
//         } else if (err.response.status === 403) { // response >> headers forbidden
//             console.log('Forbidden: ', err.response.status)
//             toast.error(err.response.data)
//         } else { // response >> server/page not found 404,500
//             console.log('Server Error: ', err.response.status)
//             toast.error(err.response.data)
//         }
//         return err
//     })
// }

// const afterShipTracking = async() => {
//     const CancelToken = axios.CancelToken
//     const source = CancelToken.source()

//     await axios.get('/tracking/2023-10/trackings', {
//         headers: {
//             'As-Api-Key': process.env.AFTERSHIP_API_KEY,
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//         },
//         data: { cancelToken: source.token }
//     }).then(res => {
//         console.log('Success OK: ', res.status)
//         console.log('Delivery Response: ', res)
//         // toast.success(res.data.message)
//         // setTimeout(() => {
//         //     window.location.href= '/profile' // redirect to profile page
//         // }, 1000)
//         return res
//     }).catch((err) => {
//         toast.error(err.message)
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

const ShippingAddress = () => {

    const cookies = new Cookies()
    const navigate = useNavigate()
    const [ user ] = useState(cookies.get('user'))
    const [ shippingAddress, setShippingAddress ] = useState([])
    const [ address, setAddress ] = useState('')
    const [ city, setCity ] = useState('')
    const [ province, setProvince ] = useState('')
    const [ zipCode, setZipCode ] = useState('')
    const [ country, setCountry ] = useState('')

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
                setShippingAddress(res.data.user.shippingAddress)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user ])

    const goBack = () => {
        navigate(-1)
    }

    const handleSubmit = async () => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const fmtAddress = address.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').trim().replace(/\s\s+/g, ' ')
        const fmtCity = city.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').trim().replace(/\s\s+/g, ' ')
        const fmtProvince = province.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').trim().replace(/\s\s+/g, ' ')
        // const fmtCountry = country.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').trim().replace(/\s\s+/g, ' ')

        const formData = new FormData()
        formData.append('address', address ? fmtAddress : shippingAddress.address)
        formData.append('city', city ? fmtCity : shippingAddress.city)
        formData.append('province', province ? fmtProvince : shippingAddress.province)
        formData.append('zipcode', zipCode ? zipCode : shippingAddress.zipcode)
        // formData.append('country', country ? fmtCountry : shippingAddress.country)
        formData.append('country', 'Philippines')

        await axios.put(`/api/user/editshipping/${ user.id }`, formData, {
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
                goBack()
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
            <div className='font-montserrat lg:hidden'>
                <div className='pt-10 px-6 flex items-center justify-between'>
                    <NavLink to="/profile">
                        <FaArrowAltCircleLeft className='text-4xl' />
                    </NavLink>
                    <h1 className='text-lg font-semibold'>Shipping Address</h1>
                    <div></div>
                </div>

                <div className='px-6 mt-12'>
                    <div>
                        <h1 className='pb-2'>Complete Address (Street/House No.)</h1>
                        <input className='border-b w-full'
                            type="text"
                            onChange={ (e) => setAddress(e.target.value) }
                            placeholder={ shippingAddress.address }
                        />
                </div>
                    <div className='pt-4'>
                        <h1 className='pb-2'>City</h1>
                        <input className='border-b w-full' 
                            type="text"
                            onChange={ (e) => setCity(e.target.value) }
                            placeholder={ shippingAddress.city }
                        />
                    </div>
                    <div className='pt-4'>
                        <h1 className='pb-2'>Province</h1>
                        <input className='border-b w-full' 
                            type="text"
                            onChange={ (e) => setProvince(e.target.value) }
                            placeholder={ shippingAddress.province }
                        />
                    </div>
                    <div className='pt-4'>
                        <h1 className='pb-2'>Zip Code</h1>
                        <input className='border-b w-full' 
                            type="tel"
                            maxLength="10" 
                            onChange={ (e) => setZipCode(e.target.value) }
                            placeholder={ shippingAddress.zipcode }
                        />
                    </div>
                    <div className='pt-4'>
                        <h1 className='pb-2'>Country</h1>
                        <input className='border-b w-full' 
                            type="text"
                            // onChange={ (e) => setCountry(e.target.value) }
                            // placeholder={ shippingAddress.country }
                            placeholder="Philippines" 
                            disabled={ true }
                        />
                    </div>
                </div>

                <div className='pt-10 px-6 flex justify-end'>
                    <button onClick={ () => handleSubmit() } className='px-6 py-2 bg-emerald-500 rounded-lg text-white'>Submit</button>
                </div>
                
            </div>

            { /* TEST */ }
            {/* <div className='pt-5 px-6 flex justify-start'>
                <button className='bg-pink-500 font-semibold p-2 justify-center text-white rounded' onClick={ () => borzoAuth() }>Borzo Authentication</button>
            </div>

            <div className='pt-5 px-6 flex justify-start'>
                <button className='bg-violet-500 font-semibold p-2 justify-center text-white rounded' onClick={ () => borzoCalcOrder() }>Borzo Calculate Order</button>
            </div>

            <div className='pt-5 px-6 flex justify-start'>
                <button className='bg-indigo-500 font-semibold p-2 justify-center text-white rounded' onClick={ () => borzoCOD() }>Borzo Cash On Delivery</button>
            </div>

            <div className='pt-5 px-6 flex justify-start'>
                <button className='bg-cyan-700 font-semibold p-2 justify-center text-white rounded' onClick={ () => borzoMyOrders() }>Borzo List My Orders</button>
            </div>

            <div className='pt-5 px-6 flex justify-start'>
                <button className='bg-red-400 font-semibold p-2 justify-center text-white rounded' onClick={ () => borzoCourierInfo() }>Borzo Courier Info & Location</button>
            </div>

            <div className='pt-5 px-6 flex justify-end'>
                <button className='bg-amber-500 font-semibold p-2 justify-center text-white rounded' onClick={ () => afterShipTracking() }>AfterShip Tracking</button>
            </div> */}
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

export default ShippingAddress
