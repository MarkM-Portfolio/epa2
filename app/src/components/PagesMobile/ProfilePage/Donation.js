import NavbarMobile from '../../MobileView/NavbarMobile'
import Cookies from 'universal-cookie'
import axios from 'axios'
import uhw_logo from '../../../assets/uhw_logo.png'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { Switch, FormGroup, FormControlLabel } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Donation = () => {
    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ checked, setChecked ] = useState(false)

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
                setChecked(res.data.user.isAutoDonateUhw)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user ])

    // useEffect(() => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     if (user && user.id) {
    //         axios.get(`/api/load`, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json',
    //                 'X-Api-Key': process.env.API_KEY
    //             },
    //             data: { cancelToken: source.token }
    //         }).then(res => {
    //             console.log('Success OK: ', res.status)
    //             // if (res.data.loads.filter(item => item.sender.includes(user.name)))
    //             setLedger(res.data.loads)
    //         }).catch((err) => {
    //             if (axios.isCancel(err)) console.log('Successfully Aborted')
    //             else console.error(err)
    //         })
    //         return () => { source.cancel() }
    //     }
    // }, [ user ])

    const goBack = () => {
        navigate(-1)
    }

    const toggleSwitch = async (e) => {
        setChecked(e.target.checked)

        let isChecked = !checked

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/user/donation-uhw/${ user.id }`, { isChecked: isChecked }, {
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
                window.location.href= '/epawallet'
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
                <div className='px-6 mt-10'>
                    <div className='flex items-center gap-2'> 
                        <div className='grid grid-cols-2 font-bold font-montserrat'>
                            <FaArrowAltCircleLeft onClick={ () => goBack() } className='text-4xl'/>
                        </div>   
                    </div>
                    </div>
                    <div className='flex justify-center gap-2 text-3xl -mt-7'>
                        <img src={ uhw_logo } className='w-12 h-12' alt="logo" />
                        <h1 className='text-2xl text-center font-semibold mt-2 pl-1'>UHW </h1>
                    </div>

                    <h1 className='text-1xl text-center mb-10 font-semibold'>Tights & Donations </h1>
                <hr />

                <div className='p-3 shadow-md'>
                    <div className='p-4 border-2 border-dashed border-amber-700 rounded-xl flex justify-between text-md text-wrap shadow-lg animate-text bg-gradient-to-r from-gray-500 via-black to-gray-500 bg-clip-text text-transparent'>
                        Welcome to the Universal House of Worship (UHW), proudly partnered with Ecology Peoples Amenities (EPA). UHW is a charitable organization dedicated to fostering the spiritual development of EPA subscribers. Our collaboration with EPA reflects a commitment to environmental stewardship and holistic well-being. At UHW, we embrace diversity and provide a welcoming space for individuals seeking spiritual enrichment. Together with EPA, we aim to create a harmonious balance between spiritual growth and ecological consciousness. Join us in our mission to cultivate a community that values both inner fulfillment and environmental sustainability. Welcome to a place where spirituality and ecology converge for a brighter, more interconnected future.
                    </div>
                </div>

                <div className="bg-gray-200 pb-3" />

                <FormGroup>
                    <div className='px-6 flex flex-cols items-center justify-center'>
                        <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                            <p>Auto Donate Quota Difference</p>
                            <FormControlLabel control={ <Switch checked={ checked } onChange={ toggleSwitch } inputProps={{ 'aria-label': 'controlled' }} /> } />
                        </div>
                    </div>
                </FormGroup>

                <div className='px-10 mt-3 flex flex-cols justify-center font-semibold text-xs gap-2 rounded-1xl text-center'>
                    <p className='font-normal'>Turning off the Auto-Donate will have a risk for suspension of account.</p>
                </div>

            </div>

            <div className='mb-20'/>

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

            <NavbarMobile />
        </>
    )
}

export default Donation
