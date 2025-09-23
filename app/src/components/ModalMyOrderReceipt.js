import axios from 'axios'
import classNames from 'classnames'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ModalMyOrderReceipt = ({ show, onClose, children, item, userImg1, userImg2, userImg3 }) => {

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

    const readFileAsBlob = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const result = reader.result
                resolve(new Blob([result], { type: file.type }))
            }
            reader.onerror = reject
            reader.readAsArrayBuffer(file)
        })
    }

    const handleFileSave = async() => {
        // console.log(' Item >>)
        const userImg1Blob = await readFileAsBlob(userImg1)
        const userImg2Blob = await readFileAsBlob(userImg2)
        const userImg3Blob = await readFileAsBlob(userImg3)

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('order', userImg1Blob)
        formData.append('order', userImg2Blob)
        formData.append('order', userImg3Blob)
        
        await axios.put(`/api/order/submit-orderReceipt/${ item._id }`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'multipart/form-data',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.message)
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
                        <button className="text-gray-500 hover:text-gray-800 focus:outline-none" onClick={ () => onClose() } >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="mt-4">{ children }
                        <div className='flex justify-end text-white mt-4'>
                            <button onClick={ () => handleFileSave() } className='bg-orange-500 hover:bg-red-700 py-2 px-4 rounded'>Submit</button>
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

export default ModalMyOrderReceipt
