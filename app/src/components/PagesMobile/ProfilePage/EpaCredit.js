import Cookies from 'universal-cookie'
import axios from 'axios'
import Countdown from 'react-countdown'
import moment from 'moment'
import epa_coin from '../../../assets/epa-coin.gif'
import epa_logo from '../../../assets/logo.png'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowAltCircleLeft, FaRegCreditCard } from 'react-icons/fa'
import { TbCurrencyPeso } from 'react-icons/tb'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const EpaCredit = () => {

    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    // const [ amount, setAmount ] = useState('')

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

    const goBack = () => {
        navigate(-1)
    }

    // const sendEpaCash = async(e) => {

    //     if (amount) {
    //         e.preventDefault()
    //         e.currentTarget.disabled = true
    //     }

    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     await axios.put(`/api/user/convert-epacash/${ user.id }`, { 'amount': amount }, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json',
    //             'X-Api-Key': process.env.API_KEY
    //         },
    //         data: { cancelToken: source.token }
    //     }).then(res => {
    //         console.log('Success OK: ', res.status)
    //         toast.success(res.data.message)
    //         setTimeout(() => {
    //             window.location.reload()
    //         }, 1000)
    //         return res
    //     }).catch((err) => {
    //         if (axios.isCancel(err)) {
    //             console.log('Successfully Aborted')
    //             toast.error(err.response.data.error)
    //         } else if (err.response.status === 422) { // response >> validation errors
    //             console.log('Validation Error: ', err.response.status)
    //             setAmount('')
    //             toast.error(err.response.data.error)
    //         } else if (err.response.status === 403) { // response >> headers forbidden
    //             console.log('Forbidden: ', err.response.status)
    //             toast.error(err.response.data.error)
    //         } else { // response >> server/page not found 404,500
    //             console.log('Server Error: ', err.response.status)
    //             toast.error(err.response.data.error)
    //         }
    //         return err
    //     })
    // }

    const getNextMonth = () => {
        const today = new Date()
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0)
        
        return lastDayOfMonth.getTime()
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
                        <img className='h-8 w-8' src={ epa_logo } />
                    <h1 className='text-2xl text-center font-semibold mb-10 pl-1'> Credit Line</h1>
                </div>

                <div className='-mt-7 mb-7 flex flex-cols justify-center font-semibold text-xs gap-2 rounded-1xl text-center'>
                    <p className='font-normal'>Credits Used Have 3% Monthly Interest</p>
                </div>
                <hr />
                <hr />

                {/* <div className='p-4 m-2 rounded bg-gray-100 flex justify-between'>
                    <div className='flex items-center gap-2'>
                        <p className='text-gray-400 font-semibold'>Credit Line</p>
                        <div className='flex items-center font-semibold'>
                            <img src={ epa_coin } className='epacoin' alt="epacoin" />
                            <p>{ currentUser.epacredits && String(parseFloat(currentUser.epacredits.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                        </div>
                    </div>
                </div> */}

                <div className='p-4 m-2 rounded bg-gray-100 flex justify-between'>
                    <div className='flex items-center gap-2'>
                        <p className='text-gray-400 font-semibold'>Points used ({ moment().format('MMMM') })</p>
                        <div className='flex items-center font-semibold'>
                            <img src={ epa_coin } className='epacoin' alt="epacoin" />
                            <div className='flex flex-cols'>
                                {/* <p className='text-black'>{`(`}</p>
                                <p className='text-red-400'>{`-`}</p> */}
                                {/* <p className='text-red-400'>{ currentUser.epaCreditsMonth && String(parseFloat(currentUser.epaCreditsMonth.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p> */}
                                {/* <p className='pl-1 text-black'>{`)`}</p> */}
                                <p>{ currentUser.epaCreditsMonth && String(parseFloat(currentUser.epaCreditsMonth.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='p-4 flex flex-cols justify-start font-semibold text-xs gap-2 rounded-1xl'>
                    <p className='font-normal'>Month ends in:</p>
                    <p className='font-semibold text-orange-500'>{ <Countdown date={ getNextMonth() } /> }</p>
                </div>

                <div className='px-4 text-gray-400'>All credits used will be deducted from the vault at the end of the month.</div>

                {/* <div className="flex justify-between rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                    <div className='ml-4 mt-5'>
                        <p className='text-gray-400 pb-2'>Send EPA Cash</p>
                        <div className='flex items-center'>
                            <TbCurrencyPeso size={ 20 } color='red' />
                            <input type="number" value={ amount } onChange={(e) => { setAmount(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder='Enter amount to cash' />
                            <button disabled={ !amount } onClick={ (e) => sendEpaCash(e) } className='text-sm py-2 px-4 rounded shadow-md bg-orange-400 text-white hover:font-semibold hover:bg-red-700'>Send</button>
                        </div>
                    </div>
                </div> */}

                {/* <div>
                    <div className='ml-4 mt-5'>
                        <p className='text-gray-400 pb-2'>Send EPA Cash:</p>
                        <div className='flex items-center'>
                            <input type="number" value={ amount } onChange={(e) => { setAmount(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder='Please enter the amount' />
                        </div>
                    </div>

                    <div className='m-2'>
                    { amount ? 
                        <button onClick={ (e) => sendEpaCash(e) } className='bg-blue-400 mt-3 rounded w-full text-center'>
                            <p className='text-white text-lg font-semibold'>Send to EPA Cash</p>
                        </button>
                        : 
                        <button disabled className='bg-gray-400 mt-3 rounded w-full text-center'>
                            <p className='text-white text-lg font-semibold'>Send to EPA Cash</p>
                        </button>
                    }
                    </div>
                </div> */}

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

export default EpaCredit
