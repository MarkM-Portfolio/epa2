import Cookies from 'universal-cookie'
import axios from 'axios'
// import gcash from '../../../assets/gcash.png'
// import maya from '../../../assets/maya.png'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { FaVault } from 'react-icons/fa6'
import { TbCurrencyPeso } from 'react-icons/tb'
import epa_logo from '../../../assets/logo.png'
// import { Radio, RadioGroup, FormControlLabel } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'

const EpaVault = () => {

    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    // const [ store, setStore ] = useState('')
    // const [ withdraw, setWithdraw ] = useState('')
    // const [ payment, setPayment ] = useState('gcash')
    const [ amount, setAmount ] = useState('')

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

    // useEffect(() => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     axios.get(`/api/store/${ process.env.EPA_ACCT_ID }`, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json',
    //             'X-Api-Key': process.env.API_KEY
    //         },
    //         data: { cancelToken: source.token }
    //     }).then(res => {
    //         console.log('Success OK: ', res.status)
    //         setStore(res.data.store)
    //     }).catch((err) => {
    //         if (axios.isCancel(err)) console.log('Successfully Aborted')
    //         else console.error(err)
    //     })

    //     return () => { source.cancel() }
    // }, [])

    const convertEpaVault = async(e) => {

        if (amount) {
            e.preventDefault()
            e.currentTarget.disabled = true
        }

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/load/convert-epavault/${ user.id }`, { 'amount': amount }, {
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
                window.location.reload()
            }, 1000)
            return res
        }).catch((err) => {
            if (axios.isCancel(err)) {
                console.log('Successfully Aborted')
                toast.error(err.response.data.error)
            } else if (err.response.status === 422) { // response >> validation errors
                console.log('Validation Error: ', err.response.status)
                setAmount('')
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

    const goBack = () => {
        navigate(-1)
    }

    // let channel = ''
    
    // if (payment === 'gcash')
    //     channel = 'gcash'

    // if (payment === 'maya')
    //     channel = 'maya'

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
                        {/* <FaVault className='fill-orange-500' /> */}
                        <img className='h-8 w-8' src={ epa_logo } />
                    <h1 className='text-2xl text-center font-semibold mb-10 pl-1'> Vault</h1>
                </div>

                <div className='-mt-7 mb-7 flex flex-cols justify-center font-semibold text-xs gap-2 rounded-1xl text-center'>
                    <p className='font-normal'>EPA Vault Earns 1.5% Interest Per Month</p>
                </div>
                <hr />

                <div className='p-4 m-2 rounded bg-gray-100 flex justify-between'>
                    <div className='flex items-center gap-2'>
                        <p className='text-gray-400 font-semibold'>Balance</p>
                        <div className='flex items-center font-semibold'>
                            <TbCurrencyPeso color='red'/>
                            <p>{ currentUser.epavault && String(parseFloat(currentUser.epavault.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                        </div>
                    </div>

                    {/* <div className='flex gap-1'> */}
                    {/* <button onClick={ () => setWithdraw(true) } className='text-sm py-2 px-4 rounded bg-red-500 text-white hover:font-semibold'>Withdraw</button> */}
                    {/* </div> */}
                </div>
            
            </div>

            <div className='p-4 m-2 rounded bg-gray-100 flex justify-between'>
                <div className='flex items-center gap-2'>
                    <p className='text-gray-400 font-semibold'>EPA Cash Vault</p>
                    <div className='flex items-center font-semibold'>
                        <TbCurrencyPeso color='red'/>
                        <p>{ currentUser.epavault && currentUser.ecomVault && String((parseFloat(currentUser.epavault.$numberDecimal) - parseFloat(currentUser.ecomVault.$numberDecimal)).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                    </div>
                </div>
            </div>

            <div className='p-4 m-2 rounded bg-gray-100 flex justify-between'>
                <div className='flex items-center gap-2'>
                    <p className='text-gray-400 font-semibold'>E-Commerce Vault</p>
                    <div className='flex items-center font-semibold'>
                        <TbCurrencyPeso color='red'/>
                        <p>{ currentUser.ecomVault && String(parseFloat(currentUser.ecomVault.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                    </div>
                </div>
            </div>

            { user.role === 'admin' && user.id === process.env.EPA_ACCT_ID && (
                <>
                    <hr />

                    <div className="flex justify-between rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                        <div className='ml-4 mt-5'>
                            <p className='text-gray-400 pb-2'>Send EPA Vault to EPA Cash</p>
                            <div className='flex items-center'>
                                <TbCurrencyPeso size={ 20 } color='red' />
                                <input type="number" value={ amount } onChange={(e) => { setAmount(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder='Enter amount to EPA Cash' />
                                <button disabled={ !amount } onClick={ (e) => convertEpaVault(e) } className='text-sm py-2 px-4 rounded shadow-md bg-orange-400 text-white hover:font-semibold hover:bg-red-700'>Send</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

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

export default EpaVault
