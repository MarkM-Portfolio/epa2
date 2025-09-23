import Cookies from 'universal-cookie'
import axios from 'axios'
import epa_logo from '../assets/logo.png'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import { Input, InputAdornment, IconButton } from '@mui/material' 
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Login = () => {
  
  const navigate = useNavigate()
  const cookies = new Cookies()
  const [ user ] = useState(cookies.get('user'))
  const [ email, setEmail ] = useState(user ? user.email : '')
  const [ password, setPassword ] = useState('')
  const [ showPassword, setShowPassword ] = useState(false)
  const [ loginOther, setLoginOther ] = useState(false)
  const [ isLoading, setIsLoading ] = useState(false)

  const goBack = () => {
    navigate(-1)
  }

  const loginUser = async (e) => {
    e.preventDefault()
    e.currentTarget.disabled = true

    setIsLoading(true)

    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    const formData = new FormData()
    formData.append('email', email.toLowerCase())
    formData.append('password', password)

    await axios.post('/api/user/login', formData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': process.env.API_KEY
      },
      data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        toast.success(res.data.message)
        cookies.remove('user')
        cookies.set('token', res.data.token)
        cookies.set('user', JSON.stringify(res.data.user))
        setTimeout(() => {
          window.location.href= '/' // add timeout for refresh
        }, 2000)
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
    }).finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <>
        { isLoading && ((
          <div className="fixed top-0 left-0 w-full h-full bg-gray-300 opacity-50 z-50 flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                <rect width={10} height={10} x={1} y={1} fill="#FF441F" rx={1}>
                    <animate id="svgSpinnersBlocksShuffle30" fill="freeze" attributeName="x" begin="0;svgSpinnersBlocksShuffle3b.end" dur="0.2s" values="1;13"></animate>
                    <animate id="svgSpinnersBlocksShuffle31" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle38.end" dur="0.2s" values="1;13"></animate>
                    <animate id="svgSpinnersBlocksShuffle32" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle39.end" dur="0.2s" values="13;1"></animate>
                    <animate id="svgSpinnersBlocksShuffle33" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle3a.end" dur="0.2s" values="13;1"></animate>
                </rect>
                <rect width={10} height={10} x={1} y={13} fill="#0D8CFF" rx={1}>
                    <animate id="svgSpinnersBlocksShuffle34" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle30.end" dur="0.2s" values="13;1"></animate>
                    <animate id="svgSpinnersBlocksShuffle35" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle31.end" dur="0.2s" values="1;13"></animate>
                    <animate id="svgSpinnersBlocksShuffle36" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle32.end" dur="0.2s" values="1;13"></animate>
                    <animate id="svgSpinnersBlocksShuffle37" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle33.end" dur="0.2s" values="13;1"></animate>
                </rect><rect width={10} height={10} x={13} y={13} fill="#10A555" rx={1}>
                    <animate id="svgSpinnersBlocksShuffle38" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle34.end" dur="0.2s" values="13;1"></animate>
                    <animate id="svgSpinnersBlocksShuffle39" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle35.end" dur="0.2s" values="13;1"></animate>
                    <animate id="svgSpinnersBlocksShuffle3a" fill="freeze" attributeName="x" begin="svgSpinnersBlocksShuffle36.end" dur="0.2s" values="1;13"></animate>
                    <animate id="svgSpinnersBlocksShuffle3b" fill="freeze" attributeName="y" begin="svgSpinnersBlocksShuffle37.end" dur="0.2s" values="1;13"></animate>
                </rect>
            </svg>
          </div>
        )) }

        <div className="h-screen bg-gradient-to-r from-emerald-300 to-lime-300 flex items-center justify-center text-gray-600">
          <div className='font-montserrat lg:hidden fixed top-0 right-0 left-0 inset-x-0'>
            <div className='px-6 mt-10'>
              <FaArrowAltCircleLeft onClick={ () => goBack() } className='text-4xl'/>
            </div>
          </div>
          
          <div className="px-8 py-6 mt-32 text-left -translate-y-32">
              <h3 className='flex mb-5 text-4xl font-bold font-montserrat'><img src={ epa_logo } className='w-10 h-10 mr-3' alt="EPA" />EPA<span className='text-orange-600'>.</span><span className='text-2xl font-semibold py-2'></span></h3>   
              <div className='px-8 py-6 mt-4 shadow-lg bg-emerald-100'>
                <form onSubmit={ loginUser } className='p-2'>
                <h2 className="text-2xl font-semibold text-center">Login</h2>
                  
                  <br />

                  { user && !loginOther  ? 
                    <div>
                      <div className='flex justify-center items-center'>
                      { user.avatar ? 
                        <img className="w-16 h-16 rounded-full shadow-md"
                            src={ window.location.origin + '/private/avatar/' + user.avatar }
                            alt="Rounded avatar"
                        />
                        :
                        <img className="w-16 h-16 rounded-full shadow-md"
                            src="https://static-00.iconduck.com/assets.00/avatar-default-symbolic-icon-2048x1949-pq9uiebg.png"
                            alt="Rounded avatar"
                        />
                      }
                      </div>
                      <div className='pt-2 -mb-4 text-center font-semibold'>{ user.name }</div>
                    </div>
                    :
                    <input 
                      className='border-2 p-2 mt-2 bg-blue-100 w-full'
                      id="email"
                      name="email"
                      placeholder="Email" 
                      onChange={(e) => setEmail(e.target.value)}
                      value={ email }
                  />
                  }

                  <br />
                  
                  <Input 
                    className='border-2 p-2 mt-2 bg-blue-100 w-full'
                    type={ showPassword ? 'string' : 'password' }
                    placeholder="Password" 
                    onChange={(e) => setPassword(e.target.value)}
                    value={ password }
                    endAdornment={ 
                      <InputAdornment position="end">
                        <IconButton onClick={ () => setShowPassword(!showPassword) }>
                          { showPassword ? < FaRegEye color='gray' /> : < FaRegEyeSlash color='gray' /> }
                        </IconButton>
                      </InputAdornment>
                    }
                  />

                  <br />

                  <div className='mt-2 text-center'>
                    <button className='bg-orange-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md mt-2'>Submit</button>
                    {/* <NavLink to='/register' className='pl-4 underline'>Register here</NavLink> */}
                  </div>

                  <br />

                  <div className='mt-2 text-center text-xs text-blue-500 italic font-semibold'>
                    <NavLink to='/forgotpassword' className='pl-4 underline'>Forgot Password ?</NavLink>
                  </div>

                  { user && !loginOther ? 
                    <div className='mt-4 text-center text-xs text-red-500 font-semibold'>
                      <p onClick={ () => { setLoginOther(true), setEmail('') } } className='pl-4 underline'>Login with Other Account</p>
                    </div>
                    :
                    ''
                  }

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

export default Login
