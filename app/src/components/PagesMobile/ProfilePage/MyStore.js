import NavbarMobile from '../../MobileView/NavbarMobile'
import Cookies from 'universal-cookie'
import axios from 'axios'
import ModalMyStore from '../../ModalMyStore'
import ModalDelegate from '../../ModalDelegate'
import ModalUnDelegate from '../../ModalUnDelegate'
import insert_photo from '../../../assets/insert_photo.png'
import ValidationBeforeRegister from '../../ValidationBeforeRegister'
import Croppie from 'croppie'
import 'croppie/croppie.css'
// import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete'
// import '@geoapify/geocoder-autocomplete/styles/minimal.css'
import { useRef, useEffect, useState } from 'react'
import { FaStore, FaCamera } from 'react-icons/fa'
import { GrProductHunt, GrServices } from 'react-icons/gr'
import { RiMoneyDollarCircleFill } from 'react-icons/ri'
import { CiCirclePlus } from 'react-icons/ci'
import { NavLink } from 'react-router-dom'
import OtpInput from 'react-otp-input'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const MyStore = () => {

    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ store, setStore ] = useState('')
    const [ storeImg, setStoreImg ] = useState('')
    const [ newStoreImg, setNewStoreImg ] = useState('')
    const [ storeName, setStoreName ] = useState('')
    const [ storeDesc, setStoreDesc ] = useState('')
    const [ storeContactNum, setStoreContactNum ] = useState('')
    const [ storeAddress, setStoreAddress ] = useState('')
    const [ storeCity, setStoreCity ] = useState('')
    const [ storeProvince, setStoreProvince ] = useState('')
    const [ storeZipCode, setStoreZipCode ] = useState('')
    const [ storeCountry, setStoreCountry ] = useState('')
    const [ storeImgEdit, setStoreImgEdit ] = useState(false)
    const [ show, setShow ] = useState(false)
    const [ showPin, setShowPin ] = useState(false)
    const [ showUnPin, setShowUnPin ] = useState(false)

    const showModal = () => setShow(true) 
    const closeModal = () => setShow(false)

    // OTP
    const showModalPin = () => setShowPin(true) 
    const closeModalPin = () => setShowPin(false)
    const showModalUnPin = () => setShowUnPin(true) 
    const closeModalUnPin = () => setShowUnPin(false)
    const [ otp, setOtp ] = useState(cookies.get('delegatePin') ? cookies.get('delegatePin') : '')
    const [ unOtp, setUnOtp ] = useState('')

    const fileInputRef = useRef(null)
    const croppieRef = useRef(null)

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

        if (user && user.id) {
            axios.get(`/api/store/${ user.id }`, {
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
    }, [ user ])

    useEffect(() => {
        let fileReader, isCancel = false
        
        if (storeImg) {
            fileReader = new FileReader()
            fileReader.onload = (e) => {
                const { result } = e.target
                if (result && !isCancel)
                    setNewStoreImg(result)
                }
                fileReader.readAsDataURL(storeImg)
        }
        return () => {
            isCancel = true
            if (fileReader && fileReader.readyState === 1)
                fileReader.abort()
        }
    }, [ storeImg ])

    useEffect(() => {
        if (newStoreImg) {
            newStoreImg.destroy()
            setNewStoreImg(null)
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
                    setNewStoreImg(croppie)
                    setStoreImgEdit(true)
                    // console.log('Croppie edit bound', croppie)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const handleFileSet = async () => {
        let croppedImageBlob = null

        if (newStoreImg) {
            croppedImageBlob = await newStoreImg.result({
                type: 'blob',
                size: 'viewport',
                format: 'image/jpeg, image/jpg, image/png'
            })
        }

        setStoreImg(croppedImageBlob)
        setStoreImgEdit(false)
        newStoreImg.destroy()
    }

    const handleFileCancel = async () => {
        setNewStoreImg(null)
        setStoreImgEdit(false)
        newStoreImg.destroy()
    }

    // const autocomplete = new GeocoderAutocomplete(
    //     document.getElementById("autocomplete"), process.env.API_KEY, { 
    //     /* Geocoder options */ 
    // })
    

    // autocomplete.on('select', (location) => {
    //     console.log('location >> ', location)
    //     // check selected location here 
    // })

    // autocomplete.on('suggestions', (suggestions) => {
    //     // process suggestions here
    //     console.log('suggestions >> ', suggestions)
    // })

    return (
        <>
            <div className='font-montserrat lg:hidden'>
                <div className='px-6 mt-10'>
                    <div className='mx-6 mt-10'>
                        <h1 className='text-2xl font-semibold text-center mb-6'>My Store</h1>
                        <hr />
                    </div>
                </div>

                { user.religion || currentUser.religion ? 
                    <div>
                        { store ? 
                            <div>
                                <div className='flex justify-center mt-3'>
                                    <NavLink to='/editstore' state={ store }>
                                        <div className={ `h-30 ${ innerWidth >=400 ? 'w-[178px]' : 'w-[152px]' } rounded-lg` }>
                                            <img className='object-contain mb-2' src={ window.location.origin + '/public/stores/' + store.image } />
                                        </div>
                                    </NavLink>
                                </div>

                                <div className='px-6 bg-gradient-to-r from-emerald-500 to-lime-500 pt-3 pb-3'>
                                    <p className='text-4xl text-orange-600 font-bold text-center'>{ store.name }</p>

                                    <div className='flex justify-center p-1'>
                                        { !currentUser.delegatePin ? 
                                            <button onClick={ () => showModalPin() } className={`h-7 w-18 px-2 py-1 text-sm text-indigo-100 transition-colors duration-150 bg-blue-500 rounded-full focus:shadow-outline hover:bg-red-800 flex items-center`}>
                                                <div className='font-semibold text-white'>Delegate</div>
                                            </button>
                                            : 
                                            <button onClick={ () => showModalUnPin() } className={`h-7 w-18 px-2 py-1 text-sm text-indigo-100 transition-colors duration-150 bg-red-500 rounded-full focus:shadow-outline hover:bg-red-800 flex items-center`}>
                                                <div className='font-semibold text-white'>Undelegate</div>
                                            </button>
                                        }
                                    </div>

                                    <p className='mt-2 text-sm text-white font-semibold text-justify'>{ store.description }</p>
                                </div>

                                <div className="bg-white pb-3" />
                                
                                <div className='px-6 bg-gray-200 pt-3 pb-3'>
                                    <p className='text-sm font-semibold'><span className='font-semibold text-purple-600'>{ currentUser.name }</span></p>
                                    <p className='text-sm font-semibold'><span className='font-semibold text-emerald-600'>{ currentUser.email }</span></p>
                                    <p className='text-sm font-semibold'><span className='font-semibold'>{ store.address }</span></p>
                                    <p className='text-sm font-semibold'><span className='font-semibold'>{ store.city } { store.province }</span></p>
                                    <p className='text-sm font-semibold'><span className='font-semibold'>{ store.zipcode } { store.country }</span></p>
                                    <p className='text-sm font-semibold'><span className='font-semibold text-red-600'>{ store.contactnumber }</span></p>
                                </div>

                                <br />
                                
                                <div className='px-10 justify-center text-center text-white'>
                                    <NavLink to='/myproduct'>
                                        <div className='p-2 mb-3 bg-orange-400 rounded-xl shadow-md'>
                                            <div className='flex items-center justify-center gap-3'>
                                                <GrProductHunt size={ 30 } />
                                                <p className='font-semibold'>My Products</p>
                                            </div>
                                        </div>
                                    </NavLink>
                                    <NavLink to='/myservice'>
                                        <div className='p-2 mb-3 bg-blue-400 rounded-xl shadow-md'>
                                            <div className='flex items-center justify-center gap-3'>
                                                <GrServices size={ 30 } />
                                                <p className='font-semibold'>My Services</p>
                                            </div>
                                        </div>
                                    </NavLink>
                                    <NavLink to='/mysales'>
                                        <div className='p-2 mb-3 bg-emerald-400 rounded-xl shadow-md'>
                                            <div className='flex items-center justify-center gap-3'>
                                                <RiMoneyDollarCircleFill size={ 30 } />
                                                <p className='font-semibold'>My Sales</p>
                                            </div>
                                        </div>
                                    </NavLink>
                                </div>
                            </div>
                            : 
                            <div className='text-center font-semibold mt-10 mb-20 text-gray-300'>
                                <div className='mt-20 px-6 text-emerald-500'>
                                    <div className='flex justify-center'>
                                        <FaStore className='text-4xl' />
                                    </div>
                                    <h1 className='text-xl font-semibold text-center text-emerald-500 mt-4'>
                                        No Store Found !
                                    </h1>
                                    <h2 className='text-gray-400 text-center mt-2'>
                                        <p className='pb-2'>Build one now to sell products and services.</p>
                                        <p className='py-2 text-xs text-red-500'>Strict Compliance: If you are not the owner of the store, get an authority to promote the store. Send your authorization document to this email: store@epabusiness.com</p>
                                        <p className='py-2 text-xs text-red-500'>Note: No authority from the store will be automatically deleted.</p>
                                    </h2>
                                    <div className='flex justify-center mt-4'>
                                        <button className='h-8 w-8 bg-emerald-500 focus:outline-none focus:ring focus:ring-blue-400 text-white rounded-full' onClick={ () => showModal() }><CiCirclePlus className='h-8 w-8'/></button>
                                    </div>
                                </div>
                            </div>
                        }
                        
                        <ModalMyStore store={ store } storeImg={ storeImg } storeName={ storeName } storeDesc={ storeDesc } storeContactNum={ storeContactNum }
                                        storeAddress={ storeAddress } storeCity={ storeCity } storeProvince={ storeProvince }
                                        storeZipCode={ storeZipCode } storeCountry={ storeCountry } show={ show } onClose={ closeModal }>
                            
                            <h2 className="text-lg font-bold">Build Store</h2>

                            <div className="flex justify-center pt-2">
                                { !storeImgEdit ?
                                    newStoreImg ?
                                    <img className={ `h-20 ${ innerWidth >=400 ? 'w-[118px]' : 'w-[92px]' }` }
                                        src={ newStoreImg } alt="new_store_img" />
                                    :
                                    <img className={ `h-20 ${ innerWidth >=400 ? 'w-[118px]' : 'w-[92px]' }` }
                                        src={ insert_photo } alt="insert_photo" /> 
                                    :
                                    newStoreImg ? '' :
                                    <img className={ `h-20 ${ innerWidth >=400 ? 'w-[118px]' : 'w-[92px]' }` }
                                        src={ newStoreImg } alt="new_store_img_edit" />
                                }
                            </div>

                            {/* Croppie element for cropping */}
                            <div className='flex justify-center'>
                                <div ref={ croppieRef }></div>
                            </div>

                            <div className='flex justify-center'>
                                { !storeImgEdit ? 
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
                            
                            { !storeImgEdit &&
                                <div className='items-center mt-2'>
                                    <input 
                                        className='border-2 p-2 mt-2 bg-white-100 w-full'
                                        type="text" 
                                        placeholder="Store Name" 
                                        onChange={(e) => setStoreName(e.target.value)}
                                    />
                                    <textarea 
                                        className='border-2 p-2 mt-2 bg-white-100 w-full'
                                        type="text" 
                                        placeholder="Description" 
                                        rows={1}
                                        onChange={(e) => setStoreDesc(e.target.value)}
                                    />
                                    <div className='mt-1 flex flex-cols'>
                                        <p className='p-2'>+63</p>
                                        <input 
                                            className='border-2 p-2 bg-white-100 w-full'
                                            type="tel" 
                                            maxLength="10"
                                            placeholder="Contact Number" 
                                            onChange={(e) => setStoreContactNum(e.target.value)}
                                        />
                                    </div>
                                    <textarea 
                                        className='border-2 p-2 mt-2 bg-white-100 w-full'
                                        type="text" 
                                        placeholder="Address" 
                                        rows={2}
                                        onChange={(e) => setStoreAddress(e.target.value)}
                                    />
                                    <input 
                                        className='border-2 p-2 mt-2 bg-white-100 w-full'
                                        type="text" 
                                        placeholder="City" 
                                        onChange={(e) => setStoreCity(e.target.value)}
                                    />
                                    {/* <input 
                                        className='border-2 p-2 mt-2 bg-white-100 w-full'
                                        type="text" 
                                        placeholder="Province" 
                                        onChange={(e) => setStoreProvince(e.target.value)}
                                    /> */}
                                    <input 
                                        className='border-2 p-2 mt-2 bg-white-100 w-full'
                                        type="tel" 
                                        placeholder="Zip Code" 
                                        onChange={(e) => setStoreZipCode(e.target.value)}
                                    />
                                    <input 
                                        className='border-2 p-2 mt-2 bg-white-100 w-full'
                                        type="text" 
                                        // placeholder="Country" 
                                        // onChange={(e) => setStoreCountry(e.target.value)}
                                        placeholder="Philippines" 
                                        disabled={ true }
                                    />
                                </div>
                            }
                        </ModalMyStore>

                        <ModalDelegate otp={ otp } show={ showPin } onClose={ closeModalPin }>
                            <h2 className="text-lg font-bold">Delegate Pin</h2>
                            <OtpInput
                                value={otp}
                                onChange={setOtp}
                                numInputs={4}
                                renderSeparator={<span>-</span>}
                                renderInput={(props) => <input {...props} />}
                                containerStyle="otp-container"
                                inputStyle="otp-input"
                            />
                        </ModalDelegate>

                        <ModalUnDelegate unOtp={ unOtp } show={ showUnPin } onClose={ closeModalUnPin }>
                            <h2 className="text-lg font-bold">UnDelegate Pin</h2>
                            <OtpInput
                                value={unOtp}
                                onChange={setUnOtp}
                                numInputs={4}
                                renderSeparator={<span>-</span>}
                                renderInput={(props) => <input {...props} />}
                                containerStyle="otp-container"
                                inputStyle="otp-input"
                            />
                        </ModalUnDelegate>

                        <div className='mb-20'/>

                    </div>
                    :
                    < ValidationBeforeRegister />
                }
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
            
            < NavbarMobile /> 
        </>
    )
}

export default MyStore
