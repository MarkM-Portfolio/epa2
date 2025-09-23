import Cookies from 'universal-cookie'
import axios from 'axios'
import RecommendedSectionForYouSection from '../MobileView/RecommendedSectionForYouSection'
import Carousel from "react-multi-carousel"
import "react-multi-carousel/lib/styles.css"

import { useEffect, useState } from 'react'
import { IoMdNotificationsOutline, IoMdNotificationsOff } from "react-icons/io"
import { FaRegMessage } from 'react-icons/fa6'
import { CiSearch } from "react-icons/ci"
import { FaFire } from "react-icons/fa"
import { LuWallet } from "react-icons/lu"
import { IoPricetagOutline } from "react-icons/io5"
import { MdKeyboardArrowRight } from "react-icons/md"
import { LiaShippingFastSolid } from "react-icons/lia"
import { BsCartX, BsFillCartCheckFill } from 'react-icons/bs'
// import { TbCurrencyPeso, TbDecimal } from 'react-icons/tb'
import { NavLink } from 'react-router-dom'

// import epa_logo from '../../assets/logo.png'
import epa_coin from '../../assets/epa-coin.gif'
import uhw_logo from '../../assets/uhw_logo.png'
import apparels from '../../assets/categories/apparels.png'
// import adults from '../../assets/categories/adults.png'
import agriculture from '../../assets/categories/agriculture.png'
import autoparts from '../../assets/categories/autoparts.png'
import books from '../../assets/categories/books.png'
import consultancy from '../../assets/categories/consultancy.png'
import clothing from '../../assets/categories/clothing.png'
import digital from '../../assets/categories/digital.png'
import electronics from '../../assets/categories/electronics.png'
import energy from '../../assets/categories/energy.png'
import furniture from '../../assets/categories/furniture.png'
import foodbeverage from '../../assets/categories/foodbeverage.png'
import footwear from '../../assets/categories/shoes.png'
import household from '../../assets/categories/household.png'
import healthcare from '../../assets/categories/healthcare.png'
import logistics from '../../assets/categories/logistics.png'
import pets from '../../assets/categories/pets.png'
import publicImg from '../../assets/categories/public.png'
import religious from '../../assets/categories/religious.png'
import school from '../../assets/categories/school.png'
import services from '../../assets/categories/services.png'

