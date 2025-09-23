import Cookies from 'universal-cookie'
import { Navigate, Outlet } from "react-router-dom"

const useAuth = () => {
    const cookies = new Cookies()
    const token = cookies.get('token')
    
    return token
}

const ProtectedRoutes = () => {
    const isAuth = useAuth()
    
    return isAuth ? <Outlet /> : <Navigate to="/login"/>
}

export default ProtectedRoutes
