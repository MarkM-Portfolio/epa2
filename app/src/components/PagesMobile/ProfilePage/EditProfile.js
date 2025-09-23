import Cookies from 'universal-cookie'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Croppie from 'croppie'
import 'croppie/croppie.css'
import { useRef, useState, useEffect } from 'react'
import { FaArrowAltCircleLeft, FaCamera } from 'react-icons/fa'
import { NavLink, useNavigate } from 'react-router-dom'
import { FormControl, Select, MenuItem } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const EditProfile = () => {
    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ avatar, setAvatar ] = useState(null)
    const [ newAvatar, setNewAvatar ] = useState(null)
    const [ name, setName ] = useState('')
    const [ mobilenum, setMobilenum ] = useState('')
    const [ gender, setGender ] = useState('')
    const [ birthday, setBirthday ] = useState(new Date())

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
                setGender(res.data.user.gender)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user ])

    useEffect(() => {
        let fileReader, isCancel = false
        
        if (avatar) {
            fileReader = new FileReader()
            fileReader.onload = (e) => {
                const { result } = e.target
                if (result && !isCancel)
                    setNewAvatar(result)
                }
                fileReader.readAsDataURL(avatar)
        }

        return () => {
            isCancel = true
            if (fileReader && fileReader.readyState === 1)
                fileReader.abort()
        }
    }, [ avatar ])

    useEffect(() => {
        if (newAvatar) {
            newAvatar.destroy()
            setNewAvatar(null)
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
                        viewport: { width: 200, height: 200, type: 'circle' },
                        boundary: { width: 300, height: 300 },
                        showZoomer: true,
                        enableResize: true,
                        enableOrientation: true
                    })
                    croppie.bind({ url: e.target.result }).then(() => {
                        console.log('Image edit bound')
                    })
                    setNewAvatar(croppie)
                    // console.log('Croppie edit bound', croppie)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const handleFileSave = async (e) => {
        e.preventDefault()
        e.currentTarget.disabled = true

        let croppedImageBlob = null

        if (newAvatar) {
            croppedImageBlob = await newAvatar.result({
                type: 'blob',
                size: 'viewport',
                format: 'image/jpeg, image/jpg, image/png'
            })
        }

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const fullname = name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').trim().replace(/\s\s+/g, ' ') // format name input

        const formData = new FormData()
        // formData.append('avatar', avatar ? avatar : currentUser.avatar)
        formData.append('avatar', croppedImageBlob ? croppedImageBlob : currentUser.avatar)
        formData.append('name', name ? fullname : currentUser.name)
        formData.append('mobilenum', mobilenum ? mobilenum : currentUser.mobilenum)
        formData.append('gender', gender ? gender : currentUser.gender)
        formData.append('birthday', birthday ? birthday : currentUser.birthday)

        await axios.put(`/api/user/editprofile/${ user.id }`, formData, {
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
                navigate('/profile')
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
                <div className='bg-gray-200 pb-12'>
                    <div className='flex justify-between items-center px-6 pt-10'>
                        <NavLink to="/profile">
                            <FaArrowAltCircleLeft className='text-4xl' />
                        </NavLink>
                        <h1 className='text-lg font-semibold ml-11'>Edit Profile</h1>
                        <button className='outline outline-offset-2 outline-emerald-500 w-16 rounded text-center' onClick={ (e) => handleFileSave(e) }>
                            <p className='font-semibold'>Save</p>
                        </button>
                    </div>

                    <div className='mt-10 px-6'>
                        <div className="flex justify-center">
                            { !newAvatar ?
                                currentUser.avatar ?
                                    <img className="w-36 h-36 rounded-full"
                                        src={ window.location.origin + '/private/avatar/' + currentUser.avatar } alt="Rounded avatar"
                                    />  :
                                    avatar ? 
                                        <img className="w-36 h-36 rounded-full"
                                            src={ avatar } alt="Rounded avatar" />
                                    :
                                        <img className="w-36 h-36 rounded-full"
                                            src="https://static-00.iconduck.com/assets.00/avatar-default-symbolic-icon-2048x1949-pq9uiebg.png" alt="Rounded avatar" />
                                :
                                ''
                            }
                        </div>

                        {/* Croppie element for cropping */}
                        <div className='flex justify-center pt-4'>
                            <div ref={ croppieRef }></div>
                        </div>

                        <div className='flex justify-center pt-4'>
                            { !newAvatar ? 
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
                                <div>
                                    <button className='outline outline-offset-2 outline-red-400 w-16 rounded text-center' onClick={ () => { newAvatar.destroy(), setNewAvatar(null) } }>
                                        <p className='text-xs'>Cancel</p>
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <div className='px-6 mt-12'>
                    <div>
                        <h1 className='pb-2'>Full Name</h1>
                        <input className='border-b w-full'
                            type="text"
                            onChange={ (e) => setName(e.target.value) }
                            placeholder={ currentUser.name }
                        />
                    </div>
                    <div className='pt-4'>
                        <h1 className='pb-2'>Mobile Number</h1>
                        <div className='flex flex-cols gap-2'>
                            <p>+63</p>
                            <input className='border-b w-full' 
                                type="tel"
                                maxLength="10" 
                                onChange={ (e) => setMobilenum(e.target.value) }
                                placeholder={ currentUser.mobilenum }
                            />
                            </div>
                    </div>
                    { user.gender === '' || currentUser.gender === '' && (
                        <div className='pt-4'>
                            <FormControl sx={{ m: 0, minWidth: 150 }} size="small">
                                <h1 className='pb-2'>Gender</h1>
                                <Select
                                    labelId="gender-select-label"
                                    id='gender-select'
                                    value={ gender }
                                    label="Gender"
                                    onChange={ (e) => setGender(e.target.value) }
                                >
                                    <MenuItem value='male'>Male</MenuItem>
                                    <MenuItem value='female'>Female</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    )}
                    <div className='pt-4'>
                        <h1 className='pb-2'>Date of Birth</h1>
                        {/* <input className='border-b w-full' 
                            type="text"
                            onChange={ (e) => setBirthday(e.target.value) }
                            placeholder={ currentUser.birthday }
                        /> */}
                        <DatePicker
                            showIcon
                            selected={ birthday }
                            onChange={(date) => setBirthday(date)}
                            icon="fa fa-calendar"
                        />
                    </div>
                </div>
            </div>

            <div className='mb-20'/>

            <ToastContainer
                position='bottom-center'
                autoClose={ 3000 }
                hideProgressBar={ false }
                newestOnTop={ false }
                closeOnClick
                rtl={ false }
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme='colored'
            />
        </>
    )
}

export default EditProfile
