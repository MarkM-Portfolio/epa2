import Cookies from 'universal-cookie'
import axios from 'axios'
import epa_logo from '../assets/logo.png'
import Dashboard from '../pages/Dashboard'
import Genealogy from '../pages/Genealogy'
import Settings from '../pages/Settings'
// import Admin from '../pages/Admin'
import Verification from '../pages/Verification'
import PackageStatus from '../pages/PackageStatus'
import Banners from '../pages/Banners'
import { Footer } from './Footer'
import { SideNav } from './SideNav'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const AppDashboard = () => {
  const navigate = useNavigate()
  const cookies = new Cookies()
  const isAuth = cookies.get('token')
  const [ user ] = useState(cookies.get('user'))
  const [ currentUser, setCurrentUser ] = useState([])

  const location = useLocation()
  const urlPath = process.env.NODE_ENV === 'production' ? '' : 'dashboard'
  const nextPage = process.env.NODE_ENV === 'production' ?  '' : '/'

   // State to manage the visibility of the menu
   const [ isMenuOpen, setIsMenuOpen ] = useState(false)

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
      }
      return () => { source.cancel() }
  }, [ isAuth ])

   // Handler to toggle the menu
   const toggleMenu = () => {
     setIsMenuOpen(!isMenuOpen)
  }

  const goToApp = () => {
    if (process.env.NODE_ENV === 'production')
      window.location.href = `https://${ process.env.DOMAIN }`
    else
      navigate('/')
 }

  return (
    <div className="bg-gray-100 font-family-karla flex">
      <SideNav />
      <div className="w-full flex flex-col h-screen overflow-y-hidden">
        <header className="w-full items-center py-4 px-6 hidden sm:flex">
          { location.pathname === '/' + urlPath ? <h1 className="text-xl text-black uppercase">Dashboard</h1> : '' }
          <div className="w-1/2"></div>
          <div x-data="{ isOpen: false }" className="relative w-1/2 flex justify-end">
            <button className="realtive z-10 w-8 h-8 rounded-full overflow-hidden border-4 border-gray-400 hover:border-gray-300 focus:border-gray-300 focus:outline-none">
              <img src={ currentUser.avatar ? window.location.origin + '/private/avatar/' + currentUser.avatar : 'https://source.unsplash.com/uJ8LNVCBjFQ/400x400' } />
            </button>
            {/* <button x-show="isOpen" className="h-full w-full fixed inset-0 cursor-default"></button>
            <div x-show="isOpen" className="absolute w-32 bg-white rounded-lg shadow-lg py-2 mt-16">
                <a href="#" className="block px-4 py-2 account-link hover:text-white">Account</a>
                <a href="#" className="block px-4 py-2 account-link hover:text-white">Support</a>
                <a href="#" className="block px-4 py-2 account-link hover:text-white">Sign Out</a>
            </div> */}
          </div>
        </header>
        <header className="w-full bg-gradient-to-r from-blue-800 to-blue-950 py-5 px-6 sm:hidden">
          <div className="px-4 flex items-center justify-between gap-2">
            <h4 className='flex items-center text-white text-3xl font-bold font-montserrat'>
              <img onClick={ goToApp } src={ epa_logo } className='w-12 h-12' alt="EPA" />
              <span className='text-2xl font-semibold px-12'>Dashboard</span>
            </h4>
            <button onClick={ toggleMenu } className="text-white text-3xl focus:outline-none">
              <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
              </svg>
            </button>
          </div>
          { isMenuOpen && (
            <nav className="flex-col pt-4">
              <a href={ '/' + urlPath } className={`${ (location.pathname === '/' + urlPath) ? 'active-nav-link' : ''} flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item` }>
              <i className="fas fa-tachometer-alt mr-3"></i>
                Dashboard
              </a>
              <a href={ '/' + urlPath + nextPage + 'tree-genealogy' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'tree-genealogy') ? 'active-nav-link' : '' } flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item` }>
              <i className="fas fa-sticky-note mr-3"></i>
                Networks
              </a>
              <a href={ '/register' } className={`${ (location.pathname === '/register') ? 'active-nav-link' : '' } flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item` }>
              <i className="fas fa-table mr-3"></i>
                Register
              </a>
              {/* <a href={ '/' + urlPath + nextPage + 'store' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'store') ? 'active-nav-link' : '' } flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item` }>
              <i className="fas fa-align-left mr-3"></i>
                Store
              </a> */}
            { user.role === 'admin' ? 
              <div>
                <a href={ '/' + urlPath + nextPage + 'settings' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'settings') ? 'active-nav-link' : '' } flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item` }>
                  <i className="fas fa-align-left mr-3"></i>
                  Settings
                </a>
                <a href={ '/' + urlPath + nextPage + 'banners' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'banners') ? 'active-nav-link' : '' } flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item` }>
                  <i className="fas fa-align-left mr-3"></i>
                  Banners
                </a>
                {/* <a href={ '/' + urlPath + nextPage + 'admin' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'admin') ? 'active-nav-link' : '' } flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item` }>
                  <i className="fas fa-align-left mr-3"></i>
                  Admin Panel
                </a> */}
                <a href={ '/' + urlPath + nextPage + 'verification' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'admin') ? 'active-nav-link' : '' } flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item` }>
                  <i className="fas fa-align-left mr-3"></i>
                  Verification
                </a>
                <a href={ '/' + urlPath + nextPage + 'pkgstatus' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'admin') ? 'active-nav-link' : '' } flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item` }>
                  <i className="fas fa-align-left mr-3"></i>
                  Package Status
                </a>
              </div>
              : 
              ''
            }
          </nav>
           ) }
        </header>
        <div className="w-full h-full overflow-x-hidden flex flex-col">
          <main className="w-full flex-grow px-6 pb-10">
            <Routes>
              <Route path="/" element={ < Dashboard /> } />
              <Route path="/tree-genealogy" element={ < Genealogy /> } />
              { isAuth && user.role === 'admin' && (
                <>
                  <Route path="/settings" element={ < Settings /> } />
                  <Route path="/banners" element={ < Banners /> } />
                  {/* <Route path="/admin" element={ < Admin /> } /> */}
                  <Route path="/verification" element={ < Verification /> } />
                  <Route path="/pkgstatus" element={ < PackageStatus /> } />
                </>
              )}
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default AppDashboard
