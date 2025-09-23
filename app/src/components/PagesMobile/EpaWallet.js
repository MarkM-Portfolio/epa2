import NavbarMobile from '../MobileView/NavbarMobile'
import Cookies from 'universal-cookie'
import axios from 'axios'
import Countdown from 'react-countdown'
import moment from 'moment'
import epaCashImg from '../../assets/epacash.png'
import epaCreditsImg from '../../assets/epacredits.png'
import epaVaultImg from '../../assets/epavault.png'
import uhw_logo from '../../assets/uhw_logo.png'
import ValidationBeforeRegister from '../ValidationBeforeRegister'
import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
// import { BsCashCoin } from 'react-icons/bs'
// import { FaRegCreditCard } from 'react-icons/fa'
import { FaVault, FaClone } from 'react-icons/fa6'
// import { TbCurrencyPeso } from 'react-icons/tb'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const EpaWallet = () => {
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ logs, setLogs ] = useState([])
    const [ allowanceJBA, setAllowanceJBA ] = useState('')
    const [ validChildrenCount, setValidChildrenCount ] = useState([])

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
            axios.get(`/api/load/${ user.id }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setLogs(res.data.load.filter(item => item.isIouConfirmed && item.owner.includes(user.id) || item.email.includes(user.email)))
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

        axios.get(`/api/setting`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            setAllowanceJBA(res.data.settings.allowanceJBA)
        }).catch((err) => {
            if (axios.isCancel(err)) console.log('Successfully Aborted')
            else console.error(err)
        })
        return () => { source.cancel() }
    }, [ ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (user && user.id) {
            axios.get(`/api/user/teams/${ user.id }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setValidChildrenCount(res.data.count.childrenCount - res.data.count.childrenMember)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
        }
        return () => { source.cancel() }
    }, [ user ])

    const copyClipboard = () => {
        toast.info('Copied To Clipboard!', {
            position: "top-right",
            autoClose: 500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
        })
    }

    const getNextSaturday = () => {
        const today = new Date()
        const daysUntilSaturday = 6 - today.getDay()
        const nextSaturday = new Date(today)
        nextSaturday.setDate(today.getDate() + daysUntilSaturday + (daysUntilSaturday <= 0 ? 7 : 0))
        nextSaturday.setHours(0, 0, 0, 0)
        return nextSaturday.getTime()
    }

    return (
        <>
        <div className='lg:hidden font-montserrat sticky top-0 z-40 bg-white'>

            <div className='mx-6 mt-10'>
                <h1 className='text-2xl font-semibold text-center mb-6'>EPA Wallet</h1>

                    <div className='pt-1 flex flex-cols justify-start font-semibold text-xs gap-2 rounded-1xl text-center'>
                        {/* <button onClick={ () => setShowEwallet(!currentUser.isSubAccount ? user.eWalletnum : 'Sub Account') } className='text-amber-300 roounded'>{ showEWallet }</button> */}
                        <p className='font-normal'>EPA Wallet ID:</p>
                        <p className='font-medium'>{ user.eWalletnum }</p>
                        <CopyToClipboard text={ user.eWalletnum }>
                            <button onClick={ copyClipboard }><FaClone className='fill-orange-500'/></button>
                        </CopyToClipboard>
                    </div>

                    { currentUser.class !== 'Member' && currentUser.quota && currentUser.quota.$numberDecimal !== '0' && validChildrenCount && allowanceJBA && validChildrenCount >= allowanceJBA &&
                        <div>
                            <div className='flex flex-cols justify-start font-semibold text-xs gap-2 rounded-1xl'>
                                <p className='font-normal'>Qouta Cycle Ends:</p>
                                <p className='font-semibold text-orange-500'>{ <Countdown date={ getNextSaturday() } /> }</p>
                            </div>
                            <div className='flex flex-cols justify-start font-semibold text-xs gap-2 rounded-1xl rounded-flex'>
                                <div className='flex items-center gap-2'>
                                    <p className='font-normal'>Tokens Target:</p>
                                    <div className='flex items-center font-semibold'>
                                        <p className=''>{ String(parseFloat(currentUser.quota.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    <hr className='mt-2'/>
                </div>

                { user.religion || currentUser.religion ? 
                    <div>
                        <div className="mt-4 px-6 pb-4">
                            <div className="inline-flex gap-6 justify-between mt-2 text-center text-[12px] break-word">
                                <NavLink to='/epacash'>
                                    {/* <div><BsCashCoin className="h-12 w-12 fill-orange-400"/>EPA Cash</div> */}
                                    <img className='ml-1 h-16 w-16' src={ epaCashImg } />
                                    EPA Cash
                                </NavLink>
                                { currentUser.class !== 'Member' ?
                                    <div className="inline-flex gap-8 justify-center text-center text-[12px] break-word">
                                        <NavLink to='/epacredit'>
                                            {/* <div><FaRegCreditCard className="h-12 w-14 fill-orange-400"/>EPA Credit Line</div> */}
                                            <img className='ml-4 h-16 w-16' src={ epaCreditsImg } />
                                            EPA Credit Line
                                        </NavLink>
                                        <NavLink to='/epavault'>
                                            {/* <div><FaVault className="h-12 w-12 fill-orange-400"/>EPA Vault</div> */}
                                            <img className='ml-1 h-16 w-16' src={ epaVaultImg } />
                                            EPA Vault
                                        </NavLink>
                                    </div>
                                    : 
                                    ''
                                }
                                <NavLink to='/donation'>
                                    {/* <div><BsCashCoin className="h-12 w-12 fill-orange-400"/>EPA Cash</div> */}
                                    <img className='ml-1 h-16 w-16' src={ uhw_logo } />
                                    UHW
                                </NavLink>
                            </div>
                        </div>

                        <div className="bg-gray-200 pb-3" />

                        <div className="px-6 font-semibold mt-2 mb-1 text-lg text-black">Transaction Logs</div>
                        <hr />
                    </div>
                :
                < ValidationBeforeRegister />
            }

        </div>

        <div className="pt-2 pb-4 justify-start">
            { logs && logs.map(item => (
                <NavLink to='/receipts' key={ item._id } state={ item }>
                    <div hidden={ item.type === 'Send Order Payment' && item.owner !== user.id || item.type === 'Received Order Payment' && item.email !== user.email } className='py-2 border-b-2'>
                        {/* { item.owner !== process.env.EPA_ACCT_ID ?
                            <div className='px-6 flex flex-cols justify-between font-semibold'>
                                <div className='text-gray-500'>{ item.recipient === user.id ? item.type : item.type.replace('Send', 'Received') }</div>
                                <div className={ item.recipient === user.id ? 'text-red-500' : 'text-blue-500' }>{ item.recipient === user.id ? '-' : '+' }{ String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                            </div>
                            :
                            <div className='px-6 flex flex-cols justify-between font-semibold'>
                                <div className='text-gray-500'>{ item.type }</div>
                                <div className='text-blue-500'>{ '+' }{ String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                            </div>
                        } */}
                        {/* <div className='px-6 flex flex-cols justify-between font-semibold'> */}
                        { item.type !== 'Generate EPA Cash' ? 
                            item.type.split(' ')[0] === 'Upgraded' || item.type.split(' ')[0] === 'Subscription' || item.type === 'Monthly Dues' ?
                                <div>
                                    <div className='px-6 flex flex-cols justify-between font-semibold'>
                                        <div className='text-gray-500'>{ item.type }</div>
                                        <div className='text-red-500'>-{ String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                    </div>
                                    <div className='px-6 text-gray-500 text-xs'>{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</div>
                                </div>
                            :
                            item.type === 'Send Order Payment' && item.owner === user.id ?
                                <div>
                                    <div className='px-6 flex flex-cols justify-between font-semibold'>
                                        <div className='text-gray-500'>{ item.type }</div>
                                        <div className='text-red-500'>-{ String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                    </div>
                                    <div className='px-6 text-gray-500 text-xs'>{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</div>
                                </div>
                            :
                            item.type === 'Received Order Payment' && item.email === user.email ?
                                <div>
                                    <div className='px-6 flex flex-cols justify-between font-semibold'>
                                        <div className='text-gray-500'>{ item.type }</div>
                                        <div className='text-blue-500'>+{ String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                    </div>
                                    <div className='px-6 text-gray-500 text-xs'>{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</div>
                                </div>
                            :
                            item.type === 'Order Refund' || item.type === 'Monthly Interest' ?
                                <div>
                                    <div className='px-6 flex flex-cols justify-between font-semibold'>
                                        <div className='text-gray-500'>{ item.type }</div>
                                        <div className='text-blue-500'>+{ String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                    </div>
                                    <div className='px-6 text-gray-500 text-xs'>{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</div>
                                </div>
                            :
                            <div>
                                { item.owner === user.id && item.type !== 'Send Order Payment' && item.type !== 'Received Order Payment' && (
                                    <div>
                                        <div className='px-6 flex flex-cols justify-between font-semibold'>
                                            <div className='text-gray-500'>{ item.type }</div>
                                            <div className='text-red-500'>-{ String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                        </div>
                                        <div className='px-6 text-gray-500 text-xs'>{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</div>
                                    </div>
                                )}
                                { item.email === user.email && item.type !== 'Send Order Payment' && item.type !== 'Received Order Payment' && (
                                    <div>
                                        <div className='px-6 flex flex-cols justify-between font-semibold'>
                                            <div className='text-gray-500'>{ item.type.replace('Send', 'Received') }</div>
                                            <div className='text-blue-500'>+{ String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                        </div>
                                        <div className='px-6 text-gray-500 text-xs'>{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</div>
                                    </div>
                                )}
                            </div>
                            :
                            <div>
                                <div className='px-6 flex flex-cols justify-between font-semibold'>
                                    <div className='text-gray-500'>{ item.type }</div>
                                    <div className='text-blue-500'>+{ String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</div>
                                </div>
                                <div className='px-6 text-gray-500 text-xs'>{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</div>
                            </div>
                        }
                        {/* </div> */}
                    </div>
                </NavLink>
            )) }
        </div>

        {/* <div className="bg-white rounded-lg">
            <div className='py-1 px-6'> */}

                {/* <NavLink to="/edit-profile"> */}
                    {/* <div className="flex items-center justify-between">
                        <div className='flex items-center gap-4'> */}
                            {/* <AiOutlineUser className='text-lg' /> */}
                            {/* <h1 className='font-semibold'>Edit Profile</h1>
                        </div> */}
                        {/* <AiOutlineRight className='text-lg' /> */}
                    {/* </div> */}
                {/* </NavLink> */}
            {/* </div>
        </div> */}
        
        <div className='mb-10'/>
        <ToastContainer
            position="top-right"
            autoClose={1000}
            hideProgressBar={true}
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

export default EpaWallet
