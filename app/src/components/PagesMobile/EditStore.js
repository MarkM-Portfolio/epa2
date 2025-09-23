import axios from 'axios'
import { NavLink, useLocation } from 'react-router-dom'
import { FaArrowAltCircleLeft, FaCamera } from 'react-icons/fa'
import { useRef, useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// NOTE: Add URL lock for this page
const EditStore = () => {

    const { state } = useLocation()
    const [ storeImg, setStoreImg ] = useState('')
    const [ newStoreImg, setNewStoreImg ] = useState(null)
    const [ storeName, setStoreName ] = useState(state.name)
    const [ storeDesc, setStoreDesc ] = useState(state.description)
    const [ storeContact, setStoreContact ] = useState(state.contactnumber)
    const [ storeAddress, setStoreAddress ] = useState(state.address)
    const [ storeCity, setStoreCity ] = useState(state.city)
    const [ storeProvince, setStoreProvince ] = useState(state.province)
    const [ storeZipCode, setStoreZipCode ] = useState(state.zipcode)
    const [ storeCountry, setStoreCountry ] = useState(state.country)

    const fileInputRef = useRef(null)

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
        formData.append('stores', storeImg ? storeImg : state.image)
        formData.append('name', storeName ? storeName : state.name)
        formData.append('description', storeDesc ? storeDesc : state.description)
        formData.append('contactnumber', storeContact ? storeContact : state.contactnumber)
        formData.append('address', storeAddress ? storeAddress : state.address)
        formData.append('city', storeCity ? storeCity : state.city)
        formData.append('province', storeProvince ? storeProvince : state.province)
        formData.append('zipcode', storeZipCode ? storeZipCode : state.zipcode)
        formData.append('country', storeCountry ? storeCountry : state.country)

        await axios.put(`/api/store/editstore/${ state._id }`, formData, {
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
                window.location.href= '/mystore'
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
                        <NavLink to='/mystore'>
                            <FaArrowAltCircleLeft className='text-4xl'/>
                        </NavLink>
                        <h1 className='text-lg font-semibold ml-11'>Edit Store</h1>
                        <button className='outline outline-offset-2 outline-emerald-500 w-16 rounded text-center' onClick={ handleFileSave }>
                            <p className='font-semibold'>Save</p>
                        </button>
                    </div>

                    <div className='flex justify-center items-center'>
                        { storeImg && newStoreImg ?
                            <img className="scale-75"
                                src={ newStoreImg }
                                alt="insert_photo" /> 
                            :
                            <img className='scale-75'
                                src={ window.location.origin + '/public/stores/' + state.image } 
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
                            onChange={ (e) => setStoreImg(e.target.files[0]) }
                        />
                    </div>
                </div>

                <div className='px-6 mt-12'>
                    <div className='flex justify-between'>
                        <input className='font-bold text-2xl w-full'
                            type="text"
                            onChange={ (e) => setStoreName(e.target.value) }
                            placeholder={ state.name }
                            value={ storeName }
                        />
                    </div>
                    
                    <hr />

                    <div className='mt-4'>
                        <h1 className='pb-2'>Description</h1>
                        <textarea 
                            className='border-2 p-2 mt-2 bg-white-100 w-full'
                            type="text" 
                            placeholder={ state.description } 
                            value={ storeDesc }
                            rows={4}
                            onChange={ (e) => setStoreDesc(e.target.value)}
                        />
                        <h1 className='pb-2 mt-2'>Contact Number</h1>
                        <div className='mt-1 flex flex-cols'>
                            <p className='p-2'>+63</p>
                            <input 
                                className='border-2 p-2 bg-white-100 w-full'
                                type="tel"
                                maxLength="10"
                                placeholder={ state.contactnumber }
                                value={ storeContact }
                                onChange={ (e) => setStoreContact(e.target.value)}
                            />
                        </div>
                        <h1 className='pb-2 mt-2'>Address</h1>
                        <input 
                            className='border-2 p-2 mt-2 bg-white-100 w-full'
                            type="text" 
                            placeholder={ state.address }
                            value={ storeAddress }
                            onChange={ (e) => setStoreAddress(e.target.value)}
                        />
                        <h1 className='pb-2 mt-2'>City</h1>
                        <input 
                            className='border-2 p-2 mt-2 bg-white-100 w-full'
                            type="text" 
                            placeholder={ state.city }
                            value={ storeCity }
                            onChange={ (e) => setStoreCity(e.target.value)}
                        />
                        <h1 className='pb-2 mt-2'>Province</h1>
                        <input 
                            className='border-2 p-2 mt-2 bg-white-100 w-full'
                            type="text" 
                            placeholder={ state.province }
                            value={ storeProvince }
                            onChange={ (e) => setStoreProvince(e.target.value)}
                        />
                        <h1 className='pb-2 mt-2'>Zip Code</h1>
                        <input 
                            className='border-2 p-2 mt-2 bg-white-100 w-full'
                            type="tel" 
                            placeholder={ state.zipcode }
                            value={ storeZipCode }
                            onChange={ (e) => setStoreZipCode(e.target.value)}
                        />
                        <h1 className='pb-2 mt-4'>Country</h1>
                        <input 
                            className='border-2 p-2 mt-2 bg-white-100 w-full'
                            type="text" 
                            // placeholder={ state.country }
                            // value={ storeCountry }
                            // onChange={ (e) => setStoreCountry(e.target.value)}
                            placeholder="Philippines" 
                            disabled={ true }
                        />
                    </div>
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

export default EditStore
