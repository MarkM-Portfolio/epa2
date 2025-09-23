import Cookies from 'universal-cookie'
import epa_logo from '../assets/logo.png'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

export const SideNav = () => {
  const cookies = new Cookies()
  const [ user ] = useState(cookies.get('user'))

  const location = useLocation()
  const urlPath = process.env.NODE_ENV === 'production' ?  '' : 'dashboard'
  const nextPage = process.env.NODE_ENV === 'production' ?  '' : '/'

  return (
    <aside className="relative bg-gradient-to-b from-blue-800 to-blue-950 h-screen w-64 hidden sm:block">
      <div className="p-6">
        <a href={ '/' + urlPath } className="text-white text-3xl font-semibold uppercase">
            <h3 className='flex mb-5 text-4xl font-bold font-montserrat'><img src={ epa_logo } className='w-10 h-10 mr-3' alt="EPA" />EPA<span className='text-orange-600'>.</span><span className='text-2xl font-semibold py-2'></span></h3>
        </a>
      </div>
      <nav className="text-white text-base pt-3 pl-3">
        <a href={ '/' + urlPath } className={`${ (location.pathname === '/' + urlPath) ? 'active-nav-link' : ''} relative flex items-center text-white py-3 pl-6 nav-item rounded-tl-3xl rounded-bl-3xl before:content-[''] before:absolute before:w-14 before:h-14 before:rounded-br-full before:right-0 before:-top-12 before:rotate-6 before:pointer-events-none after:content-[''] after:absolute after:w-14 after:h-14 after:rounded-tr-full after:right-0 after:-bottom-12 after:-rotate-6 after:pointer-events-none`}>
          <i className="fas fa-tachometer-alt mr-3"></i>
          Dashboard
        </a>
        <a href={ '/' + urlPath + nextPage + 'tree-genealogy' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'tree-genealogy') ? 'active-nav-link' : '' } relative flex items-center text-white py-3 pl-6 nav-item rounded-tl-3xl rounded-bl-3xl before:content-[''] before:absolute before:w-14 before:h-14 before:rounded-br-full before:right-0 before:-top-12 before:rotate-6 before:pointer-events-none after:content-[''] after:absolute after:w-14 after:h-14 after:rounded-tr-full after:right-0 after:-bottom-12 after:-rotate-6 after:pointer-events-none`}>
          <i className="fas fa-sticky-note mr-3"></i>
          Networks
        </a>
        <a href={ '/register' } className={`${ (location.pathname === '/register') ? 'active-nav-link' : '' } relative flex items-center text-white py-3 pl-6 nav-item rounded-tl-3xl rounded-bl-3xl before:content-[''] before:absolute before:w-14 before:h-14 before:rounded-br-full before:right-0 before:-top-12 before:rotate-6 before:pointer-events-none after:content-[''] after:absolute after:w-14 after:h-14 after:rounded-tr-full after:right-0 after:-bottom-12 after:-rotate-6 after:pointer-events-none`}>
          <i className="fas fa-table mr-3"></i>
          Register
        </a>
        {/* <a href={ '/' + urlPath + nextPage + 'store' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'store') ? 'active-nav-link' : '' } relative flex items-center text-white py-3 pl-6 nav-item rounded-tl-3xl rounded-bl-3xl before:content-[''] before:absolute before:w-14 before:h-14 before:rounded-br-full before:right-0 before:-top-12 before:rotate-6 before:pointer-events-none after:content-[''] after:absolute after:w-14 after:h-14 after:rounded-tr-full after:right-0 after:-bottom-12 after:-rotate-6 after:pointer-events-none`}>
          <i className="fas fa-align-left mr-3"></i>
          Store
        </a> */}
        { user.role === 'admin' ? 
          <div>
            <a href={ '/' + urlPath + nextPage + 'settings' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'settings') ? 'active-nav-link' : '' } relative flex items-center text-white py-3 pl-6 nav-item rounded-tl-3xl rounded-bl-3xl before:content-[''] before:absolute before:w-14 before:h-14 before:rounded-br-full before:right-0 before:-top-12 before:rotate-6 before:pointer-events-none after:content-[''] after:absolute after:w-14 after:h-14 after:rounded-tr-full after:right-0 after:-bottom-12 after:-rotate-6 after:pointer-events-none`}>
              <i className="fas fa-align-left mr-3"></i>
              Settings
            </a>
            <a href={ '/' + urlPath + nextPage + 'banners' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'banners') ? 'active-nav-link' : '' } relative flex items-center text-white py-3 pl-6 nav-item rounded-tl-3xl rounded-bl-3xl before:content-[''] before:absolute before:w-14 before:h-14 before:rounded-br-full before:right-0 before:-top-12 before:rotate-6 before:pointer-events-none after:content-[''] after:absolute after:w-14 after:h-14 after:rounded-tr-full after:right-0 after:-bottom-12 after:-rotate-6 after:pointer-events-none`}>
              <i className="fas fa-align-left mr-3"></i>
              Banners
            </a>
            {/* <a href={ '/' + urlPath + nextPage + 'admin' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'admin') ? 'active-nav-link' : '' } relative flex items-center text-white py-3 pl-6 nav-item rounded-tl-3xl rounded-bl-3xl before:content-[''] before:absolute before:w-14 before:h-14 before:rounded-br-full before:right-0 before:-top-12 before:rotate-6 before:pointer-events-none after:content-[''] after:absolute after:w-14 after:h-14 after:rounded-tr-full after:right-0 after:-bottom-12 after:-rotate-6 after:pointer-events-none`}>
              <i className="fas fa-align-left mr-3"></i>
              Admin Panel
            </a> */}
            <a href={ '/' + urlPath + nextPage + 'verification' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'admin') ? 'active-nav-link' : '' } relative flex items-center text-white py-3 pl-6 nav-item rounded-tl-3xl rounded-bl-3xl before:content-[''] before:absolute before:w-14 before:h-14 before:rounded-br-full before:right-0 before:-top-12 before:rotate-6 before:pointer-events-none after:content-[''] after:absolute after:w-14 after:h-14 after:rounded-tr-full after:right-0 after:-bottom-12 after:-rotate-6 after:pointer-events-none`}>
              <i className="fas fa-align-left mr-3"></i>
              Verification
            </a>
            <a href={ '/' + urlPath + nextPage + 'pkgstatus' } className={`${ (location.pathname === '/' + urlPath + nextPage + 'admin') ? 'active-nav-link' : '' } relative flex items-center text-white py-3 pl-6 nav-item rounded-tl-3xl rounded-bl-3xl before:content-[''] before:absolute before:w-14 before:h-14 before:rounded-br-full before:right-0 before:-top-12 before:rotate-6 before:pointer-events-none after:content-[''] after:absolute after:w-14 after:h-14 after:rounded-tr-full after:right-0 after:-bottom-12 after:-rotate-6 after:pointer-events-none`}>
              <i className="fas fa-align-left mr-3"></i>
              Package Status
            </a>
          </div>
          : 
          ''
        }
      </nav>
    </aside>
  )
}
