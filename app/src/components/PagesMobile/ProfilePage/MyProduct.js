import NavbarMobile from '../../MobileView/NavbarMobile'
import Cookies from 'universal-cookie'
import axios from 'axios'
import ModalMyProduct from '../../ModalMyProduct'
import insert_photo from '../../../assets/insert_photo.png'
import Croppie from 'croppie'
import 'croppie/croppie.css'
import { useRef, useState, useEffect } from 'react'
import { Rating, Stack, FormControl, Select, MenuItem } from '@mui/material'
import { FaArrowAltCircleLeft, FaCamera } from 'react-icons/fa'
import { GrProductHunt } from 'react-icons/gr'
import { CiCirclePlus } from 'react-icons/ci'
import { NavLink } from 'react-router-dom'
import { TbCurrencyPeso } from 'react-icons/tb'
import epa_coin from '../../../assets/epa-coin.gif'

const MyProduct = () => {

    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ products, setProducts ] = useState([])
    const [ productImg, setProductImg ] = useState('')
    const [ newProductImg, setNewProductImg ] = useState(null)
    const [ productName, setProductName ] = useState('')
    const [ productDesc, setProductDesc ] = useState('')
    const [ productCategory, setProductCategory ] = useState('')
    const [ productPrice, setProductPrice ] = useState('')
    const [ productBonusToken, setProductBonusToken ] = useState('')
    const [ productFees, setProductFees ] = useState('')
    const [ productExtra, setProductExtra ] = useState('')
    const [ productStocks, setProductStocks ] = useState('')
    const [ highToken, setHighToken ] = useState('')
    const [ lowToken, setLowToken ] = useState('')
    const [ productImgEdit, setProductImgEdit ] = useState(false)
    const [ show, setShow ] = useState(false)

    const showModal = () => setShow(true)
    const closeModal = () => setShow(false)

    const fileInputRef = useRef(null)
    const croppieRef = useRef(null)

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
                setLowToken(res.data.settings.lowToken)
                setHighToken(res.data.settings.highToken)
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
                    if (item.owner.includes(currentUser._id))
                        userProducts.push(item)
                })
                userProducts.forEach(item => {
                    let count = 0
                    if (item.ratings.length) {
                        item.ratings.forEach(rate => {
                            count += parseFloat(rate.ratings)
                        })
                        item.globalRating = parseFloat(count/item.ratings.length).toFixed(1)
                    }
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
        let fileReader, isCancel = false
        
        if (productImg) {
            fileReader = new FileReader()
            fileReader.onload = (e) => {
                console.log('productImg: ', e.target)
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

    useEffect(() => {
        if (newProductImg) {
            newProductImg.destroy()
            setNewProductImg(null)
        }
    }, [])

    const handleButtonClick = (e) => {
        e.preventDefault()

        fileInputRef.current.click()
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]

        if (file) {
            const reader = new FileReader()
            reader.onload = function (e) {
                if (croppieRef.current) {
                    const croppie = new Croppie(croppieRef.current, {
                        viewport: { width: 150, height: 150, type: 'square' },
                        boundary: { width: 250, height: 250 },
                        showZoomer: true,
                        enableResize: true,
                        enableOrientation: true
                    })
                    croppie.bind({ url: e.target.result }).then(() => {
                        console.log('Image edit bound')
                    })
                    setNewProductImg(croppie)
                    setProductImgEdit(true)
                    // console.log('Croppie edit bound', croppie)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const handleFileSet = async () => {
        let croppedImageBlob = null

        if (newProductImg) {
            croppedImageBlob = await newProductImg.result({
                type: 'blob',
                size: 'viewport',
                format: 'image/jpeg, image/jpg, image/png'
            })
        }

        setProductImg(croppedImageBlob)
        setProductImgEdit(false)
        newProductImg.destroy()
    }

    const handleFileCancel = async () => {
        setNewProductImg(null)
        setProductImgEdit(false)
        newProductImg.destroy()
    }

    return (
        <>
            <div className='font-montserrat lg:hidden'>
                <div className='px-6 mt-10'>
                    <div className='flex items-center gap-2'> 
                        <div className='grid grid-cols-2 font-bold font-montserrat'>
                            <NavLink to="/mystore">
                                <FaArrowAltCircleLeft className='text-4xl' />
                            </NavLink>
                        </div>   
                    </div>
                </div>
                <div className='flex justify-center gap-2 text-3xl -mt-7'>
                    <GrProductHunt className='fill-orange-500' />
                    <h1 className='text-2xl text-center font-semibold mb-10 pl-1'>My Products</h1>
                </div>
                <hr />

                <div className='mt-2 px-6'>
                    { currentUser && currentUser._id && products.length ? 
                        <div className='mt-4'>
                            <div className='flex justify-center mt-4 mb-4'>
                                <button className='h-8 w-8 bg-emerald-500 focus:outline-none focus:ring focus:ring-blue-400 text-white rounded-full' onClick={ () => showModal() }><CiCirclePlus className='h-8 w-8'/></button>
                            </div>
                            <div className='flex flex-wrap gap-2 justify-center mb-4'>
                                { products.map(item => (
                                    <div className="flex flex-2 items-end" key={ item._id }>
                                        <NavLink to={ "/editproduct" } state={ item }>
                                            <div className={ `border h-30 ${ innerWidth >=400 ? 'w-[178px]' : 'w-[152px]' } rounded-lg shadow-md` }>
                                                <div className='items-center'>
                                                    <img className='object-contain mb-2' src={ window.location.origin + '/public/products/' + item.image } />
                                                </div>
                                                <div className='text-xs ml-2'>
                                                    <div className='font-semibold text-md'>{ item.name }</div>
                                                    <div className='flex items-center text-xl text-red-500'>
                                                        <img src={ epa_coin } className='epacoin-store' alt="epacoin" />
                                                        <div className='text-black-800'>{ String(parseFloat(item.price * highToken + Number(item.price)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                                    </div>
                                                    <div className='flex gap-1'>
                                                        <p className='text-gray-500 py-0.5'>{ item.globalRating } / 5</p>
                                                        <Stack spacing={ 1 }>
                                                            <Rating name="product-ratings" size='small' defaultValue={ parseFloat(item.globalRating) } precision={ 0.5 } readOnly />
                                                        </Stack>
                                                    </div>
                                                </div>
                                            </div>
                                        </NavLink>
                                    </div>
                                )) }
                            </div>
                            {/* { products.map(item => (
                                <div className="px-6 py-4" key={ item._id }>
                                    <div className="relative flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
                                        <a className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl" href="#">
                                        <img className="object-cover" 
                                            src={ window.location.origin + '/public/products/' + item.image }
                                            alt='product image'
                                        />
                                        </a>
                                        <div className="mt-4 px-5 pb-5">
                                            <a href="#">
                                                <h5 className="text-xl tracking-tight text-slate-900">{ item.name }</h5>
                                            </a>
                                            <div className='tracking-tight text-slate-900'>{ item.description }</div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <div>
                                                    <div className='flex items-center text-3xl font-bold text-slate-900'>
                                                        <TbCurrencyPeso color='red'/>
                                                        <div className='text-black-800'>{ item.price }</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <svg aria-hidden="true" className="h-5 w-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                </svg>
                                                <svg aria-hidden="true" className="h-5 w-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                </svg>
                                                <svg aria-hidden="true" className="h-5 w-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                </svg>
                                                <svg aria-hidden="true" className="h-5 w-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                </svg>
                                                <svg aria-hidden="true" className="h-5 w-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                </svg>
                                                <span className="mr-2 ml-3 rounded bg-yellow-200 px-2.5 py-0.5 text-xs font-semibold">5.0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) } */}
                        </div>
                        : 
                        <div className='mt-6'>
                            <div className='flex justify-center text-emerald-500'>
                                <GrProductHunt className='text-4xl' />
                            </div>
                            <h1 className='text-xl font-semibold text-center text-emerald-500 mt-4'>
                                No Products Found !
                            </h1>
                            <h2 className='text-gray-400 text-center mt-2'>
                                Add now to sell products.
                            </h2>
                            <div className='flex justify-center mt-4'>
                                <button className='h-8 w-8 bg-emerald-500 focus:outline-none focus:ring focus:ring-blue-400 text-white rounded-full' onClick={ () => showModal() }><CiCirclePlus className='h-8 w-8'/></button>
                            </div>
                        </div>
                    }

                    <ModalMyProduct productImg={ productImg } productName={ productName } productDesc={ productDesc } productCategory={ productCategory } productPrice={ productPrice }  productBonusToken={ productBonusToken } productFees={ productFees } productExtra={ productExtra } productStocks={ productStocks } show={ show } onClose={ closeModal }>
                        <h2 className="text-lg font-bold">Add New Product</h2>
                        
                        <div className="flex justify-center pt-2">
                            { !productImgEdit ?
                                newProductImg ?
                                <img className={ `h-20 ${ innerWidth >=400 ? 'w-[118px]' : 'w-[92px]' }` }
                                    src={ newProductImg } alt="new_product_img" />
                                :
                                <img className={ `h-20 ${ innerWidth >=400 ? 'w-[118px]' : 'w-[92px]' }` }
                                    src={ insert_photo } alt="insert_photo" /> 
                                :
                                newProductImg ? '' :
                                <img className={ `h-20 ${ innerWidth >=400 ? 'w-[118px]' : 'w-[92px]' }` }
                                    src={ newProductImg } alt="new_product_img_edit" />
                            }
                        </div>

                        {/* Croppie element for cropping */}
                        <div className='flex justify-center'>
                            <div ref={ croppieRef }></div>
                        </div>

                        <div className='flex justify-center'>
                            { !productImgEdit ? 
                                <div>
                                    <button className="bg-emerald-500 text-xs text-white font-bold py-2 px-4 rounded" onClick={ handleButtonClick }>
                                        <FaCamera />
                                    </button>
                                    <input
                                        type="file"
                                        ref={ fileInputRef }
                                        className="hidden"
                                        accept='image/jpeg, image/jpg, image/png'
                                        onChange={ handleFileChange }
                                    />
                                </div>
                                : 
                                <div className='flex flex-cols gap-4'>
                                    <button className='outline outline-offset-2 outline-emerald-400 w-16 rounded text-center' onClick={ () => handleFileSet() }>
                                        <p className='text-xs'>Set</p>
                                    </button>
                                    <button className='outline outline-offset-2 outline-red-400 w-16 rounded text-center' onClick={ () => handleFileCancel() }>
                                        <p className='text-xs'>Cancel</p>
                                    </button>
                                </div>
                            }
                        </div>

                        { !productImgEdit &&
                            <div className='items-center mt-2'>
                                <br />
                                <input 
                                    className='border-2 p-2 bg-white-100'
                                    type="text" 
                                    placeholder="Product Name" 
                                    onChange={ (e) => setProductName(e.target.value)}
                                />
                                <textarea 
                                    className='border-2 p-2 mt-2 bg-white-100'
                                    type="text" 
                                    placeholder="Description" 
                                    rows={2}
                                    onChange={ (e) => setProductDesc(e.target.value)}
                                />
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
                                <input 
                                    className='border-2 p-2 mt-2 bg-white-100'
                                    type="tel"
                                    placeholder="Price" 
                                    onChange={ (e) => setProductPrice(e.target.value)}
                                />
                                <div className='px-1 mt-1 text-red-500 text-xs'>Overpricing leads to suspension of accounts.</div>
                                { productPrice &&
                                    <div className='mt-2 flex flex-wrap px-4 justify-between'>
                                        <div>EPA Coin Equivalent:<span className='flex flex-cols-2 text-red-500'><img src={ epa_coin } className='epacoin-store' alt="epacoin" />{ parseFloat(Number(productPrice) * highToken + Number(productPrice)).toFixed(2) }</span></div>
                                    </div>
                                }
                                <input 
                                    className='border-2 p-2 mt-2 bg-white-100'
                                    type="tel"
                                    placeholder="Bonus" 
                                    onChange={ (e) => setProductBonusToken(e.target.value)}
                                />
                                { productPrice && productBonusToken && 
                                    <div className='mt-2 flex flex-wrap px-4 justify-between'>
                                        <div>Net Amount:<span className='flex flex-cols-2 text-red-500'><TbCurrencyPeso className='text-xl' color='red' />{ parseFloat(Number(productPrice) - productBonusToken).toFixed(2) }</span></div>
                                    </div>
                                }
                                <div className='flex flex-cols'>
                                    <input 
                                        className='border-2 p-2 mt-2 bg-white-100 w-1/2'
                                        type="tel"
                                        placeholder="Charge for Extra" 
                                        onChange={ (e) => setProductExtra(e.target.value)}
                                    />
                                    <input 
                                        className='border-2 p-2 mt-2 bg-white-100 w-1/2'
                                        type="tel"
                                        placeholder="Delivery Fee" 
                                        onChange={ (e) => setProductFees(e.target.value)}
                                    />
                                </div>
                                <input 
                                    className='border-2 p-2 mt-2 bg-white-100'
                                    type="tel" 
                                    placeholder="Stocks" 
                                    onChange={ (e) => setProductStocks(e.target.value)}
                                />
                            </div>
                        }
                    </ModalMyProduct>

                    <div className='mb-20'/>

                </div>
            </div>

            < NavbarMobile /> 
        </>
    )
}

export default MyProduct
