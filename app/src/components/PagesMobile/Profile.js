import NavbarMobile from '../MobileView/NavbarMobile'
import Cookies from 'universal-cookie'
import axios from 'axios'
import moment from 'moment'
import packageImg from '../../assets/package.png'
import orgChartImg from '../../assets/orgchart.png'
import subAcctsImg from '../../assets/subaccounts.png'
import createAcctsImg from '../../assets/newaccounts.png'
import favoritesImg from '../../assets/favorites.png'
import notifsImg from '../../assets/notifications.png'
import ValidationBeforeRegister from '../ValidationBeforeRegister'
import Carousel from "react-multi-carousel"
import "react-multi-carousel/lib/styles.css"
import { isAndroid, isIOS } from 'react-device-detect'
import { useEffect, useState } from 'react'
import { AiOutlineRight, AiOutlineUser, AiOutlineHeart, AiOutlineHistory } from 'react-icons/ai'
import { BsFillCartCheckFill, BsCartX, BsCashCoin } from 'react-icons/bs'
import { CiLocationOn, CiLogout } from 'react-icons/ci'
// import { FaStore } from 'react-icons/fa'
import { GrNotification } from 'react-icons/gr'
import { IoMdNotifications, IoMdNotificationsOff, IoMdWallet, IoMdChatbubbles } from 'react-icons/io'
// import { LiaIdCardSolid } from 'react-icons/lia'
import { FaShippingFast, FaRegCreditCard } from 'react-icons/fa'
import { FaBoxesPacking, FaVault } from 'react-icons/fa6'
import { MdOutlineRateReview, MdNoBackpack, MdOutlineSupervisorAccount, MdDomainVerification, MdContactSupport, MdSpaceDashboard } from 'react-icons/md'
import { GiOrganigram } from 'react-icons/gi'
import { TbCurrencyPeso } from 'react-icons/tb'
import { NavLink } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { FaClone } from 'react-icons/fa6'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import epa_coin from '../../assets/epa-coin.gif'

const cookies = new Cookies()

