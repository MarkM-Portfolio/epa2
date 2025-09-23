import Cookies from 'universal-cookie'
import { Navigate, Outlet } from "react-router-dom"

const useAuth = () => {
    const cookies = new Cookies()
    const token = cookies.get('token')
    
    return token
}

const LoginProtectRoute = () => {
    const isAuth = useAuth()   
    
    return isAuth ? <Navigate to="/"/> : <Outlet />
}

export default LoginProtectRoute
