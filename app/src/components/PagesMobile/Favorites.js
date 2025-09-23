import NavbarMobile from '../MobileView/NavbarMobile'
import Cookies from 'universal-cookie'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Checkbox, FormGroup, FormControlLabel } from '@mui/material'
import { AiOutlineGift, AiOutlineHeart } from 'react-icons/ai'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { TbCurrencyPeso } from 'react-icons/tb'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import epa_coin from '../../assets/epa-coin.gif'

const Favorites = () => {

    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ products, setProducts ] = useState([])
    const [ services, setServices ] = useState([])
    const [ checkedItemIds, setCheckedItemIds ] = useState([])
    const [ checked, setChecked ] = useState(false)
    const [ highToken, setHighToken ] = useState('')
    const [ lowToken, setLowToken ] = useState('')

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
        const userProducts = []

        if (currentUser && currentUser._id) {
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
                    item.favorites.forEach(itm => {
                        if (itm.id.includes(currentUser._id)) {
                            item.token = itm.token
                            userProducts.push(item)
                        }
                    })
                })
                setProducts(userProducts)
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
        const userServices = []

        if (currentUser && currentUser._id) {
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
                    item.favorites.forEach(itm => {
                        if (itm.id.includes(currentUser._id)) {
                            item.token = itm.token
                            userServices.push(item)
                        }
                    })
                })
                setServices(userServices)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ currentUser ])

    const addToCart = async(e) => {
        e.preventDefault()

        checkedItemIds.forEach(async(id) => {
            const CancelToken = axios.CancelToken
            const source = CancelToken.source()
    
            await axios.put(`/api/user/addtocart/${ user.id }`, { 'itemId': id }, {
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
        })
       
    }

    const allItems = products.concat(services)

    const handleSelectAllChange = (e) => {
        setChecked(e.target.checked)

        const allItemIds = allItems.map((item) => item._id)
        const isChecked = !checked

        setCheckedItemIds((prevCheckedItemIds) => {
            let selectAll = checkedItemIds.length ? false : true

            if (selectAll)
                return isChecked ? prevCheckedItemIds.length == [] ? allItemIds : [] : allItemIds
            else
                return isChecked ? allItemIds : []
        })
    }

    const handleCheckboxChange = (itemId) => {
        setCheckedItemIds((prevCheckedItemIds) => {
            if (prevCheckedItemIds.includes(itemId)) {
                // If item is already in the array, remove it
                return prevCheckedItemIds.filter((id) => id !== itemId)
            } else {
                // If item is not in the array, add its _id property
                const item = allItems.find((item) => item._id === itemId)
                return item ? [ ...prevCheckedItemIds, item._id ] : prevCheckedItemIds
            }
        })
    }

    return (
        <>
        <div className='lg:hidden px-6 font-montserrat'>

            <div className='px-6 mt-10'>
                <div className='flex items-center gap-2'> 
                    <div className='grid grid-cols-2 font-bold font-montserrat'>
                        <NavLink to="/profile">
                            <FaArrowAltCircleLeft className='text-4xl' />
                        </NavLink>
                    </div>   
                </div>
            </div>
            <div className='flex justify-center gap-2 text-3xl -mt-7'>
                <AiOutlineHeart className='fill-orange-500' />
                <h1 className='text-lg text-center font-semibold mb-10 pl-1'>Favorites</h1>
            </div>

            { products.length || services.length ? 
                <div className='mt-6'>
                    { products.length ? 
                        <div className='mb-4'>
                            { products.map(item => (
                                <div className="mt-4 flex flex-cols gap-4" key={ item._id }>
                                    <input type='checkbox' 
                                        className='accent-[#00A881]'
                                        checked={checkedItemIds.includes(item._id) || false}
                                        onChange={() => handleCheckboxChange(item._id)}
                                    />
                                    <div className="border h-28 w-full rounded-xl">
                                        <NavLink to={ "/product" } state={ item }>
                                            <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                                                <img className="object-contain h-28 w-2/5 rounded-l-lg" src={ window.location.origin + '/public/products/' + item.image } />
                                                <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                                                    <h1 className='font-semibold'>{ item.name.length > 19 ? item.name.substring(0, 19) + "..." : item.name }</h1>
                                                    <h1 className='mt-1 text-sm'>{ item.description.length > 52 ? item.description.substring(0, 52) + "..." : item.description }</h1>
                                                    <div className='flex flex-cols items-center text-xl text-red-500'>
                                                        <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                                                        <div className='text-black-800'>{ String(parseFloat(item.price * (item.token === 'high' ? highToken : lowToken) + Number(item.price)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </NavLink>
                                    </div>
                                </div>
                            )) }
                        </div> 
                        : 
                        '' 
                    }

                    <div className='mt-4'>
                        { services.length ? 
                            <div className='mb-4'>
                                { services.map(item => (
                                    <div className="mt-4 flex flex-cols gap-4" key={ item._id }>
                                        <input type='checkbox' 
                                            className='accent-[#00A881]'
                                            checked={checkedItemIds.includes(item._id) || false}
                                            onChange={() => handleCheckboxChange(item._id)}
                                        />
                                        <div className="border h-28 w-full rounded-xl">
                                            <NavLink to={ "/service" } state={ item }>
                                                <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                                                    <img className="object-contain h-28 w-2/5 rounded-l-lg" src={ window.location.origin + '/public/services/' + item.image } />
                                                    <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                                                        <h1 className='font-semibold'>{ item.name.length > 19 ? item.name.substring(0, 19) + "..." : item.name }</h1>
                                                        <h1 className='mt-1 text-sm'>{ item.description.length > 52 ? item.description.substring(0, 52) + "..." : item.description }</h1>
                                                        <div className='flex flex-cols items-center text-xl text-red-500'>
                                                            <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                                                            <div className='text-black-800'>{ String(parseFloat(item.price * (item.token === 'high' ? highToken : lowToken) + Number(item.price)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </div>
                                    </div>
                                )) }
                            </div> 
                            : 
                            '' 
                        }
                    </div>
                
                    <hr />
                    
                    { allItems.length > 1 ? 
                        <div className='flex gap-4 mt-4'>
                            <FormGroup>
                                <FormControlLabel className='text-gray-600' label={ !checked ?'Select All' : 'Unselect All' } control={ <Checkbox color='success' checked={ checked } onChange={ handleSelectAllChange } inputProps={{ 'aria-label': 'controlled' }} /> } />
                            </FormGroup>
                        </div>
                        : 
                        ''
                    }
                        
                    <button disabled={ !checkedItemIds.length } onClick={ addToCart } className={ `mt-6 py-4 ${ !checkedItemIds.length ? 'bg-gray-400' : 'bg-emerald-500' }  w-full rounded-lg text-white font-semibold font-montserrat` }>Add To Cart ( { checkedItemIds.length } )</button>
                </div>
                :
                <div className='text-center font-semibold mt-10 mb-20 text-gray-300'>
                    <div className='mt-20 px-6 text-emerald-500'>
                        <div className='flex justify-center'>
                            <AiOutlineGift className='text-4xl' />
                        </div>
                        <h1 className='text-xl font-semibold text-center mt-4'>
                            My Favorites is Empty!
                        </h1>
                        <h2 className='text-gray-400 text-center mt-2'>
                            Add a product, service or store to favorite.
                        </h2>
                    </div>
                </div>
            }
        
            <div className='mb-20'/>
            <ToastContainer
                position="top-right"
                autoClose={1000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <NavbarMobile /> 
        </div>
    </>
    )
}

export default Favorites