const logOut = async (e) => {
    e.preventDefault()
    e.currentTarget.disabled = true

    const CancelToken = axios.CancelToken
    const source = CancelToken.source()
  
    await axios.post('/api/user/logout', {
        data: { cancelToken: source.token }
      }).then(res => {
            console.log('Success OK: ', res.status)
            toast.success(res.data.message)
            cookies.remove('token')
            // cookies.remove('user')
            setTimeout(() => {
                window.location.href = '/'
            }, 1000)
            return res
      }).catch((err) => {
        if (axios.isCancel(err)) {
            console.log('Successfully Aborted')
            toast.error(err.response.data.error)
        } else if (err.response.status === 422) { // response >> validation errors
            console.log('Validation Error: ', err.response.status)
            toast.error(err.response.data.error)
            cookies.remove('token')
            // cookies.remove('user')
            setTimeout(() => {
                window.location.href= '/' // add timeout for refresh
            }, 1000)
        } else if (err.response.status === 401) { // response >> token expired errors
            console.log('Validation Error: ', err.response.status)
            toast.error(err.response.data.error)
            cookies.remove('token')
            // cookies.remove('user')
            setTimeout(() => {
                window.location.href= '/' // add timeout for refresh
            }, 1000)
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

const Profile = () => {
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ showRefCode, setShowRefCode ] = useState('Show')
    const [ iou, setIOU ] = useState(false)
    const [ loan, setLoan ] = useState(false)
    const [ allowanceJBA, setAllowanceJBA ] = useState('')
    // const [ notifications, setNotifications ] = useState('')
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
                setIOU(res.data.user.iou)
                setLoan(res.data.loanamount)
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

        if (user && user.id && iou) {
            axios.put(`/api/user/iou/${ user.id }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
        }
        return () => { source.cancel() }
    }, [ user ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (user && user.id && loan) {
            axios.put(`/api/user/loan/${ user.id }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
        }
        return () => { source.cancel() }
    }, [ user ])

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

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (user && user.id && validChildrenCount) {
            axios.put(`/api/user/upgrade-package/${ user.id }`, { validChildrenCount: validChildrenCount }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
        }
        return () => { source.cancel() }
    }, [ validChildrenCount ])

    // useEffect(() => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     if (currentUser && currentUser._id) {
    //         axios.get(`/api/notification/${ user.id }`, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json',
    //                 'X-Api-Key': process.env.API_KEY
    //             },
    //             data: { cancelToken: source.token }
    //         }).then(res => {
    //             console.log('Success OK: ', res.status)
    //             setNotifications(res.data.notif)
    //         }).catch((err) => {
    //             if (axios.isCancel(err)) console.log('Successfully Aborted')
    //             else console.error(err)
    //         })
    //         return () => { source.cancel() }
    //     }
    // }, [ currentUser ])

    // useEffect(() => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     if (user && user.id) {
    //         axios.get(`/api/user/teams/${ user.id }`, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json',
    //                 'X-Api-Key': process.env.API_KEY
    //             },
    //             data: { cancelToken: source.token }
    //         }).then(res => {
    //             console.log('Success OK: ', res.status)
    //             setValidChildrenCount(res.data.count.childrenCount - res.data.count.childrenMember)
    //         }).catch((err) => {
    //             if (axios.isCancel(err)) console.log('Successfully Aborted')
    //             else console.error(err)
    //         })
    //     }
    //     return () => { source.cancel() }
    // }, [ user ])

    // useEffect(() => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     if (user && user.id && validChildrenCount) {
    //         axios.put(`/api/user/valid-quota/${ user.id }/${ validChildrenCount }`, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json',
    //                 'X-Api-Key': process.env.API_KEY
    //             },
    //             data: { cancelToken: source.token }
    //         }).then(res => {
    //             console.log('Success OK: ', res.status)
    //         }).catch((err) => {
    //             if (axios.isCancel(err)) console.log('Successfully Aborted')
    //             else console.error(err)
    //         })
    //     }
    //     return () => { source.cancel() }
    // }, [ validChildrenCount ])

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

    const responsive = {
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 5
        }
    }

    const redirectPage = () => {
        toast.info('Redirecting to Support page...')
        if (isAndroid) {
            console.log('isAndroid >>> ', isAndroid)
            const isFacebookAppInstalled = 'intent://facebook.me/#Intent;scheme=https;package=com.facebook;end';
            if (isFacebookAppInstalled) {
                const pageId = process.env.FB_PAGE_ID || 'EPABusiness'
                window.location.replace(`fb://page/${ pageId }`)
            } try{
                const url = "https://facebook.me/#Intent;scheme=https;package=com.facebook;end"
                window.location.replace(url)
            } catch(err) {
                setTimeout(() => {
                    window.location.replace(`https://play.google.com/store/apps/details?id=com.facebook`)
                    // window.location.replace(`https://facebook.com/${ process.env.FB_PAGE_ID }`)
                    // window.location.replace(`https://facebook.com/EPABusiness`)
                }, 5000)
            }  // Linking.openURL(`fb://page/${ process.env.FB_PAGE_ID }`)
        } else if (isIOS) {
            console.log('isIOS >>> ', isIOS)
            try {
                // window.location.replace("facebook://")
                window.location.replace("https://apps.apple.com/ph/app/facebook/id284882215")
                // window.location.replace("fb://profile")
                // window.location.replace(`fb://page/${ process.env.FB_PAGE_ID }`)
                // Linking.openURL(`fb://page/${ process.env.FB_PAGE_ID }`)
            } catch(err) {
                setTimeout(() => {
                    window.location.replace("https://apps.apple.com/ph/app/facebook/id284882215")
                    // Linking.openURL(`fb://page/${ process.env.FB_PAGE_ID }`)
                }, 5000)
            }
        } else {
            console.log('isWeb')
            window.location.replace(`https://facebook.com/${ process.env.FB_PAGE_ID }`)
            // Linking.openURL(`https://facebook.com/${ process.env.FB_PAGE_ID }`)
        }
    }

    const goToDashboard = () => {
        if (process.env.NODE_ENV === 'production')
          window.location.href = `https://dashboard.${ process.env.DOMAIN }`
        else
          window.location.replace('/dashboard')
     }

    return (
        <>
            <div className='lg:hidden font-montserrat'>
                <div className={ `${ currentUser.class === 'Entrepreneur' ? 'bg-lime-500' : currentUser.class === 'Supervisor' ? 'bg-cyan-500' : currentUser.class === 'Manager' ? 'bg-amber-500' : currentUser.class === 'CEO' ? 'bg-purple-400' : currentUser.class === 'Business Empire' ? 'bg-red-500' : currentUser.class === 'Silver' ? 'bg-gradient-to-r from-stone-600 to-stone-300' : currentUser.class === 'Gold' ? 'bg-gradient-to-r from-amber-600 to-amber-300' : 'bg-emerald-500' } sticky top-0 z-40 px-3 pt-2 pb-4` }>
                    <div className="mt-3 flex flex-cols gap-4 justify-start">
                        { currentUser.avatar ? 
                            <img className="w-20 h-20 bg-white rounded-full shadow-md"
                                src={ window.location.origin + '/private/avatar/' + currentUser.avatar }
                                alt="Rounded avatar"
                            />
                            :
                            <img className="border w-24 h-24 rounded-full shadow-md"
                                src="https://static-00.iconduck.com/assets.00/avatar-default-symbolic-icon-2048x1949-pq9uiebg.png"
                                alt="Rounded avatar"
                            />
                        }

                        <div>
                            <div className="font-[580] leading-relaxed text-white text-2xl">
                                { currentUser.name }
                            </div>
                        
                            <div className='flex flex-cols gap-3'>
                                <NavLink to='/package'>
                                    {/* <div className={ `${ currentUser.class === 'Entrepreneur' ? 'text-yellow-200 bg-lime-500 w-36' : currentUser.class === 'Supervisor' ? 'text-yellow-200 bg-cyan-500 w-36' : currentUser.class === 'Manager' ? 'text-yellow-200 bg-amber-500 w-32' : currentUser.class === 'CEO' ? 'text-yellow-200 bg-purple-400 w-20' : currentUser.class === 'Business Empire' ? 'text-yellow-200 bg-red-500 w-40' : 'text-yellow-200 bg-gray-500 w-20' } font-semibold text-center text-md rounded-lg shadow-md` }>{ currentUser.class }</div> */}
                                    <div className={ `${ currentUser.class === 'Entrepreneur' ? 'text-lime-500 bg-white w-36' : currentUser.class === 'Supervisor' ? 'text-cyan-500 bg-white w-36' : currentUser.class === 'Manager' ? 'text-amber-500 bg-white w-32' : currentUser.class === 'CEO' ? 'text-purple-400 bg-white w-20' : currentUser.class === 'Business Empire' ? 'text-red-500 bg-white w-40' : currentUser.class === 'Silver' ? 'text-stone-600 bg-white w-40' : currentUser.class === 'Gold' ? 'text-amber-600 bg-white w-32' : 'text-gray-500 bg-white w-40' } font-semibold text-center text-md rounded-lg shadow-md` }>{ currentUser.rank ? currentUser.rank : currentUser.class }</div>
                                </NavLink>
                                { !currentUser.isVerified &&
                                    <NavLink to='/verifyaccount'>
                                        <div className="pt-1 font-normal text-xs text-white underline">'Not Verified'</div>
                                    </NavLink>
                                }
                            </div>

                            { currentUser.class !== 'Member' &&
                                <div className='-px-4 pt-1 flex flex-cols font-semibold text-xs gap-2 rounded-1xl text-white text-center'>
                                    <CopyToClipboard text={ user.refnum }>
                                        <button onClick={ copyClipboard }><FaClone className='fill-white'/></button>
                                    </CopyToClipboard>
                                    <p className='font-normal'>Guarantor Code:</p>
                                    {/* <p className='font-medium'>{ user.refnum }</p> */}
                                    { showRefCode === 'Show' ?
                                        <button onClick={ () => setShowRefCode(user.refnum) } className='font-medium text-white roounded'>{ showRefCode }</button>
                                        :
                                        <button onClick={ () => setShowRefCode('Show') } className='font-medium text-white roounded'>{ showRefCode }</button>
                                    }
                                </div>
                            }

                            <div className='-px-4 pt-1 flex flex-cols font-semibold text-xs gap-2 rounded-1xl text-white text-center'>
                                {/* <button onClick={ () => setShowEwallet(!currentUser.isSubAccount ? user.eWalletnum : 'Sub Account') } className='text-amber-300 roounded'>{ showEWallet }</button> */}
                                <CopyToClipboard text={ user.eWalletnum }>
                                    <button onClick={ copyClipboard }><FaClone className='fill-white'/></button>
                                </CopyToClipboard>
                                <p className='font-normal'>EPA Wallet ID:</p>
                                <p className='font-medium'>{ user.eWalletnum }</p>
                            </div>

                            { currentUser.totalIncome && currentUser.totalIncome.$numberDecimal !== '0' &&
                                <div className='grid grid-rows-2'>
                                    <div className='-px-4 pt-1 flex flex-cols font-semibold text-xs gap-2 rounded-1xl text-white text-center'>
                                        <p className='font-normal'>Accumulated Income:</p>
                                        <div className='flex items-center font-semibold'>
                                            <TbCurrencyPeso />
                                            <p className='font-medium'>{ String(parseFloat(currentUser.totalIncome.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                        </div>
                                    </div>
                                    <div className='-px-4 mb-2 flex flex-cols font-semibold text-xs gap-2 rounded-1xl text-white text-center'>
                                        <p className='font-normal'>Since: { moment(new Date(user.createdAt).toISOString()).format('MM/DD/YYYY hh:mm A') }</p>
                                    </div>
                                </div>
                            }

                        </div>
                    </div>

                    <div className="absolute left-0 right-0 -bottom-1 rounded-t-full shadow-t-md w-screen bg-white text-xs">&ensp;</div>
                    
                    {/* <div className='-flex items-center gap-4 justify-end'>
                        <NavLink to="/notifications">
                            { notifications ? 
                                    <IoMdNotifications className='text-xl text-gray-700 fill-orange-600'/>
                                    :
                                    <IoMdNotificationsOff className='text-xl text-gray-700'/>
                            }
                        </NavLink>
                        <NavLink to="/cart">
                            { currentUser.cart ?
                                <BsFillCartCheckFill className='text-xl text-gray-700 fill-orange-600'/>
                                :
                                <BsCartX className='text-xl text-gray-700'/>
                            }
                        </NavLink>    
                        <NavLink to='/chat'>
                            <IoMdChatbubbles className='text-xl text-gray-700'/>
                        </NavLink>                           
                    </div> */}
                </div>

                { user.religion || currentUser.religion ? 
                    <div>
                        { currentUser.class !== 'Member' && currentUser.quota && currentUser.quota.$numberDecimal !== '0' && validChildrenCount && validChildrenCount >= allowanceJBA &&
                        // <div className='mt-4 flex flex-cols text-xs justify-between'>
                        <div className='px-6 pt-1 text-xs justify-between'>
                            <div className='rounded flex'>
                                <div className='flex items-center gap-2'>
                                    <p className='font-normal'>Available EPA Coin Points:</p>
                                    <div className='flex items-center font-semibold'>
                                        <img src={ epa_coin } className='epacoin' alt="epacoin" />
                                        {/* { currentUser.quota && currentUser.quota.$numberDecimal !== '0' ? 
                                            <p className=''>{ String(parseFloat(currentUser.epacredits.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") } + ({ String(parseFloat(currentUser.quota.$numberDecimal / 10).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") })</p>
                                            :
                                            <p className=''>{ String(parseFloat(currentUser.epacredits.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                        } */}
                                        <p className=''>{ String(parseFloat(currentUser.quota.$numberDecimal / 10).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                    </div>
                                </div>
                            </div>
                        { currentUser.epatokens && currentUser.epatokens.$numberDecimal !== '0' &&
                            <div className='rounded flex'>
                                <div className='flex items-center gap-2'>
                                    <p className='font-normal'>Tokens Achieved:</p>
                                    <div className='flex items-center font-semibold'>
                                        <p className=''>{ String(parseFloat(currentUser.epatokens.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                    </div>
                                </div>
                            </div>
                        }
                        { currentUser.quota && currentUser.quota.$numberDecimal !== '0' &&
                            <div className='rounded flex'>
                                <div className='flex items-center gap-2'>
                                    <p className='font-normal'>Tokens Target:</p>
                                    <div className='flex items-center font-semibold'>
                                        <p className=''>{ String(parseFloat(currentUser.quota.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                    </div>
                                </div>
                            </div>
                        }
                            </div>
                        }

                        <div className="px-6 pt-2 pb-4 justify-start">
                            <div className="font-semibold mt-2 mb-1 text-lg text-black">My Orders</div>
                            <hr />
                            <div className="inline-flex gap-8 justify-center mt-2 text-center text-[8px] font-semibold break-word">
                                <NavLink to='/myorders'>
                                    <div><IoMdWallet className="h-12 w-12 fill-orange-400"/>To Confirm</div>
                                </NavLink>
                                <NavLink to='/myorders'>
                                    <div><FaBoxesPacking className="h-12 w-12 fill-orange-400"/>To Ship</div>
                                </NavLink>
                                <NavLink to='/myorders'>
                                    <div><FaShippingFast className="h-12 w-12 fill-orange-400"/>To Receive</div>
                                </NavLink>
                                <NavLink to='/myorders'>
                                    <div><MdOutlineRateReview className="h-12 w-12 fill-orange-400"/>To Review</div>
                                </NavLink>
                                <NavLink to='/myorders'>
                                    <div><MdNoBackpack className="h-12 w-12 fill-orange-400"/><p className="-ml-4">Returns & Cancellations</p></div>
                                </NavLink>                       
                            </div>
                        </div>

                        <div className="bg-gray-200 pb-3" />

                        <Carousel
                            className='mt-4 mb-2 px-3 justify-between text-center items-center'
                            responsive={ responsive }
                            showArrows={ false } 
                            arrows={ false }
                            infinite={ true }
                            autoPlay={ true }
                            autoPlaySpeed={ 4000 }
                        >
                            <div className='w-14 rounded-full'>
                                <NavLink to='/package'>
                                    <img className='ml-2 h-10' src={ packageImg } />
                                    <p className='text-[8px] font-semibold break-word'>Subscription Package</p>
                                </NavLink>
                            </div>
                            <div className='w-14 rounded-full'>
                                <NavLink to='/orgchart'>
                                    <img className='ml-2 h-10' src={ orgChartImg } />
                                    <p className='text-[8px] font-semibold break-word'>Organizational Chart</p>
                                </NavLink>
                            </div>
                            <div className='w-16 rounded-full'>
                                <NavLink to={ user.class !== 'Member' || currentUser.class !== 'Member' ? '/subaccount' : '' }>
                                    <img className={ `${ user.class !== 'Member' || currentUser.class !== 'Member' ? '' : 'grayscale' } ml-2 h-12` } src={ subAcctsImg } />
                                    <p className='text-[8px] font-semibold break-word'>Sub Accounts</p>
                                </NavLink>
                            </div>
                            <div className='w-16 rounded-full'>
                                <NavLink to={ user.class !== 'Member' || currentUser.class !== 'Member' ? '/createaccount' : '' }>
                                    <img className={ `${ user.class !== 'Member' || currentUser.class !== 'Member' ? '' : 'grayscale' } ml-2 h-12` } src={ createAcctsImg } />
                                    <p className='text-[8px] font-semibold break-word'>Create Account</p>
                                </NavLink>
                            </div>
                            <div className='w-16 rounded-full'>
                                <NavLink to='/favorites'>
                                    <img className='ml-2 h-12' src={ favoritesImg } />
                                    <p className='text-[8px] font-semibold break-word'>Favorites</p>
                                </NavLink>
                            </div>
                            <div className='w-16 rounded-full'>
                                <NavLink to='/notifications'>
                                    <img className='ml-2 h-12' src={ notifsImg } />
                                    <p className='text-[8px] font-semibold break-word'>Notifications</p>
                                </NavLink>
                            </div>
                        </Carousel>

                        {/* <div className="px-6 pt-2 pb-4 justify-start">
                            <div className="font-semibold mt-2 mb-1 text-lg text-black">EPA Wallet</div>
                            <hr />
                            <div className="inline-flex gap-8 justify-center mt-2 text-center text-[8px] break-word">
                                <NavLink to='/epacash'>
                                    <div><BsCashCoin className="h-12 w-12 fill-orange-400"/>EPA Cash</div>
                                </NavLink>
                                { currentUser.class !== 'Member' ?
                                    <div className="inline-flex gap-8 justify-center text-center text-[8px] break-word">
                                        <NavLink to='/epacredit'>
                                            <div><FaRegCreditCard className="h-12 w-14 fill-orange-400"/>EPA Credit Line</div>
                                        </NavLink>
                                        <NavLink to='/epavault'>
                                            <div><FaVault className="h-12 w-12 fill-orange-400"/>EPA Vault</div>
                                        </NavLink>
                                    </div>
                                    : 
                                    ''
                                }
                            </div>
                        </div> */}

                        <div className="bg-gray-200 pb-24 rounded-lg">
                            <div className='pt-5 px-6'>

                                <NavLink to="/edit-profile">
                                    <div className="flex items-center justify-between">
                                        <div className='flex items-center gap-4'>
                                            <AiOutlineUser className='text-lg' />
                                            <h1 className='font-semibold'>Edit Profile</h1>
                                        </div>
                                        <AiOutlineRight className='text-lg' />
                                    </div>
                                </NavLink>

                                <NavLink to="/shipping-address">
                                    <div className="flex items-center justify-between mt-8">
                                        <div className='flex items-center gap-4'>
                                            <CiLocationOn className='text-lg' />
                                            <h1 className='font-semibold'>Shipping Address</h1>
                                        </div>
                                        <AiOutlineRight className='text-lg' />
                                    </div>
                                </NavLink>

                                { currentUser.class !== 'Member' && !currentUser.isVerified && (
                                    <NavLink to="/verifyaccount">
                                        <div className="flex items-center justify-between mt-8">
                                            <div className='flex items-center gap-4'>
                                                <MdDomainVerification className='text-lg' />
                                                <h1 className='font-semibold'>Verify Account</h1>
                                            </div>
                                            <AiOutlineRight className='text-lg' />
                                        </div>
                                    </NavLink>
                                ) }

                                {/* <NavLink to="/order-history">
                                    <div className="flex items-center justify-between mt-8">
                                        <div className='flex items-center gap-4'>
                                            <AiOutlineHistory className='text-lg' />
                                            <h1 className='font-semibold'>Order History</h1>
                                        </div>
                                        <AiOutlineRight className='text-lg' />
                                    </div>
                                </NavLink> */}

                                <NavLink to='/favorites'>
                                    <div className="flex items-center justify-between mt-8">
                                        <div className='flex items-center gap-4'>
                                            <AiOutlineHeart className='text-lg' />
                                            <h1 className='font-semibold'>Favorites</h1>
                                        </div>
                                        <AiOutlineRight className='text-lg' />
                                    </div>
                                </NavLink>

                                <NavLink to="/notifications">
                                    <div className="flex items-center justify-between mt-8">
                                        <div className='flex items-center gap-4'>
                                            <GrNotification className='text-lg' />
                                            <h1 className='font-semibold'>Notifications</h1>
                                        </div>
                                        <AiOutlineRight className='text-lg' />
                                    </div>
                                </NavLink>

                                <NavLink to="/package">
                                    <div className="flex items-center justify-between mt-8">
                                        <div className='flex items-center gap-4'>
                                            <MdOutlineSupervisorAccount className='text-lg' />
                                            <h1 className='font-semibold'>Subscription Package</h1>
                                        </div>
                                        <AiOutlineRight className='text-lg' />
                                    </div>
                                </NavLink>

                                <NavLink to="/orgchart">
                                    <div className="flex items-center justify-between mt-8">
                                        <div className='flex items-center gap-4'>
                                            <GiOrganigram className='text-lg' />
                                            <h1 className='font-semibold'>Organizational Chart</h1>
                                        </div>
                                        <AiOutlineRight className='text-lg' />
                                    </div>
                                </NavLink>

                                { currentUser.class !== 'Member' && (
                                    <NavLink to="/subaccount">
                                        <div className="flex items-center justify-between mt-8">
                                            <div className='flex items-center gap-4'>
                                                <MdOutlineSupervisorAccount className='text-lg' />
                                                <h1 className='font-semibold'>Sub Accounts</h1>
                                            </div>
                                            <AiOutlineRight className='text-lg' />
                                        </div>
                                    </NavLink>
                                ) }

                                { currentUser.class !== 'Member' && (
                                    <NavLink to="/createaccount">
                                        <div className="flex items-center justify-between mt-8">
                                            <div className='flex items-center gap-4'>
                                                <MdOutlineSupervisorAccount className='text-lg' />
                                                <h1 className='font-semibold'>Create Account</h1>
                                            </div>
                                            <AiOutlineRight className='text-lg' />
                                        </div>
                                    </NavLink>
                                ) }

                                {/* <NavLink to={ () => redirectPage() }> */}
                                <div className="flex items-center justify-between mt-8" onClick={ () => redirectPage() }>
                                    <div className='flex items-center gap-4'>
                                        <MdContactSupport className='text-lg' />
                                        <h1 className='font-semibold'>Contact Support</h1>
                                    </div>
                                    <AiOutlineRight className='text-lg' />
                                </div>
                                {/* </NavLink> */}

                                { ( user.id === process.env.EPA_ACCT_ID || user.id === process.env.JOHN_MAIN_ACCT_ID || user.id === process.env.MARK_MAIN_ACCT_ID ) && (
                                <div className="flex items-center justify-between mt-8" onClick={ () => goToDashboard() }>
                                    <div className='flex items-center gap-4'>
                                        <MdSpaceDashboard className='text-lg' />
                                        <h1 className='font-semibold'>Dashboard</h1>
                                    </div>
                                    <AiOutlineRight className='text-lg' />
                                </div>
                                ) }

                                <div className="flex items-center justify-between mt-8" onClick={ (e) => logOut(e) }>
                                    <div className='flex items-center gap-4'>
                                        <CiLogout className='text-lg' />
                                        <h1 className='font-semibold text-red-500'>Log Out</h1>
                                    </div>
                                </div>

                                {/* <div className="flex items-center justify-between mt-8">
                                    <div className='flex items-center gap-4'>
                                        <LiaIdCardSolid className='text-lg' />
                                        <h1 className='font-semibold'>Cards</h1>
                                    </div>
                                    <AiOutlineRight className='text-lg' />
                                </div> */}
                            </div>
                        </div>
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

export default Profile
