import Cookies from 'universal-cookie'
import axios from 'axios'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AiFillStar } from 'react-icons/ai'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { TiHeartOutline, TiHeartFullOutline } from 'react-icons/ti'
import { TbCurrencyPeso } from 'react-icons/tb'
import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import epa_coin from '../../assets/epa-coin.gif'

// NOTE: Add URL lock for this page
const StorePage = () => {

    const navigate = useNavigate()
    const cookies = new Cookies()
    const isAuth = cookies.get('token')
    const [ user ] = useState(cookies.get('user'))
    const { state } = useLocation()
    const [ store, setStore ] = useState('')
    const [ storeOwner, setStoreOwner ] = useState('')
    const [ products, setProducts ] = useState([])
    const [ services, setServices ] = useState([])
    const [ isFavorite, setIsFavorite ] = useState(isAuth && state.favorites.includes(user.id))

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (state && state.owner) {
            axios.get(`/api/store/${ state.owner }`, {
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
    }, [ state ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (state && state.owner) {
            axios.get(`/api/user/${ state.owner }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setStoreOwner(res.data.user)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ state ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        const storeProducts = []

        if (store && store.owner) {
            axios.get(`/api/product`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                res.data.products.forEach(item => {
                    if (store.owner.includes(item.owner))
                        storeProducts.push(item)
                })
                setProducts(storeProducts)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ store ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        const storeServices = []

        if (store && store.owner) {
            axios.get(`/api/service`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                res.data.services.forEach(item => {
                    if (store.owner.includes(item.owner))
                        storeServices.push(item)
                })
                setServices(storeServices)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ store ])

    const goBack = () => {
        navigate(-1)
    }

    const redirectLogin = () => {
        toast.error('You need to login first!')
        toast.info('Redirecting to Login page...')
        setTimeout(() => {
            navigate('/login')
        }, 2000)
    }

    const addFavorites = async(e) => {
        e.preventDefault()

        setIsFavorite(!isFavorite)
        
        const favorite = !isFavorite

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('storeId', state._id)
        formData.append('favorite', favorite)

        await axios.put(`/api/store/setfavorites/${ user.id }`, formData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.message)
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
            <div className='lg:hidden font-montserrat'>
                <div className='font-montserrat lg:hidden fixed top-0 right-0 left-0 inset-x-0'>
                    <div className='px-6 mt-10'>
                        <FaArrowAltCircleLeft onClick={ () => goBack() } className='text-4xl'/>
                    </div>
                </div>

                <br />

                <div className='mt-10 flex justify-center'>
                    <div className={ `h-30 ${ innerWidth >=400 ? 'w-[178px]' : 'w-[152px]' } rounded-lg` }>
                        <img className='object-contain' src={ window.location.origin + '/public/stores/' + store.image } />
                    </div>
                </div>

                { user && store && store.owner === user.id ?
                    '' :
                    <div className='flex justify-center p-1'>
                        <button onClick={ isAuth ? (e) => addFavorites(e) : () => redirectLogin() }>
                            { isFavorite ? 
                                <TiHeartFullOutline className='text-3xl fill-red-500'/>
                                : 
                                <TiHeartOutline className='text-3xl fill-red-500'/>
                            }
                        </button>
                        <div className='py-2 font-semibold text-center'><span className='font-semibold text-black-600 px-1'>Favorite Store</span></div>
                    </div>
                }

                <div className='px-6 bg-gradient-to-r from-emerald-500 to-lime-500 pt-3 pb-3'>
                    <p className='text-4xl text-orange-600 font-bold text-center'>{ store.name }</p>
                    <p className='mt-2 text-sm text-white font-semibold text-justify'>{ store.description }</p>
                </div>

                <div className="bg-white pb-3" />

                <div className='px-6 bg-gray-200 pt-3 pb-3'>
                    <p className='text-sm font-semibold'><span className='font-semibold text-purple-600'>{ storeOwner.name }</span></p>
                    <p className='text-sm font-semibold'><span className='font-semibold text-emerald-600'>{ storeOwner.email }</span></p>
                    <p className='text-sm font-semibold'><span className='font-semibold'>{ store.address }</span></p>
                    <p className='text-sm font-semibold'><span className='font-semibold'>{ store.city } { store.province }</span></p>
                    <p className='text-sm font-semibold'><span className='font-semibold'>{ store.zipcode } { store.country }</span></p>
                    <p className='text-sm font-semibold'><span className='font-semibold text-red-600'>{ store.contactnumber }</span></p>
                    <div className='px-10 pt-2 justify-center text-center text-white'>
                        <NavLink to='/chat' state={ state }>
                            <button className="inline-flex h-7 w-18 px-2 py-1 text-sm text-indigo-100 transition-colors duration-150 bg-blue-500 rounded-full focus:shadow-outline hover:bg-red-800">
                                <div className='font-semibold text-white'>Send Message</div>
                            </button>
                        </NavLink>
                    </div>
                </div>

                <br />

                { products ? 
                    <div className='flex flex-wrap gap-2 justify-center mb-4'>
                    { products.map(item => (
                        <div className="flex flex-2 items-end" key={ item._id }>
                            <NavLink to={ "/product" } state={ item }>
                                <div className={ `border h-30 ${ innerWidth >=400 ? 'w-[178px]' : 'w-[152px]' } rounded-xl` }>
                                    <div className='items-center'>
                                        <img className='object-contain mb-2' src={ window.location.origin + '/public/products/' + item.image } />
                                    </div>
                                    <div className='text-xs ml-2'>
                                        <div className='text-bold text-md'>{ item.name }</div>
                                        <div className='flex items-center text-xl text-red-500'>
                                            <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                                            <div className='text-black-800'>{ item.price }</div>
                                        </div>
                                        <div className='flex gap-1'>
                                            <AiFillStar className='text-yellow-500 text-xl'/>
                                            <p>4.5 / 5</p>
                                        </div>
                                    </div>
                                </div>
                            </NavLink>
                        </div>
                    )) }
                    </div> 
                    :
                    ''
                }

                { services ? 
                    <div className='flex flex-wrap gap-2 justify-center mb-4'>
                    { services.map(item => (
                        <div className="flex flex-2 items-end" key={ item._id }>
                            <NavLink to={ "/service" } state={ item }>
                                <div className={ `border h-30 ${ innerWidth >=400 ? 'w-[178px]' : 'w-[152px]' } rounded-xl` }>
                                    <div className='items-center'>
                                        <img className='object-contain mb-2' src={ window.location.origin + '/public/services/' + item.image } />
                                    </div>
                                    <div className='text-xs ml-2'>
                                        <div className='text-bold text-md'>{ item.name }</div>
                                        <div className='flex items-center text-xl text-red-500'>
                                            <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                                            <div className='text-black-800'>{ item.price }</div>
                                        </div>
                                        <div className='flex gap-1'>
                                            <AiFillStar className='text-yellow-500 text-xl'/>
                                            <p>4.5 / 5</p>
                                        </div>
                                    </div>
                                </div>
                            </NavLink>
                        </div>
                    )) }
                    </div> 
                    :
                    ''
                }

            </div>
            
            <div className='mb-10'/>

            <ToastContainer
                position="bottom-center"
                autoClose={2000}
                hideProgressBar={true}
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

export default StorePage
