import Cookies from 'universal-cookie'
import axios from 'axios'
import NavbarMobile from '../MobileView/NavbarMobile'
import { useState, useEffect } from 'react'
// import { AiOutlineLeft } from 'react-icons/ai'
// import { BsThreeDots } from 'react-icons/bs'
import { NavLink } from 'react-router-dom'
import { Checkbox, FormGroup, FormControlLabel } from '@mui/material'
import { CiCirclePlus, CiCircleMinus } from 'react-icons/ci'
import { BsCart3 } from 'react-icons/bs'
import { RiDeleteBin5Fill } from 'react-icons/ri'
import { TbCurrencyPeso } from 'react-icons/tb'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import epa_coin from '../../assets/epa-coin.gif'


const Cart = () => {

    const cookies = new Cookies()
    const isAuth = cookies.get('token')
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ products, setProducts ] = useState([])
    const [ services, setServices ] = useState([])
    const [ stores, setStores ] = useState('')
    const [ checkedItemIds, setCheckedItemIds ] = useState([])
    const [ checked, setChecked ] = useState(false)
    const [ highToken, setHighToken ] = useState('')
    const [ lowToken, setLowToken ] = useState('')

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (isAuth) {
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
    }, [ isAuth ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (isAuth) {
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
    }, [ isAuth ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        const cartProducts = []

        if (currentUser && currentUser.cart) {
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
                    currentUser.cart.forEach(itm => {
                        if (itm.itemId.includes(item._id)) {
                            item.token = itm.token
                            cartProducts.push(item)
                        }
                    })
                })
                setProducts(cartProducts)
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
        const cartServices = []

        if (currentUser && currentUser.cart) {
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
                    currentUser.cart.forEach(itm => {
                        if (itm.itemId.includes(item._id)) {
                            item.token = itm.token
                            cartServices.push(item)
                        }
                    })
                })
                setServices(cartServices)
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

        if (currentUser) {
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

    const allItems = products.concat(services)

    const handleSelectAllChange = (e) => {
        setChecked(e.target.checked)

        const allItemIds = allItems.filter(item => item.stocks > 0 || item.rate).map((item) => item._id)
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

    const handleDecQuantity = (itemData) => {
        const type = itemData.stocks ? 'product' : 'service'

        if (type === 'product') {
            setProducts(products.map(product => {
                if (product._id === itemData._id) {
                    return {
                        ...product,
                        quantity: product.quantity <= 1 ? 1 : product.quantity - 1
                    }
                } else {
                    return product
                }
            }))
        }
    }

    const handleIncQuantity = (itemData) => {
        const type = itemData.stocks ? 'product' : 'service'

        if (type === 'product') {
            setProducts(products.map(product => {
                if (product._id === itemData._id) {
                    return {
                        ...product,
                        quantity: product.quantity + 1
                    }
                } else {
                    return product
                }
            }))
        }
    }

    const removeCart = async (itemData) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/user/removecart/${ user.id }`, { itemDetails: itemData }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.message)
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

    let selectedItems = [], totalPrice = 0

    if (products && services && allItems && checkedItemIds) {
        selectedItems = allItems.filter(item => checkedItemIds.includes(item._id))

        selectedItems.forEach(item => {
            totalPrice += item.stocks ? (item.token === 'high' ? item.price * highToken + item.price : item.price * lowToken + item.price) * item.quantity : (item.token === 'high' ? item.price * highToken + item.price : item.price * lowToken + item.price)
        })
    }

    return (
        <>
        <div className='lg:hidden font-montserrat'>
            {/* <div className='flex justify-between items-center px-6 mt-10'>
                <NavLink to="/">
                    <div className='shadow-lg p-2'>
                        <AiOutlineLeft className='text-xl'/>
                    </div>
                </NavLink>
                <div></div>
                <h1 className='text-2xl font-semibold'>My Cart</h1>
                <div className='shadow-xl p-2'>
                    <BsThreeDots className='text-xl'/>
                </div>
            </div> */}
            <div className='mx-6 mt-10'>
                <h1 className='text-2xl font-semibold text-center mb-6'>My Cart</h1>
                <hr />
            </div>
            
            { currentUser.cart && currentUser.cart.length ?
                <div className='mb-4 mx-6'>
                    { currentUser && currentUser._id && products.length ? 
                        <div className='mb-2'>
                        { products.map(item => (
                            <div className="mt-4" key={ item._id }>
                                { stores.map(storeItem => (
                                    <div className="flex flex-cols font-semibold" key={ storeItem._id }>
                                        <NavLink to='/store' state={ storeItem }>
                                            { storeItem.owner === item.owner ? 
                                                <div className='flex gap-2 mb-2'>
                                                    { item.owner === process.env.EPA_ACCT_ID ? 
                                                        <div className="flex flex-cols gap-2">
                                                            <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                            <div className="text-lime-500 text-center text-xl font-bold">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                                                        </div>
                                                        : 
                                                        <div className="flex flex-cols gap-2">
                                                            <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                            <div>{ storeItem.name }</div>
                                                        </div>
                                                    }
                                                </div>
                                                : 
                                                ''
                                            }
                                        </NavLink>
                                    </div>
                                )) }
                                <div className='flex flex-cols gap-4'>
                                    <input type='checkbox' 
                                        className='accent-[#00A881]'
                                        disabled={ item.stocks === 0 }
                                        checked={ checkedItemIds.includes(item._id) || false }
                                        onChange={ () => handleCheckboxChange(item._id) }
                                    />
                                    <div className="border h-28 w-full rounded-xl">
                                        <NavLink to='/product' state={ item }>
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

                                <div className='grid grid-cols-2'>
                                    <div className='flex gap-2 justify-start mx-6 mt-4'>
                                        <p className='text-sm'>Tokens:</p>
                                        <p className='text-sm font-semibold'>{ String(parseFloat((item.price * highToken + parseFloat(item.price)) * 10).toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                    </div>
                                    <div className='flex justify-end mt-4'>
                                        <button className={ `${ item.quantity !== 1 ? 'bg-orange-400' : 'bg-gray-500' } text-white rounded-full shadow-md h-5 w-5` } onClick={() => { handleDecQuantity(item) }}>
                                            <CiCircleMinus className="h-5 w-5" />
                                        </button>
                                            <span className="text-black text-md pr-2 pl-2">{ item.quantity }</span>
                                        <button disabled={ item.stocks === item.quantity } className={ `${ item.stocks === item.quantity ? 'bg-gray-500' : 'bg-orange-400' } text-white rounded-full shadow-md h-5 w-5` } onClick={() => { handleIncQuantity(item) }}>
                                            <CiCirclePlus className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className='grid grid-cols-2'>
                                    <div className='flex gap-2 mx-6 justify-start'>
                                        <p className='text-sm'>Bonus:</p>
                                        <p className='text-sm font-semibold'>{ String(parseFloat(item.bonusToken.$numberDecimal * 10)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                    </div>
                                    <div className='flex justify-end'>
                                        <button className='text-white h-5 w-5' onClick={() => { removeCart(item) }}>
                                            <RiDeleteBin5Fill className="h-5 w-5 fill-red-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className='flex gap-2 mx-6 mt-1 justify-start'>
                                    <p className='text-sm'>Available Stocks:</p>
                                    <p className={ `${ item.stocks > 0 ? 'text-orange-400' : 'text-red-400' } text-sm font-semibold` }>{ item.stocks > 0 ? item.stocks : 'Out of Stock' }</p>
                                </div>

                                <div className="bg-gray-200 -mx-6 pb-3 mt-3" />
                            </div>
                        )) }
                        </div> 
                        : 
                        '' 
                    }
                    
                    { currentUser && currentUser._id && services.length ? 
                        <div className='mb-6'>
                        { services.map(item => (
                            <div className="mt-4" key={ item._id }>
                                { stores.map(storeItem => (
                                    <div className="flex flex-cols font-semibold" key={ storeItem._id }>
                                        <NavLink to='/store' state={ storeItem }>
                                            { storeItem.owner === item.owner ? 
                                                    <div className='flex gap-2 mb-2'>
                                                        { item.owner === process.env.EPA_ACCT_ID ? 
                                                            <div className="flex flex-cols gap-2">
                                                                <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                                <div className="text-lime-500 text-center text-xl font-bold">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                                                            </div>
                                                            : 
                                                            <div className="flex flex-cols gap-2">
                                                                <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                                <div>{ storeItem.name }</div>
                                                            </div>
                                                        }
                                                    </div>
                                                : 
                                                ''
                                            }
                                        </NavLink>
                                    </div>
                                )) }
                                <div className='flex flex-cols gap-4'>
                                    <input type='checkbox' 
                                        className='accent-[#00A881]'
                                        checked={ checkedItemIds.includes(item._id) || false }
                                        onChange={ () => handleCheckboxChange(item._id) }
                                    />
                                    <div className="border h-30 w-full rounded-lg">
                                        <NavLink to='/service' state={ item }>
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

                                <div className='grid grid-cols-2'>
                                    <div className='flex gap-2 mx-6 mt-4 justify-start'>
                                        <p className='text-sm'>Tokens:</p>
                                        <p className='text-sm font-semibold'>{ String(parseFloat((item.price * highToken + parseFloat(item.price)) * 10).toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                    </div>
                                    <div className='flex mt-4 justify-end'>
                                        <button className='text-white h-5 w-5' onClick={() => { removeCart(item) }}>
                                            <RiDeleteBin5Fill className="h-5 w-5 fill-red-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className='flex gap-2 mx-6 mt-1 justify-start'>
                                    <p className='text-sm'>Bonus:</p>
                                    <p className='text-sm font-semibold'>{ String(parseFloat(item.bonusToken.$numberDecimal * 10)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                </div>
                                <div className='flex gap-2 mx-6 mt-1 justify-start'>
                                    <p className='text-sm'>Rate:</p>
                                    <p className='text-sm font-semibold'>{ item.rate && item.rate === 'day' ? 'daily' : item.rate + 'ly' }</p>
                                </div>

                                <div className="bg-gray-200 -mx-6 pb-3 mt-3" />

                            </div>
                        )) }
                        </div> 
                        : 
                        '' 
                    }

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

                    <div className='flex justify-between mb-6 mt-6 font-montserrat font-semibold'>
                        <h2>Total Payment</h2>
                        <div className='flex items-center'>
                            <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                            <p>{ String(parseFloat(totalPrice).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                        </div>
                    </div>
                    <NavLink to='/order' state={ selectedItems }>
                        <button disabled={ !selectedItems.length } className={ `py-4 ${ !selectedItems.length ? 'bg-gray-400' : 'bg-emerald-400' } w-full rounded-lg shadow-md text-white font-semibold font-montserrat` }>Checkout ( { selectedItems.length } )</button>
                    </NavLink>
                </div>
                :
                <div className='text-center font-semibold mt-10 mb-20 text-gray-300'>
                    <div className='mt-20 px-6 text-emerald-500'>
                        <div className='flex justify-center'>
                            <BsCart3 className='text-4xl' />
                        </div>
                        <h1 className='text-xl font-semibold text-center mt-4'>
                            My Cart is Empty!
                        </h1>
                        <h2 className='text-gray-400 text-center mt-2'>
                            Add a product, service or store to cart.
                        </h2>
                    </div>
                </div>
            }

            <div className='mb-20'/>

            <ToastContainer
                position='top-right'
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
            
            <NavbarMobile />
        </div>
    </>
    )
}

export default Cart
