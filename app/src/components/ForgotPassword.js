import Cookies from 'universal-cookie'
import axios from 'axios'
import epa_logo from '../assets/logo.png'
import gpc from 'generate-pincode'
import OtpTimer from 'otp-timer'
// import OtpInput from 'react-otp-input'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { BiCopy } from 'react-icons/bi'
import { isAndroid, isIOS } from "react-device-detect"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const joinGroup = async () => {
    if (isAndroid) {
        const url = "intent://facebook.com/#Intent;scheme=https;package=com.facebook;end"
        window.location.replace(url)
    } else if (isIOS) {
        try {
            window.location.replace("fb://EPAlamboAngMembro")
        }
        catch(err) {
            setTimeout(() => {
                window.location.replace("https://apps.apple.com/ph/app/facebook/id284882215")
            }, 10000)
        }
    } else {
        window.location.replace("https://www.facebook.com/EPAlamboAngMembro/")
    }
}

const ForgotPassword = () => {

    const cookies = new Cookies()
    const [ name, setName ] = useState('')
    const [ email, setEmail ] = useState('')
    const [ pin, setPin ] = useState('')
    const [ confirmOTP, setConfirmOTP ] = useState('')

    const resendOTP = async (e) => {
        const generatePin = gpc(4)

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('email', email)
        formData.append('generatePin', generatePin)

        await axios.post('/api/user/requestpincode', formData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            setName(res.data.otp.name)
            setPin(res.data.otp.pin)
            sendOTPEmail(res.data.otp.name, res.data.otp.pin)
            toast.info(res.data.message)
            return res
        }).catch((err) => {
            if (axios.isCancel(err)) {
                console.log('Successfully Aborted')
                toast.error(err.response.data.error)
            } else if (err.response.status === 422) { // response >> validation errors
                console.log('Validation Error: ', err.response.status)
                setEmail('')
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

    const sendOTP = async (e) => {
        e.preventDefault()
        e.currentTarget.disabled = true
        
        resendOTP()
    }

    const sendOTPEmail = async (userName, pinCode) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('userName', userName)
        formData.append('email', email)
        formData.append('pinCode', pinCode)

        await axios.post('/api/user/sendotpemail', formData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.API_KEY
          },
          data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.success(res.data.message)
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
    
    const confirmPIN = async (e) => {
        e.preventDefault()
        e.currentTarget.disabled = true

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.get(`/api/user/confirmpincode/${ email }`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY,
                'Otp': confirmOTP
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Status OK: ', res.status)
            cookies.set('email', email)
            cookies.set('resetToken', res.data.otp.token)
            toast.success(res.data.message)
            setTimeout(() => {
                window.location.href='/resetpassword'
            }, 2000)
            return res
        }).catch((err) => {
            if (axios.isCancel(err)) {
                console.log('Successfully Aborted')
                toast.error(err.response.data.error)
            } else if (err.response.status === 422) { // response >> validation errors
                console.log('Validation Error: ', err.response.status)
                setConfirmOTP('')
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
            <div className="h-screen bg-gradient-to-r from-emerald-300 to-lime-300 flex items-center justify-center text-gray-600">
            <div className="px-8 py-6 mt-4 text-left -translate-y-32">
                <h3 className='flex mb-5 text-4xl font-bold font-montserrat'><img src={ epa_logo } className='w-10 h-10 mr-3' alt="EPA" />EPA<span className='text-orange-600'>.</span><span className='text-2xl font-semibold py-2'></span></h3>   
                <div className='px-8 py-6 mt-4 shadow-lg bg-emerald-100'>
                <h3 className={ `${ pin ? 'mt-10' : ''} text-2xl font-bold text-center` }>Forgot Password</h3>
                    
                    <form onSubmit={ (e) => sendOTP(e) } className='p-2'>
                        <div className='text-center'>
                            <br />
                            <input 
                                className='border-2 p-2 bg-purple-100'
                                id="email"
                                name="email"
                                placeholder="Email" 
                                onChange={(e) => setEmail(e.target.value)}
                                value={ email }
                            />
                        </div>
                        <div className='mt-4 text-center'>
                            <button disabled={ pin } className={ `${ pin ? 'bg-gray-400' : 'bg-blue-500 hover:bg-red-700' } text-white font-bold py-2 px-4 rounded mt-1` }>Send OTP</button>
                        </div>
                        <div className='mt-2 text-center'>
                            { !pin ? 
                                <p>Request for OTP Code</p>
                                :
                                <span className="text-gray-800 items-center">{ <OtpTimer minutes={4} seconds={59} text='Time Remaining :' ButtonText='Resend OTP' resend={ resendOTP } /> }</span>
                            }
                        </div>
                    </form>

                    { pin ? 
                    <form onSubmit={ confirmPIN } className='p-2'>
                        <div className='-mt-2 text-center'>
                            <br />
                            <input 
                                className='border-2 p-2 bg-purple-100'
                                type="tel"
                                minLength="4"
                                maxLength="4" 
                                placeholder="PIN Code" 
                                onChange={(e) => setConfirmOTP(e.target.value)}
                                value={ confirmOTP }
                            />
                            {/* <OtpInput
                            value={confirmOTP}
                            onChange={setConfirmOTP}
                            numInputs={4}
                            renderSeparator={<span>-</span>}
                            renderInput={(props) => <input {...props} />}
                            /> */}
                        </div>
                        <div className='mt-2 text-center'>
                            <button className='bg-blue-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2'>Confirm PIN</button>
                        </div>
                    </form>
                        :
                        ''
                    }
                    { pin ? 
                    <div>
                        <div className='mt-2 text-center'>
                            <p>Please check your email</p>
                            <p>For One-Time-PIN passcode</p>
                            <br />
                            <p>OTP expires in 5 minutes</p>
                            <br />
                            <p className='font-semibold text-red-500'>NOTE: Did not received OTP ?</p>
                            <p className='font-sm font-semibold mt-2'>Please contact details below</p>
                        </div>
                        <br />
                        <div className='font-semibold mt-5 text-center'>E-mail EPA Support : <br></br>
                            <div className="flex flex-col gap-2 items-center">
                                <span className='font-semibold mt-4 text-blue-500 flex'>{ process.env.SUPPORT_MX_SERVER }</span>
                            <CopyToClipboard text={ process.env.SUPPORT_MX_SERVER } className='px-1'>
                                <button>< BiCopy /></button>
                            </CopyToClipboard>
                            </div>
                        </div>
                        <div className='flex rounded-2xl text-center'>
                            <div className='font-semibold mt-2'>Official Facebook Page : <br></br>
                                <div className="grid grid-flow-col gap-2">
                                    <button role="link" onClick={ joinGroup }>
                                        <span className='break-all font-semibold mt-4 text-blue-500'>{ `https://www.facebook.com/EPAlamboAngMembro` }</span>
                                    </button>
                                <CopyToClipboard text={ 'https://facebook.com/EPAlamboAngMembro' } className='px-1'>
                                    <button>< BiCopy /></button>
                                </CopyToClipboard>
                                </div>
                            </div>
                        </div>
                    </div>
                        : 
                        ''
                    }
                    <div className='mt-2 text-center'>
                        <Link to='/login' className='underline'>Back to login</Link>
                    </div>
                    </div>
                </div>
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
        </>  
    )
}

export default ForgotPassword