const UpperHeaderMobile = () => {
    const cookies = new Cookies()
    const isAuth = cookies.get('token')
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ allowanceJBA, setAllowanceJBA ] = useState('')
    const [ iou, setIOU ] = useState(false)
    const [ loan, setLoan ] = useState(false)
    const [ notifications, setNotifications ] = useState('')
    const [ search, setSearch ] = useState('')
    const [ categorySearch, setCategorySearch ] = useState(false)
    const [ validChildrenCount, setValidChildrenCount ] = useState([])
    const [ banners, setBanners ] = useState([])
    const [ showVoucher, setShowVoucher ] = useState(false)

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (isAuth) {
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
    }, [ isAuth ])

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
            setBanners(res.data.settings.banners)
            setShowVoucher(res.data.settings.showVoucher)
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

        if (isAuth) {
            axios.get(`/api/notification/${ user.id }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setNotifications(res.data.notif)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ isAuth ])

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

    const banner = {
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 1
        }
    }

    const responsive = {
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 5
        }
    }

    const handleSearch = async(e) => {
        setSearch(e.target.value)
    }

    return (
        <>
            <div className="font-montserrat">
                <div className='sticky top-0 z-40 px-6 pt-4 pb-2 bg-white'>
                    {/* logo home icons */}
                    <div className='flex justify-between items-center'>
                        <NavLink to={ isAuth ? '/donation' : '/login' } >
                            <img src={ uhw_logo } className='w-10 h-10' alt="logo" />
                        </NavLink>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center">GOD is our Light</h1>
                        
                        <div className='flex gap-2 items-center'>
                            <NavLink to={ isAuth ? '/notifications' : '/login' }>
                                { notifications ? 
                                    <IoMdNotificationsOutline className={ isAuth ? `${ user.class === 'Entrepreneur' ? 'fill-lime-500' : user.class === 'Supervisor' ? 'fill-cyan-500' : user.class === 'Manager' ? 'fill-amber-500' : user.class === 'CEO' ? 'fill-purple-400' : user.class === 'Business Empire' ? 'fill-red-500' : user.class === 'Silver' ? 'fill-[#C0C0C0]' : user.class === 'Gold' ? 'fill-[#FFD700]' : 'fill-emerald-400' } w-6 h-6` : 'fill-emerald-400 w-6 h-6' }/>
                                    :
                                    <IoMdNotificationsOff className={ isAuth ? `${ user.class === 'Entrepreneur' ? 'fill-lime-500' : user.class === 'Supervisor' ? 'fill-cyan-500' : user.class === 'Manager' ? 'fill-amber-500' : user.class === 'CEO' ? 'fill-purple-400' : user.class === 'Business Empire' ? 'fill-red-500' : user.class === 'Silver' ? 'fill-[#C0C0C0]' : user.class === 'Gold' ? 'fill-[#FFD700]' : 'fill-emerald-400' } w-6 h-6` : 'fill-emerald-400 w-6 h-6' }/>
                                }
                            </NavLink>

                            <NavLink to={ isAuth ? '/cart' : '/login' }>
                                { currentUser.cart && currentUser.cart.length ?
                                    <BsFillCartCheckFill className={ isAuth ? `${ user.class === 'Entrepreneur' ? 'fill-lime-500' : user.class === 'Supervisor' ? 'fill-cyan-500' : user.class === 'Manager' ? 'fill-amber-500' : user.class === 'CEO' ? 'fill-purple-400' : user.class === 'Business Empire' ? 'fill-red-500' : user.class === 'Silver' ? 'fill-[#C0C0C0]' : user.class === 'Gold' ? 'fill-[#FFD700]' : 'fill-emerald-400' } w-6 h-6` : 'fill-emerald-400 w-6 h-6' }/>
                                    :
                                    <BsCartX className={ isAuth ? `${ user.class === 'Entrepreneur' ? 'fill-lime-500' : user.class === 'Supervisor' ? 'fill-cyan-500' : user.class === 'Manager' ? 'fill-amber-500' : user.class === 'CEO' ? 'fill-purple-400' : user.class === 'Business Empire' ? 'fill-red-500' : user.class === 'Silver' ? 'fill-[#C0C0C0]' : user.class === 'Gold' ? 'fill-[#FFD700]' : 'fill-emerald-400' } w-6 h-6` : 'fill-emerald-400 w-6 h-6' }/>
                                }
                            </NavLink>

                            <NavLink to={ isAuth ? '/chat-contacts' : '/login' }>
                                <FaRegMessage className={ isAuth ? `${ user.class === 'Entrepreneur' ? 'fill-lime-500' : user.class === 'Supervisor' ? 'fill-cyan-500' : user.class === 'Manager' ? 'fill-amber-500' : user.class === 'CEO' ? 'fill-purple-400' : user.class === 'Business Empire' ? 'fill-red-500' : user.class === 'Silver' ? 'fill-[#C0C0C0]' : user.class === 'Gold' ? 'fill-[#FFD700]' : 'fill-emerald-400' } w-5 h-5` : 'fill-emerald-400 w-5 h-5' }/>
                            </NavLink> 
                        </div>
                    </div>

                    { isAuth && currentUser.class !== 'Member' && currentUser.quota && currentUser.quota.$numberDecimal !== '0' && validChildrenCount && allowanceJBA && validChildrenCount >= allowanceJBA &&
                        // <div className='mt-4 flex flex-cols text-xs justify-between'>
                        <div className='mt-4 text-xs justify-between'>
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
                            { isAuth && currentUser.epatokens && currentUser.epatokens.$numberDecimal !== '0' &&
                                <div className='rounded flex'>
                                    <div className='flex items-center gap-2'>
                                        <p className='font-normal'>Tokens Achieved:</p>
                                        <div className='flex items-center font-semibold'>
                                            <p className=''>{ String(parseFloat(currentUser.epatokens.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                                        </div>
                                    </div>
                                </div>
                            }
                            { isAuth && currentUser.quota && currentUser.quota.$numberDecimal !== '0' &&
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

                    {/* search bar */}
                    <div className="relative mt-3 mb-1">
                        { search ?
                            <input type="search" className={ `p-2 border rounded-lg w-full placeholder:text-center ${ isAuth ? user.class === 'Entrepreneur' ? 'placeholder:text-lime-400 border-lime-500' : user.class === 'Supervisor' ? 'placeholder:text-cyan-400 border-cyan-500' : user.class === 'Manager' ? 'placeholder:text-amber-400 border-amber-500' : user.class === 'CEO' ? 'placeholder:text-purple-300 border-purple-400' : user.class === 'Business Empire' ? 'placeholder:text-red-400 border-red-500' : user.class === 'Silver' ? 'placeholder:text-[#C0C0C0] border-[#C0C0C0]' : user.class === 'Gold' ? 'placeholder:text-[#FFD700] border-[#FFD700]' : 'placeholder:text-emerald-300 border-emerald-400' : 'placeholder:text-emerald-300 border-emerald-400' }` } placeholder={ search ? search : 'Gadgets, Beauty etc...' } onChange={ handleSearch } required  />
                            :
                            <input type="search" className={ `p-2 border rounded-lg w-full placeholder:pl-24 ${ isAuth ? user.class === 'Entrepreneur' ? 'placeholder:text-lime-400 border-lime-500' : user.class === 'Supervisor' ? 'placeholder:text-cyan-400 border-cyan-500' : user.class === 'Manager' ? 'placeholder:text-amber-400 border-amber-500' : user.class === 'CEO' ? 'placeholder:text-purple-300 border-purple-400' : user.class === 'Business Empire' ? 'placeholder:text-red-400 border-red-500' : user.class === 'Silver' ? 'placeholder:text-[#C0C0C0] border-[#C0C0C0]' : user.class === 'Gold' ? 'placeholder:text-[#FFD700] border-[#FFD700]' : 'placeholder:text-emerald-300 border-emerald-400' : 'placeholder:text-emerald-300 border-emerald-400' }` } placeholder={ search ? search : 'Gadgets, Beauty etc...' } onChange={ handleSearch } required  />
                        }
                        <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                            <CiSearch className={ search ? 'hidden' :'w-6 h-6 fill-gray-400' } />
                        </div>
                        <div className="absolute inset-y-0 left-7 flex items-center pl-2">
                            { !search &&
                                <div className={ isAuth ? `${ user.class === 'Entrepreneur' ? 'bg-lime-200' : user.class === 'Supervisor' ? 'bg-cyan-100' : user.class === 'Manager' ? 'bg-amber-100' : user.class === 'CEO' ? 'bg-purple-100' : user.class === 'Business Empire' ? 'bg-red-100' : user.class === 'Silver' ? 'fill-[#C0C0C0]' : user.class === 'Gold' ? 'fill-[#FFD700]' : 'bg-emerald-100' } m-1 rounded-sm flex items-center` : 'bg-emerald-100 m-1 rounded-sm flex items-center' }>
                                    <FaFire className={ isAuth ? `${ user.class === 'Entrepreneur' ? 'fill-lime-500' : user.class === 'Supervisor' ? 'fill-cyan-500' : user.class === 'Manager' ? 'fill-amber-500' : user.class === 'CEO' ? 'fill-purple-400' : user.class === 'Business Empire' ? 'fill-red-500' : user.class === 'Silver' ? 'fill-[#C0C0C0]' : user.class === 'Gold' ? 'fill-[#FFD700]' : 'fill-emerald-500' } w-5 h-5 font-semibold text-sm` : 'fill-emerald-500 w-5 h-5 font-semibold text-sm' }/>
                                    <p className={ isAuth ? `${ user.class === 'Entrepreneur' ? 'text-lime-500' : user.class === 'Supervisor' ? 'text-cyan-500' : user.class === 'Manager' ? 'text-amber-500' : user.class === 'CEO' ? 'text-purple-400' : user.class === 'Business Empire' ? 'text-red-500' : user.class === 'Silver' ? 'text-[#C0C0C0]' : user.class === 'Gold' ? 'text-[#FFD700]' : 'text-emerald-500' }` : 'text-emerald-500' }>HOT</p>
                                </div>
                            }
                        </div>
                        <div className={ isAuth ? `${ user.class === 'Entrepreneur' ? 'bg-gradient-to-r from-lime-300 to-lime-500' : user.class === 'Supervisor' ? 'bg-gradient-to-r from-cyan-300 to-cyan-500' : user.class === 'Manager' ? 'bg-gradient-to-r from-amber-300 to-amber-500' : user.class === 'CEO' ? 'bg-gradient-to-r from-purple-200 to-purple-400' : user.class === 'Business Empire' ? 'bg-gradient-to-r from-red-300 to-red-500' : user.class === 'Silver' ? 'bg-gradient-to-r from-stone-600 to-stone-300' : user.class === 'Gold' ? 'bg-gradient-to-r from-amber-600 to-amber-300' : 'bg-gradient-to-r from-blue-400 to-emerald-400' } absolute inset-y-0 right-0 flex items-center m-1 p-1 rounded-lg }` : 'bg-gradient-to-r from-blue-400 to-emerald-400 absolute inset-y-0 right-0 flex items-center m-1 p-1 rounded-lg' }>
                            <button className={ search ? 'hidden' : 'text-white' }>Search</button>
                        </div>
                    </div>   
                </div>   

                <div className='px-6'>

                    {/* category */}
                    <Carousel
                        className='mt-4 px-2 justify-between'
                        responsive={ responsive }
                        showArrows={ false } 
                        arrows={ false }
                        infinite={ true }
                        autoPlay={ true }
                        autoPlaySpeed={ 4000 }
                    >
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ apparels } onClick={() => { setSearch('Apparel and Accessories'), setCategorySearch(true) } } />
                        </div>  
                        {/* <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ adults } onClick={() => { setSearch('Adults 18+'), setCategorySearch(true) }} />
                        </div>   */}
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ agriculture } onClick={() => { setSearch('Agriculture'), setCategorySearch(true) }} />
                        </div>
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ autoparts } onClick={() => { setSearch('Auto and Parts'), setCategorySearch(true) }} />
                        </div>  
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ books } onClick={() => { setSearch('Books, Movies, Music and Games'), setCategorySearch(true) }} />
                        </div>  
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ consultancy } onClick={() => { setSearch('Consultancy'), setCategorySearch(true) }} />
                        </div>  
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ clothing } onClick={() => { setSearch('Clothing'), setCategorySearch(true) }} />
                        </div>  
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ digital } onClick={() => { setSearch('Digital Products'), setCategorySearch(true) }} />
                        </div>  
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ electronics } onClick={() => { setSearch('Consumer Electronics'), setCategorySearch(true) }} />
                        </div>
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ energy } onClick={() => { setSearch('Energy'), setCategorySearch(true) }} />
                        </div>
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ furniture } onClick={() => { setSearch('Furniture and Fixture'), setCategorySearch(true) }} />
                        </div>
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ foodbeverage } onClick={() => { setSearch('Food and Beverage'), setCategorySearch(true) }} />
                        </div>  
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ footwear } onClick={() => { setSearch('Footwear'), setCategorySearch(true) }} />
                        </div>
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ household } onClick={() => { setSearch('Household'), setCategorySearch(true) }} />
                        </div>  
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ healthcare } onClick={() => { setSearch('Health, Care and Beauty'), setCategorySearch(true) }} />
                        </div>
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ logistics } onClick={() => { setSearch('Logistics'), setCategorySearch(true) }} />
                        </div>
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ pets } onClick={() => { setSearch('Pets'), setCategorySearch(true) }} />
                        </div>
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ publicImg } onClick={() => { setSearch('Public Utilities'), setCategorySearch(true) }} />
                        </div>
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ religious } onClick={() => { setSearch('Religious Items'), setCategorySearch(true) }} />
                        </div>  
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ school } onClick={() => { setSearch('School and Office Supplies'), setCategorySearch(true) }} />
                        </div>
                        <div className='border rounded-lg shadow shadow-emerald-200 w-16'>
                            <img className='h-16' src={ services } onClick={() => { setSearch('Services'), setCategorySearch(true) }} />
                        </div>  
                    </Carousel>
                    
                    { categorySearch && 
                        <div className='pt-5 flex items-center justify-center'>
                            <button className={ isAuth ? `${ user.class === 'Entrepreneur' ? 'outline-lime-500' : user.class === 'Supervisor' ? 'outline-cyan-500' : user.class === 'Manager' ? 'outline-amber-500' : user.class === 'CEO' ? 'outline-purple-400' : user.class === 'Business Empire' ? 'outline-red-500' : 'outline-emerald-400' } outline outline-offset-2 w-16 rounded text-center` : 'outline-emerald-400 outline outline-offset-2 w-16 rounded text-center' } onClick={ () => { setSearch(''), setCategorySearch(false) } }>
                                <p className={ isAuth ? `${ user.class === 'Entrepreneur' ? 'text-lime-500' : user.class === 'Supervisor' ? 'text-cyan-500' : user.class === 'Manager' ? 'text-amber-500' : user.class === 'CEO' ? 'text-purple-400' : user.class === 'Business Empire' ? 'text-red-500' : 'text-emerald-400' } text-xs` : 'text-emerald-400 text-xs' }>Clear</p>
                            </button>
                        </div>
                    }

                    {/* banner */}
                    <Carousel
                        // className='mt-6 mb-6'
                        className='mt-6'
                        responsive={ banner }
                        showArrows={ false } 
                        arrows={ false }
                        infinite={ true }
                        autoPlay={ true }
                        autoPlaySpeed={ 10000 }
                    >
                        { banners.map((banner, idx) => (
                            <div key={ idx } className='bg-cover'>
                                <img src={ window.location.origin + '/public/banners/' + banner } alt={`Banner ${ idx }`} />
                            </div>
                        )) }
                    </Carousel>
                    
                    { showVoucher && (
                        <>
                        {/* vouchers */}
                        <div className='rounded-md w-full bg-gradient-to-b from-emerald-100 to bg-white'>
                            <div className='py-3 px-2 flex items-center justify-between'>
                                <p className='text-xl font-bold text-emerald-400'>Voucher Center</p>
                                <div className='flex items-center gap-2'>
                                    <p className='font-semibold text-emerald-400'>More vouchers</p>
                                    <MdKeyboardArrowRight className='w-6 h-6 fill-emerald-400'/>
                                </div>
                            </div>
                            <div className='flex items-center justify-between gap-2'>
                                <div className='py-1 border w-full bg-emerald-200 rounded-md'>
                                    <div className='flex items-center text-emerald-500 justify-between px-2'>
                                        <p className='text-lg font-bold'>15% OFF</p>
                                        <IoPricetagOutline />
                                    </div>
                                    <p className='px-2 text-[0.60rem]'>Campaign Voucher</p>
                                </div>
                                <div className='py-1 border w-full bg-emerald-200 rounded-md'>
                                    <div className='flex items-center text-emerald-500 px-2 justify-between'>
                                        <p className='text-lg font-bold'>P 70.00</p>
                                        <LuWallet />
                                    </div>
                                    <p className='px-2 text-[0.60rem]'>EPA.Mall Voucher</p>
                                </div>
                                <div className='py-1 border w-full bg-emerald-200 rounded-md'>
                                    <div className='flex items-center text-emerald-500 px-2 justify-between'>
                                        <p className='text-lg font-bold'>P 40.00</p>
                                        <LiaShippingFastSolid />
                                    </div>
                                    <p className='px-2 text-[0.60rem]'>Free Shipping</p>
                                </div>
                                
                            </div>
                        </div>
                        </>
                    )}
                    
                    <div className='flex flex-wrap gap-2 justify-center mb-4'>
                        <RecommendedSectionForYouSection search={ search } />
                    </div>

                </div>
            </div>
        </>
    )
}

export default UpperHeaderMobile