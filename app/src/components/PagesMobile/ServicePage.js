import Cookies from 'universal-cookie'
import axios from 'axios'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Rating, Stack, Switch, FormGroup, FormControlLabel } from '@mui/material'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { TiHeartOutline, TiHeartFullOutline } from 'react-icons/ti'
import { TbCurrencyPeso } from 'react-icons/tb'
import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import epa_coin from '../../assets/epa-coin.gif'


// NOTE: Add URL lock for this page
const ServicePage = () => {

    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const isAuth = cookies.get('token')
    const { state } = useLocation()
    const [ store, setStore ] = useState('')
    const [ ratings ] = useState(isAuth && state.ratings.length && state.ratings.find(item => item.id.includes(user.id)) ? state.ratings.find(item => item.id.includes(user.id)).ratings : '0.0')
    const [ selfRating, setSelfRating ] = useState(isAuth && state.ratings.length && state.ratings.find(item => item.id.includes(user.id)) ? state.ratings.find(item => item.id.includes(user.id)).ratings : '0.0')
    // const [ isFavorite, setIsFavorite ] = useState(isAuth && state.favorites.includes(user.id))
    const [ isFavorite, setIsFavorite ] = useState(isAuth && state.favorites.find(item => item.id.includes(user.id)))
    const [ checked, setChecked ] = useState(true)
    const [ highToken, setHighToken ] = useState('')
    const [ lowToken, setLowToken ] = useState('')

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (state) {
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
    }, [ state ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (state && state.owner) {
            axios.get(`/api/store`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                res.data.stores.forEach(item => {
                    if (item.owner.includes(state.owner))
                        setStore(item)
                })
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ state ])

    // let stars = [], count = 0, sum

    // if (state.ratings.length) {
    //     state.ratings.forEach(item => {
    //         stars.push(parseFloat(item.ratings).toFixed(1))
    //     })
    // }
    
    // sum = stars.reduce(function (sum, item, index) {
    //     count += item
    //     return sum + item * (index + 1)
    // }, 0)

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

    const addRatings = async (e) => {
        setSelfRating(parseFloat(e.target.value).toFixed(1))

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('serviceId', state._id)
        formData.append('ratings', parseFloat(e.target.value).toFixed(1))

        await axios.put(`/api/service/setratings/${ user.id }`, formData, {
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

    const addFavorites = async(e) => {
        e.preventDefault()

        setIsFavorite(!isFavorite)

        const favorite = !isFavorite

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('serviceId', state._id)
        formData.append('favorite', favorite)
        formData.append('token', checked ? 'high' : 'low')

        await axios.put(`/api/service/setfavorites/${ user.id }`, formData, {
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

    const addToCart = async(e) => {
        e.preventDefault()

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/user/addtocart/${ user.id }`, { 'itemId': state._id, 'token': checked ? 'high' : 'low' }, {
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

    const toggleSwitch = (e) => {
        setChecked(e.target.checked)
    }

    const singleItem = state
    singleItem.token = checked ? 'high' : 'low'

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
                        <img className='scale-75'src={ window.location.origin + '/public/services/' + state.image } />
                    </div>
                </div>

                {/* <div className='flex justify-end p-1'>
                    <FormGroup>
                        <FormControlLabel label={ checked ? 'High' : 'Low' } control={ <Switch checked={ checked } onChange={ toggleSwitch } inputProps={{ 'aria-label': 'controlled' }} /> } />
                    </FormGroup>
                </div> */}

                <div className='px-6 pt-2 flex flex-cols gap-4 justify-end font-semibold text-sm'>
                    <p>Token you get:</p>
                    <p className='text-blue-500'>{ String(parseFloat(( state.price * highToken + state.price ) * 10).toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                    { state.bonusToken && state.bonusToken.$numberDecimal !== '0' &&
                        <p className='text-amber-500'>+ { String(parseFloat(state.bonusToken.$numberDecimal * 10)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } Bonus</p>
                    }
                </div>

                <div className='px-6'>
                    <div className='flex justify-between'>
                        <h2 className='font-bold text-2xl'>{ state.name }</h2>
                        <div className={ `flex items-center ${ checked ? 'text-red-500' : 'text-emerald-500' } ` } >
                            <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                            <h2 className='font-semibold text-2xl'>{ String(parseFloat(state.price * (checked ? highToken : lowToken) + Number(state.price)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</h2>
                        </div>
                    </div>

                    <div className='-mt-2 flex justify-end text-red-500 text-sm'>{ state.rate }</div>

                    <div className='flex justify-between gap-2 mb-4'>
                        <div className='flex gap-2'>
                            { user && state.owner === user.id ?
                                // <h2 className='py-0.5'>{ state.ratings.length ? (sum/count).toFixed(1) : parseFloat(0).toFixed(1) }</h2>
                                ''
                                :
                                <h2 className='py-0.5'>{ state.ratings.length ? parseFloat(selfRating).toFixed(1) : parseFloat(0).toFixed(1) }</h2>
                            }
                            <Stack spacing={ 1 }>
                                { user && state.owner === user.id ? 
                                    // <Rating name="service-rating" defaultValue={ parseFloat((sum/count).toFixed(1)) } precision={ 0.5 } readOnly/>
                                    ''
                                    : 
                                    <Rating name="service-rating" defaultValue={ state.ratings.length ? parseFloat(ratings) : parseFloat(0) } precision={ 0.5 } onChange={ isAuth ? (e) => addRatings(e) : () => redirectLogin() } />
                                }
                            </Stack>
                        </div>
                        
                        { user && store && store.owner === user.id ? '' :
                            <button onClick={ isAuth ? (e) => addFavorites(e) : () => redirectLogin() }>
                                { isFavorite ? 
                                    <TiHeartFullOutline className='text-3xl fill-red-500'/>
                                    : 
                                    <TiHeartOutline className='text-3xl fill-red-500'/>
                                }
                            </button>
                        }

                    </div>

                    { store ? 
                        <div className='flex items-center gap-2 pb-4'> 
                            <div className='flex flex-cols font-bold font-montserrat'>
                                { store.owner === process.env.EPA_ACCT_ID ? 
                                    <div className="flex flex-cols gap-2">
                                        <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + store.image } />
                                        <div className="text-lime-500 text-center text-xl font-bold">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                                        <NavLink to={ isAuth ? '/store' : '/login' } state={ store }>
                                            <button className="inline-flex mr-8 h-7 w-18 px-2 py-1 text-sm text-indigo-100 transition-colors duration-150 bg-blue-500 rounded-full focus:shadow-outline hover:bg-red-800">
                                                <div className='font-semibold text-white'>Visit Store</div>
                                            </button>
                                        </NavLink>
                                    </div>
                                    : 
                                    <div className="flex flex-cols gap-2">
                                        <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + store.image } />
                                        <div>{ store.name }</div>
                                        <NavLink to={ isAuth ? '/store' : '/login' } state={ store }>
                                            <button className="inline-flex mr-8 h-7 w-18 px-2 py-1 text-sm text-indigo-100 transition-colors duration-150 bg-blue-500 rounded-full focus:shadow-outline hover:bg-red-800">
                                                <div className='font-semibold text-white'>Visit Store</div>
                                            </button>
                                        </NavLink>
                                    </div>
                                }
                            </div>   
                        </div>
                        : ''
                    }

                    <hr />

                    {/* <div className='flex justify-between mt-6'>
                        <div>
                            <p className='text-gray-500'>Available Colors</p>
                            <div className='flex items-center gap-8 mt-3'>
                                <input type="radio" />
                                <input type="radio" />
                                <input type="radio" />
                            </div>
                        </div>
                        <div>
                            <p className='text-gray-500'>Size</p>
                            <div className='flex items-center gap-8 mt-3'>
                                <input type="radio" />
                                <input type="radio" />
                                <input type="radio" />
                            </div>
                        </div>
                    </div> */}

                    <div className='mt-4 mb-20'>
                        <h1 className='font-semibold mb-4 text-gray-500'>Description</h1>
                        <p className='text-justify'>{ state.description }</p>
                    </div>

                </div>
            
                { user && store && store.owner === user.id ? '' :
                    <div className="fixed bottom-0 left-0 right-0 p-4 text-white text-center">
                        <div className="flex gap-6 justify-center items-center">
                            <NavLink to={ isAuth ? '/order' : '/login' } state={ singleItem }>
                                <button className={ `${ state.isReceived ? 'bg-amber-400' : 'bg-orange-400' } lg:hidden sticky top-0 z-40 font-semibold py-2 px-4 rounded-lg shadow-md` }>
                                    { state.isReceived ? 'Buy Again' : 'Buy Now' }
                                </button>
                            </NavLink>
                            <button
                                onClick={ isAuth ? (e) => addToCart(e) : () => redirectLogin() }
                                className='lg:hidden sticky top-0 z-40 bg-emerald-400 font-semibold py-2 px-4 rounded-lg shadow-md'>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                }
            </div>

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

export default ServicePage
