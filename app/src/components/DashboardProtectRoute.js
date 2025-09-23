import { Navigate, Outlet } from "react-router-dom"
import { isMobile } from "react-device-detect"

const DashboardProtectRoute = () => {

    const mobileRender = <h1 className='text-3xl text-red-500 font-bold'>Mobile View for Dashboard disabled</h1> 
    const urlPath = process.env.NODE_ENV === 'production' ? '' : 'dashboard'

    if (process.env.NODE_ENV === 'production' && location.pathname === '/dashboard')
        return isMobile ? <>{ mobileRender }<Navigate to="/"/></> : <Navigate to="/"/>

    if (location.pathname === '/' + urlPath) {
        return isMobile ? mobileRender : <Outlet />
    } else {
        return <Outlet />   
    }
}

export default DashboardProtectRoute
