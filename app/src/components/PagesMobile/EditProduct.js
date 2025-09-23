import Cookies from 'universal-cookie'
import axios from 'axios'
import ModalDeleteItem from '../../components/ModalDeleteItem'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { FaArrowAltCircleLeft, FaCamera } from 'react-icons/fa'
import { RiDeleteBin5Fill } from 'react-icons/ri'
import { TbCurrencyPeso } from 'react-icons/tb'
import { useRef, useState, useEffect } from 'react'
import { FormControl, Select, MenuItem } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import epa_coin from '../../assets/epa-coin.gif'

// NOTE: Add URL lock for this page
const EditProduct = () => {

    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const { state } = useLocation()
    const [ productImg, setProductImg ] = useState('')
    const [ newProductImg, setNewProductImg ] = useState(null)
    const [ productName, setProductName ] = useState(state.name)
    const [ productDesc, setProductDesc ] = useState(state.description)
    const [ productCategory, setProductCategory ] = useState(state.category)
    const [ productPrice, setProductPrice ] = useState(state.price)
    const [ productBonusToken, setProductBonusToken ] = useState(state.bonusToken.$numberDecimal)
    const [ productFees, setProductFees ] = useState(state.fees.$numberDecimal)
    const [ productExtra, setProductExtra ] = useState(state.extra.$numberDecimal)
    const [ productStocks, setProductStocks ] = useState(state.stocks)
    const [ highToken, setHighToken ] = useState('')
    const [ lowToken, setLowToken ] = useState('')
    const [ show, setShow ] = useState(false)
    const [ event, setEvent ] = useState(false)

    const fileInputRef = useRef(null)

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
        let fileReader, isCancel = false
        
        if (productImg) {
            fileReader = new FileReader()
            fileReader.onload = (e) => {
                const { result } = e.target
                if (result && !isCancel)
                    setNewProductImg(result)
                }
                fileReader.readAsDataURL(productImg)
        }

        return () => {
            isCancel = true
            if (fileReader && fileReader.readyState === 1)
                fileReader.abort()
        }
    }, [ productImg ])

    const handleButtonClick = (e) => {
        e.preventDefault()
        fileInputRef.current.click()
    }

    const handleFileSave = async(e) => {
        e.preventDefault()
        e.currentTarget.disabled = true

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('products', productImg ? productImg : state.image)
        formData.append('name', productName ? productName : state.name)
        formData.append('description', productDesc ? productDesc : state.description)
        formData.append('category', productCategory ? productCategory : state.category)
        formData.append('price', productPrice ? productPrice : state.price)
        formData.append('bonusToken', productBonusToken ? productBonusToken : state.bonusToken.$numberDecimal)
        formData.append('fees', productFees ? productFees : state.fees.$numberDecimal)
        formData.append('extra', productExtra ? productExtra : state.extra.$numberDecimal)
        formData.append('stocks', productStocks ? productStocks : state.stocks)

        await axios.put(`/api/product/editproduct/${ state._id }`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'multipart/form-data',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.success(res.data.message)
            setTimeout(() => {
                navigate('/myproduct')
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

    const openModal = () => {
        setShow(true)
    }

    const closeModal = (e, state) => {
        setShow(false)
        if (e === 'yes') {
            setEvent(true)
            removeItem(e, state._id)
        }
    }

    const removeItem = async (e, itemId) => {
        if (event) {
            e.preventDefault()
            e.currentTarget.disabled = true
        }

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.delete(`/api/product/remove-product/${ itemId }`, {
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
                navigate('/myproduct')
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
            <div className='lg:hidden font-montserrat'>
                <div className='mb-6'>
                    <div className='flex justify-between items-center px-6 pt-10'>
                        <NavLink to='/myproduct'>
                            <FaArrowAltCircleLeft className='text-4xl'/>
                        </NavLink>
                        <h1 className='text-lg font-semibold ml-11'>Edit Product</h1>
                        <button className='outline outline-offset-2 outline-emerald-500 w-16 rounded text-center' onClick={ handleFileSave }>
                            <p className='font-semibold'>Save</p>
                        </button>
                    </div>

                    <div className='flex justify-center items-center'>
                        { productImg && newProductImg ?
                            <img className="scale-75"
                                src={ newProductImg }
                                alt="insert_photo" /> 
                            :
                            <img className='scale-75'
                                src={ window.location.origin + '/public/products/' + state.image } 
                            />
                        }
                    </div>

                    <div className='flex justify-center pt-2'>
                        <button className="bg-emerald-500 text-xs text-white font-bold py-2 px-4 rounded" onClick={ handleButtonClick }>
                                <FaCamera />
                        </button>
                        <input
                            type="file"
                            ref={ fileInputRef }
                            className="hidden"
                            accept='image/jpeg, image/jpg, image/png'
                            onChange={ (e) => setProductImg(e.target.files[0]) }
                        />
                    </div>
                </div>

                <div className='px-6 mt-12'>
                    <div className='flex justify-between'>
                        <input className='font-bold text-2xl'
                            type="text"
                            onChange={ (e) => setProductName(e.target.value) }
                            placeholder={ state.name }
                            value={ productName }
                        />
                    </div>

                    <div className='mt-2 flex items-center'>
                        <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                        <input 
                            className='border-2 py-1 font-semibold text-2xl bg-white-100'
                            type="tel"
                            placeholder={ state.price } 
                            value={ productPrice }
                            onChange={ (e) => setProductPrice(e.target.value)}
                        />
                    </div>

                    <div className='flex flex-cols justify-start'>
                        { productPrice ? 
                            <div className='mt-2 flex flex-wrap px-4 justify-between'>
                                <div>EPA Coin Equivalent:<span className='flex flex-cols-2 text-red-500'><img src={ epa_coin } className='epacoin-store' alt="epacoin" />{ parseFloat(Number(productPrice) * highToken + Number(productPrice)).toFixed(2) }</span></div>
                            </div>
                            : 
                            <div className='mt-2 flex flex-wrap px-4 justify-between'>
                                <div>EPA Coin Equivalent:<span className='flex flex-cols-2 text-red-500'><img src={ epa_coin } className='epacoin-store' alt="epacoin" />{ parseFloat(Number(state.price) * highToken + Number(state.price)).toFixed(2) }</span></div>
                            </div>
                        }
                        { productPrice && productBonusToken ? 
                            <div className='mt-2 flex flex-wrap px-4 justify-between'>
                                <div>Net Amount:<span className='flex flex-cols-2 text-red-500'><TbCurrencyPeso className='text-xl' color='red' />{ parseFloat(Number(productPrice) - productBonusToken).toFixed(2) }</span></div>
                                </div>
                            : 
                            <div className='mt-2 flex flex-wrap px-4 justify-between'>
                                <div>Net Amount:<span className='flex flex-cols-2 text-red-500'><TbCurrencyPeso className='text-xl' color='red' />{ parseFloat(Number(state.price) - state.bonusToken.$numberDecimal).toFixed(2) }</span></div>
                            </div>
                        }
                    </div>

                    <h1 className='pb-2'>For Bonus Token</h1>
                    <div className='flex items-center'>
                        <TbCurrencyPeso className='-mt-4 text-xl' color='red' />
                        <input 
                            className='border-2 p-2 mb-4 bg-white-100'
                            type="tel" 
                            placeholder={ state.bonusToken.$numberDecimal }
                            value={ productBonusToken }
                            onChange={ (e) => setProductBonusToken(e.target.value)}
                        />
                    </div>

                    <h1 className='pb-2'>Charge for Extra</h1>
                    <div className='flex items-center'>
                        <img src={ epa_coin } className='epacoin-store -mt-4' alt="epacoin" />
                        <input 
                            className='border-2 p-2 mb-4 bg-white-100'
                            type="tel" 
                            placeholder={ state.extra.$numberDecimal }
                            value={ productExtra }
                            onChange={ (e) => setProductExtra(e.target.value)}
                        />
                    </div>

                    <h1 className='pb-2'>Delivery Fee</h1>
                    <div className='flex items-center'>
                        <img src={ epa_coin } className='epacoin-store -mt-4' alt="epacoin" />
                        <input 
                            className='border-2 p-2 mb-4 bg-white-100'
                            type="tel" 
                            placeholder={ state.fees.$numberDecimal }
                            value={ productFees }
                            onChange={ (e) => setProductFees(e.target.value)}
                        />
                    </div>

                    <hr />

                    <div className='mt-4'>
                        <h1 className='pb-2'>Description</h1>
                        <textarea 
                            className='border-2 p-2 mt-2 bg-white-100 w-full'
                            type="text" 
                            placeholder={ state.description } 
                            value={ productDesc }
                            rows={ 2 }
                            onChange={ (e) => setProductDesc(e.target.value)}
                        />
                    </div>

                    <div className='mt-3'>
                        <FormControl sx={{ m: 0, minWidth: 159 }} size="small">
                            <h1 className='pb-2'>Category</h1>
                            <Select
                                labelId="category-select-label"
                                id='category-select'
                                value={ productCategory }
                                label="Category"
                                onChange={ (e) => setProductCategory(e.target.value) }
                            >
                                <MenuItem value='accessories'>Apparel and Accessories</MenuItem>
                                <MenuItem value='adults'>Adults 18+</MenuItem>
                                <MenuItem value='agriculture'>Agriculture</MenuItem>
                                <MenuItem value='autoparts'>Auto and Parts</MenuItem>
                                <MenuItem value='others'>Books, Movies, Music and Games</MenuItem>
                                <MenuItem value="clothing">Clothing</MenuItem>
                                <MenuItem value='electronics'>Consumer Electronics</MenuItem>
                                <MenuItem value='consultancy'>Consultancy</MenuItem>
                                <MenuItem value='energy'>Energy</MenuItem>
                                <MenuItem value='furniture'>Furniture and Fixture</MenuItem>
                                <MenuItem value='food'>Food and Beverage</MenuItem>
                                <MenuItem value='household'>Househould</MenuItem>
                                <MenuItem value="footwear">Footwear</MenuItem>
                                <MenuItem value='beauty'>Health, Care and Beauty</MenuItem>
                                <MenuItem value='logistics'>Logistics</MenuItem>
                                <MenuItem value='pets'>Pets</MenuItem>
                                <MenuItem value='public'>Public Utilities</MenuItem>
                                <MenuItem value='religious'>Religious Items</MenuItem>
                                <MenuItem value='school'>School and Office Supplies</MenuItem>
                                <MenuItem value='services'>Services</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    <h1 className='pb-2 mt-4'>Stocks</h1>
                    <input 
                        className='border-2 p-2 mt-2 bg-white-100'
                        type="tel" 
                        placeholder={ state.stocks }
                        value={ productStocks }
                        onChange={ (e) => setProductStocks(e.target.value)}
                    />
                    
                    <div className='pb-2 mt-10' onClick={ (e) => openModal(e) }>
                        <div className='flex items-center justify-center gap-3 text-center text-white bg-red-400 rounded-md shadow-md'>
                            <RiDeleteBin5Fill size={ 30 } />
                            <p className='font-semibold'>Delete</p>
                        </div>
                    </div>
                    <ModalDeleteItem show={ show } state={ state } onClose={ closeModal }>
                        <h2 className="text-lg font-bold mb-4">Delete Item</h2>
                        <div>Are you sure you want to delete { state.name } ?</div>
                    </ModalDeleteItem>
                </div>
            </div>

            <div className='mb-20'/>
            
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

export default EditProduct
