import Cookies from 'universal-cookie'
import axios from 'axios'
import epa_logo from '../../../assets/logo.png'
import epa_coin from '../../../assets/epa-coin.gif'
import moment from 'moment'
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { IoMdClose } from 'react-icons/io'
import { FaCheckCircle } from 'react-icons/fa'
// import { FaPesoSign } from 'react-icons/fa6'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Receipt = () => {
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const { state } = useLocation()
    // const [ sender, setSender ] = useState()
    // const [ approved, setApproved ] = useState('')

    // useEffect(() => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     if (user && user.id) {
    //         axios.get(`/api/user/${ state.owner }`, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json',
    //                 'X-Api-Key': process.env.API_KEY
    //             },
    //             data: { cancelToken: source.token }
    //         }).then(res => {
    //             console.log('Success OK: ', res.status)
    //             setSender(res.data.user)
    //         }).catch((err) => {
    //             if (axios.isCancel(err)) console.log('Successfully Aborted')
    //             else console.error(err)
    //         })
    //         return () => { source.cancel() }
    //     }
    // }, [ user ])

    const confirmIOU = async (e, isApproved) => {
        e.preventDefault()
        e.currentTarget.disabled = true

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/load/send-iou/${ user.id }`, { isApproved: isApproved }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            if (isApproved) toast.success('EPA Cash Sent via IOU Approved!')
            else toast.success('EPA Cash Sent via IOU Rejected!')
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
            <div className='h-screen font-montserrat lg:hidden bg-emerald-400'>
                {/* Receipt */}
                <div className='bg-emerald-400'>
                    <div className='mx-6 py-6'>
                        { state.isIouConfirmed ? 
                            <div>
                                <div className='flex items-center justify-between pb-20'>
                                    <NavLink to='/epawallet'>
                                        <IoMdClose size={ 30 } className='fill-white'/>                                             
                                    </NavLink>
                                    <p className='text-white font-bold text-xl'>Express Send</p>                                           
                                    <div className='pr-6'></div>
                                </div>
                                <div className='px-5 pb-10 border rounded-xl bg-white relative'>
                                    <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                                        <FaCheckCircle size={ 50 } className='rounded-full border-solid border-4 border-white fill-emerald-400' />
                                    </div>
                                    <div className='mt-12'>
                                        <p className='text-xl font-semibold text-center text-emerald-400'>{ state.recipient }</p>
                                        <p className='text-center'>{ state.mobilenum }</p>
                                        <p className='text-center'>{ state.email }</p>
                                        <p className='text-center text-gray-400'>Sent via EPA Cash</p>
                                    </div>
                                    <hr className='mt-4' />
                                    <div className='py-4 flex justify-between items-center'>
                                        <p>Amount</p>
                                        <div>{ String(parseFloat(state.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                    </div>
                                    <hr />
                                    <div className='mt-4 py-4 flex justify-between items-center pb-20'>
                                        <p>Total Amount { state.owner === user.id ? 'Sent' : 'Received' }</p>
                                        <div className='flex gap-1 items-center'>
                                            {/* <FaPesoSign size={ 22 } color='red' /> */}
                                            <img src={ epa_coin } className='epacoin' alt="epacoin" />
                                            <p className='text-2xl'>{ String(parseFloat(state.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                        </div>
                                    </div>
                                    <div className='mt-6'>
                                        <p className='text-gray-400 text-sm text-center'>{ state.sender }</p>
                                        <p className='text-gray-400 text-sm text-center'>Ref No. <span className='text-emerald-400'>{ state.refnum }</span></p>
                                        <p className='text-sm text-center'>{ moment(state.createdAt).format('MM/DD/YYYY hh:mm A') }</p>
                                    </div>
                                </div>
                            </div>
                            :
                            <div>
                                <div className='flex items-center justify-between pb-20'>
                                    <NavLink to='/epawallet'>
                                        <IoMdClose size={ 30 } className='fill-white'/>                                             
                                    </NavLink>
                                    <p className='text-white font-bold text-xl'>I O U Approval</p>                                           
                                    <div className='pr-6'></div>
                                </div>
                                <div className='px-5 pb-10 border rounded-xl bg-white relative'>
                                    <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                                        <FaCheckCircle size={ 50 } className='rounded-full border-solid border-4 border-white fill-emerald-400' />
                                    </div>
                                    <div className='mt-12'>
                                        <p className='text-xl font-semibold text-center text-emerald-400'>{ state.recipient }</p>
                                        <p className='text-center'>{ state.mobilenum }</p>
                                        <p className='text-center text-gray-400'>For Confirmation</p>
                                    </div>
                                    <hr className='mt-4' />
                                    <div className='py-4 flex justify-between items-center'>
                                        <p>Loan Amount</p>
                                        <div>{ String(parseFloat(state.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                    </div>
                                    <div className='pb-4 flex justify-between items-center'>
                                        <p>Interest Rate</p>
                                        <div>{ state.interest.$numberDecimal } %</div>
                                    </div>
                                    <div className='pb-4 flex justify-between items-center'>
                                        <p>Terms</p>
                                        <div>{ state.terms } { state.terms > 0 ? state.duration + 's' : state.duration }</div>
                                    </div>
                                    <div className='pb-4 flex justify-between items-center'>
                                        <p>Payables</p>
                                        <div className='text-red-500'>{ String(parseFloat(state.amount.$numberDecimal * ( state.interest.$numberDecimal / 100 ) + Number(state.amount.$numberDecimal)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                    </div>
                                    <hr />
                                    <div className='mt-4 py-4 flex justify-between items-center pb-20'>
                                        <p>Total Amount to { state.owner === user.id ? 'Send' : 'Receive' }</p>
                                        <div className='flex gap-1 items-center'>
                                            {/* <FaPesoSign size={ 22 } color='red' /> */}
                                            <img src={ epa_coin } className='epacoin' alt="epacoin" />
                                            <p className='text-2xl'>{ String(parseFloat(state.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                        </div>
                                    </div>
                                    <div className='flex gap-4 justify-center'>
                                        <button onClick={ (e) => { confirmIOU(e, true) } } className='text-sm py-2 px-4 rounded bg-blue-400 text-white hover:font-semibold'>Approve</button>
                                        <button onClick={ (e) => { confirmIOU(e, false) } } className='text-sm py-2 px-4 rounded bg-red-500 text-white hover:font-semibold'>Reject</button>
                                    </div>
                                    <div className='mt-6'>
                                        <p className='text-gray-400 text-sm text-center'>{ state.sender }</p>
                                        <p className='text-gray-400 text-sm text-center'>Ref No. <span className='text-emerald-400'>{ state.refnum }</span></p>
                                        <p className='text-sm text-center'>{ moment(state.createdAt).format('MM/DD/YYYY hh:mm A') }</p>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <h3 className='flex flex-cols gap-2 justify-center mb-5 text-4xl font-bold font-montserrat'>
                    <img src={ epa_logo } className='w-10 h-10' alt="EPA" />
                    <div>EPA<span className='text-orange-600'>.</span><span className='text-2xl font-semibold py-2'></span></div>
                </h3>  
            </div>

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
        </>
    )
}

export default Receipt
