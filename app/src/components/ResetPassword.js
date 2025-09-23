import Cookies from 'universal-cookie'
import axios from 'axios'
import epa_logo from '../assets/logo.png'
import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ResetPassword = () => {

  const cookies = new Cookies()
  const email = cookies.get('email')
  const [ password, setPassword ] = useState('')
  const [ confirmpw, setConfirmPw ] = useState('')

  const resetPw = async (e) => {
    e.preventDefault()
    e.currentTarget.disabled = true

    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    const formData = new FormData()
    formData.append('password', password)
    formData.append('confirmpw', confirmpw)

    await axios.put(`/api/user/resetpassword/${ email }`, formData, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.API_KEY
        },
        data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        toast.success(res.data.message)
        cookies.remove('email')
        cookies.remove('resetToken')
        setTimeout(() => {
          window.location.href= '/'
        }, 3000)
        return res
    }).catch((err) => {
      if (axios.isCancel(err)) {
        console.log('Successfully Aborted')
        toast.error(err.response.data.error)
      } else if (err.response.status === 422) { // response >> validation errors
          console.log('Validation Error: ', err.response.status)
          setPassword('')
          setConfirmPw('')
          toast.error(err.response.data.error)
      } else if (err.response.status === 403) { // response >> headers forbidden
          console.log('Forbidden: ', err.response.status)
          toast.error(err.response.data.error)
      } else { // response >> server/page not found 404,500
          console.log('Server Error: ', err.response.status)
          toast.error(err.response.data.error)
      }
    })
  }

  return (
    <>
        <div className="h-screen bg-gradient-to-r from-emerald-300 to-lime-300 flex items-center justify-center text-gray-600">
           <div className="px-8 py-6 mt-4 text-left -translate-y-32">
              <h3 className='flex mb-5 text-4xl font-bold font-montserrat'><img src={ epa_logo } className='w-10 h-10 mr-3' alt="EPA" />EPA<span className='text-orange-600'>.</span><span className='text-2xl font-semibold py-2'></span></h3>   
                <div className='px-8 py-6 mt-4 shadow-lg bg-emerald-100'>
                <h3 className="text-2xl font-bold text-center">Reset Password</h3>

                <form onSubmit={ resetPw } className='p-2'>
                    <br />
                    <input 
                    className='border-2 p-2 mt-2 bg-purple-100'
                    type="password" 
                    placeholder="Password" 
                    onChange={(e) => setPassword(e.target.value)}
                    value={ password }
                />
                <br />
                    <input 
                    className='border-2 p-2 mt-2 bg-purple-100'
                    type="password" 
                    placeholder="Confirm Password" 
                    onChange={(e) => setConfirmPw(e.target.value)}
                    value={ confirmpw }
                    />
                    <br />
                    <div className='mt-2 text-center'>
                    <button className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2'>Submit</button>
                    </div>
                    <div className='mt-2 text-center'>
                    <p>Enter your new password</p>
                    </div>
                </form>
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

export default ResetPassword
