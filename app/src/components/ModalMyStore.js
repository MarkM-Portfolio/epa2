import Cookies from 'universal-cookie'
import axios from 'axios'
import classNames from 'classnames'
import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ModalMyStore = ({ show, onClose, children, store, storeImg, storeName, storeDesc, 
                        storeContactNum, storeAddress, storeCity,
                        storeProvince, storeZipCode, storeCountry }) => {

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
        'bg-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto',
        {
            'hidden': !show,
            'block': show,
            'sm:w-3/4': show,
            'md:w-1/2': show,
            'lg:w-1/3': show
        }
    )
    
    const createStore = async (e) => {
        e.preventDefault()

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
    
        const formData = new FormData()
        formData.append('stores', storeImg)
        formData.append('name', storeName)
        formData.append('description', storeDesc)
        formData.append('contactnumber', storeContactNum)
        formData.append('address', storeAddress)
        formData.append('city', storeCity)
        formData.append('province', storeProvince)
        formData.append('zipcode', storeZipCode)
        formData.append('country', storeCountry)

        await axios.post(`/api/store/buildstore/${ user.id }`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'multipart/form-data',
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
                        <button onClick={ e => createStore(e) } className='bg-emerald-500 hover:bg-red-700 py-2 px-4 rounded'>Create</button>
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

export default ModalMyStore
