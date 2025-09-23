import Cookies from 'universal-cookie'
import axios from 'axios'
import epa_logo from '../../assets/logo.png'
import { useState, useEffect } from 'react'
import { AiOutlineDollarCircle, AiOutlineHeart } from 'react-icons/ai'
import { IoMdChatbubbles, IoIosLock } from 'react-icons/io'
import { BiUser } from 'react-icons/bi'
import { BsCart3 } from 'react-icons/bs'
import { IoWalletOutline } from 'react-icons/io5'
import { NavLink } from 'react-router-dom'

const NavbarMobile = () => {
    const cookies = new Cookies()
    const isAuth = cookies.get('token')
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ orders, setOrders ] = useState([])
    const [ iou, setIou ] = useState([])

    const navLinkStyles = ({ isActive }) => {
        return {
            color: isAuth && isActive ? `${ user.class === 'Entrepreneur' ? '#84CC16' : user.class === 'Supervisor' ? '#06b6D4' : user.class === 'Manager' ? '#F59E0B' : user.class === 'CEO' ? '#C084FC' : user.class === 'Business Empire' ? '#EF4444' : user.class === 'Silver' ? '#C0C0C0' : user.class === 'Gold' ? '#FFD700' : 'green' }` : 'gray',
            // textAlign: 'center',
            // margin: 'auto'
        }
    }
   
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

        if (isAuth && currentUser && currentUser._id) {
            axios.get(`/api/order`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                res.data.orders.forEach(item => {
                    setOrders(item.details.filter(det => det.owner.includes(currentUser._id) && !det.isCancelled && !det.isReceived))
                })
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ isAuth, currentUser ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (isAuth && user && user.id) {
            axios.get(`/api/load/iou/${ user.email }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                // if (!res.data.load.isIouConfirmed)
                //     setIou(res.data.load)
                setIou(res.data.load.filter(item => !item.isIouConfirmed))
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ isAuth, user ])

    return (
        <>
            <nav className="bg-white border-t border-gray-200 lg:hidden fixed bottom-0 left-0 w-full font-montserrat text-xs z-45">
                <div className={ `${ cookies.get('delegatePin') ? 'px-4' : 'px-4' } container mx-auto` }>
                    <div className="flex justify-between py-2 text-nowrap">

                        { isAuth && cookies.get('delegatePin') ? 
                            <NavLink style={ navLinkStyles }>
                                <div className='nav-link'>
                                    <IoIosLock color='gray' className='w-8 h-6' />
                                    <p className='text-gray-300'>Home</p>
                                </div>
                            </NavLink>
                            :
                            <NavLink to='/' style={ navLinkStyles }>                                                 
                                <div className='nav-link'>
                                    <img src={ epa_logo } className='w-6 h-6' alt="EPA" />
                                    Home
                                </div>          
                            </NavLink>  
                        }
                        
                        { isAuth && cookies.get('delegatePin') ? 
                            <NavLink style={ navLinkStyles }>
                                <div className='flex justify-center'>
                                    <IoIosLock color='gray' className='w-8 h-6' />
                                </div>
                                <p className='text-gray-300'>Cart</p>
                            </NavLink>
                            : 
                            isAuth && currentUser.class !== 'Member' && (
                                <NavLink to={ isAuth ? '/cart' : '/login' } style={ navLinkStyles }>
                                    <div className='flex justify-center'>
                                        <BsCart3 className='w-6 h-6' />
                                        { isAuth && currentUser && currentUser.cart ?
                                            currentUser.cart.length ? 
                                                <div className="colored-circle">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className={ `${ currentUser.cart.length > 9 ? 'pl-[2px]' : currentUser.cart.length === 1 ? 'pl-[6px]' : currentUser.cart.length === 4 ? 'pl-[4px]' : 'pl-[5px]' } text-white font-xs font-semibold` }>{ currentUser.cart.length }</span>
                                                </div> 
                                                : '' 
                                            : 
                                            '' 
                                        }
                                    </div>
                                    Cart        
                                </NavLink> 
                            ) 
                        }
                        
                        { isAuth && cookies.get('delegatePin') ? 
                            <NavLink style={ navLinkStyles }>
                                <div className='flex justify-center'>
                                    <IoIosLock color='gray' className='w-8 h-6' />
                                </div>
                                <p className='text-gray-300'>e-Wallet</p>
                            </NavLink>
                            :
                            <NavLink to={ isAuth ? '/epawallet' : '/login' } style={ navLinkStyles }>
                                <div className='flex justify-center'>
                                    <IoWalletOutline className='w-6 h-6' />
                                    { isAuth && currentUser && iou ?
                                        iou.length ? 
                                            <div className="colored-circle">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className='pl-[6px] text-white font-xs font-semibold'>{ iou.length }</span>
                                            </div> 
                                            : '' 
                                        : 
                                        '' 
                                    }
                                </div>
                                e-Wallet
                            </NavLink>
                        }
                        
                        { isAuth && currentUser.class !== 'Member' &&
                            <NavLink to={ isAuth ? '/mystore' : '/login' } style={ navLinkStyles }>                            
                                <div className='flex justify-center'>
                                    <AiOutlineDollarCircle className={ `${ cookies.get('delegatePin') ?' w-8' : 'w-6' } h-6 `} />
                                    { isAuth && currentUser && orders.length ?
                                        orders.length ? 
                                            <div className="colored-circle">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className={ `${ orders.length > 9 ? 'pl-[2px]' : orders.length === 1 ? 'pl-[6px]' : orders.length === 4 ? 'pl-[4px]' : 'pl-[5px]' } text-white font-xs font-semibold` }>{ orders.length }</span>
                                            </div> 
                                            : '' 
                                        : 
                                        '' 
                                    }
                                </div>
                                My Store
                            </NavLink> 
                        }

                        {/* <NavLink to="/chat" style={ navLinkStyles }>
                        <div className='flex justify-center'>
                            <IoMdChatbubbles className='w-6 h-6' />
                        </div>
                            Chat
                        </NavLink> */}
                        { isAuth && cookies.get('delegatePin') ? 
                            <NavLink style={ navLinkStyles }>
                                <div className='flex justify-center'>
                                    <IoIosLock color='gray' className='w-8 h-6' />
                                </div>
                                <p className='text-gray-300'>Profile</p>
                            </NavLink>
                            : 
                            <NavLink to={ isAuth ? '/profile' :'/login' } style={ navLinkStyles }>
                                <div className='flex justify-center'>
                                    <BiUser className='w-6 h-6' />
                                </div>
                                Profile
                            </NavLink>
                        }

                        {/* <NavLink to={ isAuth ? '/favorites' : '/login' } style={ navLinkStyles }>
                            <div className='flex justify-center'>
                                <AiOutlineHeart className='w-6 h-6' />
                            </div>
                            Favorites
                        </NavLink> */}
                    </div>
                </div>
            </nav>
        </>
    )
  }
  
  export default NavbarMobile
