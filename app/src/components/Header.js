import React from 'react'
import { AiOutlineClose, AiOutlineUser, AiOutlineHeart, AiOutlineShoppingCart  } from 'react-icons/ai'
import { HiOutlineStatusOnline, HiMenuAlt2 } from 'react-icons/hi'
import { IoMdChatbubbles } from 'react-icons/io';
import { FaLocationDot } from 'react-icons/fa6'
import { FaSearch } from 'react-icons/fa'
import epa_logo from '../assets/logo.png'


const Header = () => {
    
    // const [nav, setNav] = useState(false)
    // const handleClick = () => setNav(!nav)
    
  return (
    <>
        <div className='hidden lg:block py-4 border-b'>
           
            <div className="container mx-auto flex justify-between items-center xl:px-20">
               <div className='flex gap-4 text-xs tracking-tight font-montserrat font-semibold'>
                    <a href="/" className='hover:text-green-400'>SUPER DEALS</a>
                    <a href="/" className='hover:text-green-400'>FEATURE BRANDS</a>
                    <a href="/" className='hover:text-green-400'>TRENDING STYLES</a>
                    <a href="/" className='hover:text-green-400'>GIFT CARDS</a> 
               </div>

               <div className='flex gap-4 text-xs tracking-tight font-montserrat font-semibold'>                                      
                    <div className='flex items-center gap-2 hover:text-green-400'>
                        <FaLocationDot className='text-lg'/>
                        <a href="/">STORE LOCATOR</a>
                    </div>
                    <div className='flex items-center gap-2 hover:text-green-400'>
                        <HiOutlineStatusOnline className='text-lg'/>
                        <a href="/">TRACK YOUR ORDER</a>
                    </div>
                    <div className='flex items-center gap-2 hover:text-green-400'>
                        <AiOutlineUser className='text-lg'/>
                        <a href="/">MY ACCOUNT</a>
                    </div>
               </div>

            </div>
        </div>

        {/* Lower Navbar */}
        <div className='py-6 lg:py-12'>
            <div className='container mx-auto flex items-center justify-between xl:px-20'>
                <div className='ml-4 hidden lg:flex justify-between items-center gap-4'>
                    <div className='flex items-center gap-4'>
                        <a href="/">
                            <img src={epa_logo} className='w-16 h-16' alt="EPA"/>
                        </a> 
                        <h1 className='text-4xl font-bold font-montserrat'>EPA<span className='text-green-500'>.</span></h1>                                                                                                                
                    </div>                   
                    <ul className='hidden lg:flex items-center gap-8 font-montserrat'>
                        <li><a href="/" className='hover:text-green-500'>Home</a></li>
                        <li><a href="/" className='hover:text-green-500'>Pages</a></li>
                        <li><a href="/" className='hover:text-green-500'>Shop</a></li>
                        <li><a href="/" className='hover:text-green-500'>Blog</a></li>
                        <li><a href="/" className='hover:text-green-500'>Elements</a></li>                                         
                    </ul>
                </div>
                

                {/* <div onClick={handleClick} className='lg:hidden z-10'>
                    {!nav ? <HiMenuAlt2 className='text-3xl mr-4'/> : <AiOutlineClose  className='text-3xl mr-4 text-white'/>}
                </div> */}

                {/* <ul className={!nav ? 'hidden' : 'dark:bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% text-white bg-white absolute top-0 left-0 w-full h-screen flex flex-col justify-center items-center'}>
                    <li className='py-6 text-4xl'>  
                        Home        
                    </li>
                    <li className='py-6 text-4xl'>  
                        Pages          
                    </li>
                    <li className='py-6 text-4xl'>     
                        Shop     
                    </li>
                    <li className='py-6 text-4xl'>         
                        Blog   
                    </li>
                    <li className='py-6 text-4xl'>    
                        Elements  
                    </li>
                </ul> */}

                <div className='hidden lg:flex items-center gap-4'>
                    <div className='relative'>
                        <input
                            type="text"
                            className="py-3 px-8 border border-gray-300 focus:border-green-500 focus:outline-none"
                            placeholder="Search..."
                        />
                        <div className="absolute inset-y-0 right-0 pr-6 flex items-center pl-3 pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                    </div> 

                    <div className='flex items-center gap-4'>
                        <a href="/"><AiOutlineHeart className='text-2xl'/></a>
                        <a href="/">
                            <div className="relative">
                                <AiOutlineShoppingCart className="text-2xl text-gray-600" />

                                {/* Badge Notification */}                          
                                <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 absolute top-0 right-0 -mt-1 -mr-1 flex justify-center items-center">
                                    1
                                </span>                          
                            </div>
                        </a>

                        <a href='/chat'>
                            <div className="relative">
                                <IoMdChatbubbles className="text-2xl text-gray-600" />

                                {/* Chat Notification */}   
                                <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 absolute top-0 right-0 -mt-1 -mr-1 flex justify-center items-center">
                                    1 
                                </span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default Header
