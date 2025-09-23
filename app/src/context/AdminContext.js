import { createContext } from "react"

const AdminContext = createContext()

export function AdminProvider({children}){

    // const submitTopUp = (e) => {
    //     e.preventDefault()
    //     console.log("Topup Amount:", TopUpAmount)
    //     console.log(payment)
    // }

    return(
        <AdminContext.Provider value={{}}>
            {children}
        </AdminContext.Provider>
    )
}

export default AdminContext
