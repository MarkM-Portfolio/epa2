import Cookies from 'universal-cookie'
import axios from 'axios'
import classNames from 'classnames'
import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ModalTransferAccount = ({ show, onClose, children, transferUserId, name, email, mobilenum, password, confirmpw }) => {

    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))

    const overlayClasses = classNames(
        'fixed inset-0 flex items-center justify-center z-50',
        {
          'hidden': !show,
          'block': show
        }
    )
        
    const modalClasses = classNames(
        'bg-gray-200 rounded-lg w-3/4 p-6 max-h-96 overflow-y-auto',
        {
            'hidden': !show,
            'block': show,
            'sm:w-3/4': show,
            'md:w-1/2': show,
            'lg:w-1/3': show
        }
    )
    
    const transferAccount = async (e) => {
        e.preventDefault()
        e.currentTarget.disabled = true

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const fullname = name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').trim() // format name input
    
        const formData = new FormData()
        formData.append('transferUserId', transferUserId)
        formData.append('name', fullname)
        formData.append('email', email)
        formData.append('mobilenum', mobilenum)
        formData.append('password', password)
        formData.append('confirmpw', confirmpw)

        await axios.put(`/api/user/account-transfer/${ user.id }`, formData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.success(res.data.message)
            onClose()
            setTimeout(() => {
                window.location.reload()
            }, 1000)
            return res
        }).catch((err) => {
            if (axios.isCancel(err)) {
                console.log('Successfully Aborted')
                toast.error(err.response.data.error)
            } else if (err.response.status === 422) { // response >> validation errors
                console.log('Validation Error: ', err.response.status)
                toast.error(err.response.data.error)
            } else if (err.response.status === 403) { // response >> headers forbidden
                console.log('Forbidden: ', err.response.status)
                toast.error(err.response.data.error)
            } else { // response >> server/page not found 404,500
                console.log('Server Error: ', err.response.status)
                toast.error(err.response.data.error)
            }
            return err
        })
    }

    return (
      <>
        <div className={ overlayClasses }>
            <div className={ modalClasses }>
                <div className="flex justify-end">
                    <button className="text-gray-500 hover:text-gray-800 focus:outline-none" onClick={ onClose } >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mt-4">{ children }
                    <div className='flex justify-end text-white mt-4'>
                        <button onClick={ e => transferAccount(e) } className='bg-emerald-500 hover:bg-red-700 py-2 px-4 rounded'>Transfer</button>
                    </div>
                </div>
            </div>
        </div>
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </>
    )
}

export default ModalTransferAccount
