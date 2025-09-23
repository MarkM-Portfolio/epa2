import Cookies from 'universal-cookie'
import axios from 'axios'
import BestDeals from './BestDeals'
import RecommendedSectionForYouSection from '../MobileView/RecommendedSectionForYouSection'
import Carousel from "react-multi-carousel"
import "react-multi-carousel/lib/styles.css"
import { useEffect, useState } from 'react'
import { IoMdNotifications, IoMdNotificationsOff, IoMdChatbubbles } from 'react-icons/io'
import { BsCartX, BsFillCartCheckFill } from 'react-icons/bs'
import { TbCurrencyPeso } from 'react-icons/tb'
import { NavLink } from 'react-router-dom'

import epa_logo from '../../assets/logo.png'
import apparels from '../../assets/categories/apparels.png'
import autoparts from '../../assets/categories/autoparts.png'
import beautyproducts from '../../assets/categories/beautyproducts.png'
import books from '../../assets/categories/books.png'
import clothing from '../../assets/categories/clothing.png'
import electronics from '../../assets/categories/electronics.png'
import foodbeverage from '../../assets/categories/foodbeverage.png'
import healthcare from '../..//assets/categories/healthcare.png'
import UpperHeaderMobile from './UpperHeaderMobile'

const HeaderMobile = () => {

    const cookies = new Cookies()
    const isAuth = cookies.get('token')
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ notifications, setNotifications ] = useState('')
    // const [ key, setKey ] = useState('')
    const [ search, setSearch ] = useState('')
    const [ seeAll, setSeeAll ] = useState(false)

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

    const responsive = {
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 4
        }
    }

    const handleSeeAll = () => {
        setSeeAll(!seeAll)
    }

    const handleSearch = async(e) => {
        // setKey(e.target.value)
        setSearch(e.target.value)
    }

    // const searchNow = (e) => {
    //     e.preventDefault()
    //     setSearch(key)
    // }

    return (
        <>
            {/* <div className='lg:hidden sticky top-0 z-40 bg-gradient-to-r from-emerald-500 to-lime-500 py-3 items-center mb-3'>
                <div className='flex px-6 justify-between'>
                    <div className='flex items-center gap-2'>                   
                        <div className='font-montserrat'>
                           
                            <h3 className='grid grid-cols-3 text-4xl font-bold font-montserrat'><img src={ epa_logo } className='w-12 h-12' alt="EPA" /><span className='text-2xl font-semibold px-10 py-2'>Home</span></h3>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>

                        <NavLink to={ isAuth ? '/notifications' : '/login' }>
                            { notifications ? 
                                <IoMdNotifications className='text-xl text-gray-700 fill-orange-600'/>
                                :
                                <IoMdNotificationsOff className='text-xl text-gray-700'/>
                            }
                        </NavLink>

                        <NavLink to={ isAuth ? '/cart' : '/login' }>
                            { currentUser.cart ?
                                <BsFillCartCheckFill className='text-xl text-gray-700 fill-orange-600'/>
                                :
                                <BsCartX className='text-xl text-gray-700'/>
                            }
                        </NavLink>

                        <NavLink to={ isAuth ? '/chat' : '/login' }>
                            <IoMdChatbubbles className='text-xl text-gray-700'/>
                        </NavLink>   

                    </div>
                </div>

                <div className='text-center'>    
                    <form className='px-6 mt-4'>   
                        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>
                            <div className='flex flex-cols'>
                                <input type="search" id="default-search" className="block w-full p-4 pl-10 text-base rounded-lg bg-gray-100" placeholder="Search here..." onChange={ handleSearch } required />
                            </div>
                        </div>
                    </form>
                </div>

                { user && currentUser.class !== 'Member' ?
                    <div className='mt-4 flex flex-cols text-xs justify-between'>
                        <div className='px-6 rounded flex'>
                            <div className='flex items-center gap-2'>
                                <p className='text-amber-200 font-semibold'>Credit Line:</p>
                                <div className='flex items-center font-semibold'>
                                    <TbCurrencyPeso color='red'/>
                                    <p className='text-gray-200'>{ String(parseFloat(currentUser.epacredits).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || 0 }</p>
                                </div>
                            </div>
                        </div>
                        <div className='px-6 rounded flex'>
                            <div className='flex items-center gap-2'>
                                <p className='text-amber-200 font-semibold'>Token Quota:</p>
                                <div className='flex items-center font-semibold'>
                                    <TbCurrencyPeso color='red'/>
                                    <p className='text-gray-200'>{ String(parseFloat(currentUser.epatokens).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || 0 }</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    ''
                }
            </div> */}
            <UpperHeaderMobile />
            {/* <BestDeals /> */}

            { /* Category Section */ }
            {/* <div className='px-6 lg:hidden font-montserrat'>
                <div className='mt-2 flex justify-between'>
                    <h1 className='text-gray-600 font-semibold'>Category</h1>
                    <button className='text-emerald-500 underline font-semibold' onClick={ () => handleSeeAll() }>
                        { seeAll ? 'Back' : 'See All' }
                    </button>
                </div>

                { seeAll ? 
                    <>
                        <div className='mt-2 flex flex-wrap gap-4 px-4 justify-between'>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={apparels} onClick={() => setSearch('Apparel and Accessories')} />
                                <p className='text-center text-[0.58rem]'>Apparel and Accessories</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={autoparts} onClick={() => setSearch('Auto and Parts')} />
                                <p className='text-center text-[0.58rem]'>Auto and Parts</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={books} onClick={() => setSearch('Books, Movies, Music and Games')} />
                                <p className='text-center text-[0.58rem]'>Books, Movies, Music and Games</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={clothing} onClick={() => setSearch('Clothing')} />
                                <p className='text-center text-[0.58rem]'>Clothing</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={electronics} onClick={() => setSearch('Consumer Electronics')} />
                                <p className='text-center text-[0.58rem]'>Consumer Electronics</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={foodbeverage} onClick={() => setSearch('Food and Beverage')} />
                                <p className='text-center text-[0.58rem]'>Food and Beverage</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={healthcare} onClick={() => setSearch('Health, Care and Beauty')} />
                                <p className='text-center text-[0.58rem]'>Health, Care and Beauty</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={beautyproducts} onClick={() => setSearch('Shoes')} />
                                <p className='text-center text-[0.58rem]'>Shoes</p>
                            </div>
                        </div>
                
                        { search ? 
                            <div className='pt-5 flex items-center justify-center'>
                                <button className='outline outline-offset-2 outline-gray-500 w-16 rounded text-center' onClick={ () => setSearch('') }>
                                    <p className='text-xs'>Clear</p>
                                </button>
                            </div>
                            : 
                            ''
                        }
                    </>
                    :
                    <>
                        <Carousel
                            className='mt-2 px-4'
                            responsive={ responsive }
                            showArrows={ false } 
                            arrows={ false }
                            infinite={ true }
                            autoPlay={ true }
                            autoPlaySpeed={ 4000 }
                        >
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={ apparels } onClick={() => setSearch('Apparel and Accessories')} />
                                <p className='text-center text-[0.58rem]'>Apparel and Accessories</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={ autoparts } onClick={() => setSearch('Auto and Parts')} />
                                <p className='text-center text-[0.58rem]'>Auto and Parts</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={ books } onClick={() => setSearch('Books, Movies, Music and Games')} />
                                <p className='text-center text-[0.58rem]'>Books, Movies, Music and Games</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={ clothing } onClick={() => setSearch('Clothing')} />
                                <p className='text-center text-[0.58rem]'>Clothing</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={ electronics } onClick={() => setSearch('Consumer Electronics')} />
                                <p className='text-center text-[0.58rem]'>Consumer Electronics</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={ foodbeverage } onClick={() => setSearch('Food and Beverage')} />
                                <p className='text-center text-[0.58rem]'>Food and Beverage</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={ healthcare } onClick={() => setSearch('Health, Care and Beauty')} />
                                <p className='text-center text-[0.58rem]'>Health, Care and Beauty</p>
                            </div>
                            <div className='w-16 rounded-full'>
                                <img className='h-16' src={ beautyproducts } onClick={() => setSearch('Shoes')} />
                                <p className='text-center text-[0.58rem]'>Shoes</p>
                            </div>
                        </Carousel>

                        { search ? 
                            <div className='pt-5 flex items-center justify-center'>
                                <button className='outline outline-offset-2 outline-gray-500 w-16 rounded text-center' onClick={ () => setSearch('') }>
                                    <p className='text-xs'>Clear</p>
                                </button>
                            </div>
                            : 
                            ''
                        }
                    </>
                }
            </div> */}
            
            {/* <RecommendedSectionForYouSection search={ search } /> */}
        </>
    )
}

export default HeaderMobile
