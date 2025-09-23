import axios from 'axios'
import epa_logo from '../assets/logo.png'
import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
// import { Switch, FormGroup, FormControlLabel } from '@mui/material'
import { Input, InputAdornment, IconButton } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Register = () => {
  const navigate = useNavigate()
  const [ allUsers, setAllUsers ] = useState([])
  const [ name, setName ] = useState('')
  const [ email, setEmail ] = useState('')
  const [ mobilenum, setMobileNum ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ confirmpw, setConfirmPw ] = useState('')
  const [ refCode, setRefCode ] = useState('')
  const [ showPassword, setShowPassword ] = useState(false)
  const [ checked, setChecked ] = useState(true)
  const [ isLoading, setIsLoading ] = useState(false)

  useEffect(() => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    axios.get(`/api/user`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Key': process.env.API_KEY
        },
        data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        setAllUsers(res.data.users)
    }).catch((err) => {
        if (axios.isCancel(err)) console.log('Successfully Aborted')
        else console.error(err)
    })
    return () => { source.cancel() }
  }, [])

  const registerUser = async (e) => {
    e.preventDefault()
    e.currentTarget.disabled = true

    setIsLoading(true)

    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    const mainRefUsers = allUsers.length ? allUsers.filter(item => item.role === 'admin').map((item) => item.refnum) : '' // random array for refnum if blank
    const fullname = name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').trim() // format name input

    const formData = new FormData()
    formData.append('name', fullname)
    formData.append('email', email.toLowerCase())
    formData.append('mobilenum', mobilenum)
    formData.append('password', password)
    formData.append('confirmpw', confirmpw)
    // add balance length later
    formData.append('refCode', !refCode || !checked ? mainRefUsers[ Math.floor(Math.random() * mainRefUsers.length) ] : refCode)

    await axios.post(`/api/user/register`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Api-Key': process.env.API_KEY
        },
        data: { cancelToken: source.token }
    }).then(res => {
      console.log('Success OK: ', res.status)
      toast.success(res.data.message)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      return res
    }).catch((err) => {
      if (axios.isCancel(err)) {
        console.log('Successfully Aborted')
        toast.error(err.response.data.error)
      } else if (err.response.status === 422) { // response >> validation errors
          console.log('Validation Error: ', err.response.status)
          toast.error(err.response.data.error)
          const inputData = err.response.data.error.split(' ')[0].toLowerCase()
          if (inputData === 'name') setName('')
          if (inputData === 'email') setEmail('')
          if (inputData === 'mobile') setMobileNum('')
          if (inputData === 'password') setPassword(''); setConfirmPw('')
          if (inputData === 'reference') setRefCode('')
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

  const goBack = () => {
    navigate(-1)
  }

  // const toggleSwitch = (e) => {
  //   setChecked(e.target.checked)
  // }

  const sponsor = allUsers.find(item => {
    return item.class !=='Member' && item.refnum === refCode
  })

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
        <div className="px-8 py-6 mt-32 text-left -translate-y-32">
          <div className='flex items-center gap-2'>
              <FaArrowAltCircleLeft onClick={ () => goBack() } className='text-4xl'/>
          </div>
          
          <h3 className='flex mb-5 text-4xl font-bold font-montserrat'><img src={ epa_logo } className='w-10 h-10 mr-3' alt="EPA" />EPA<span className='text-orange-600'>.</span><span className='text-2xl font-semibold py-2'></span></h3>   
          <div className='px-8 py-6 mt-4 shadow-lg bg-emerald-100'>

            <form onSubmit={ (e) => registerUser(e) } className='p-2'>
            <h2 className="text-2xl font-semibold text-center">Register</h2>
              <br />
              <input 
                className='border-2 p-2 mt-2 bg-blue-100 w-full'
                type="text" 
                placeholder="Name" 
                onChange={(e) => setName(e.target.value)}
                value={ name }
              />
              <br />
              <input 
                className='border-2 p-2 mt-2 bg-blue-100 w-full'
                id="email"
                name="email"
                placeholder="Email" 
                onChange={(e) => setEmail(e.target.value)}
                value={ email }
              />
              <br />
              <div className='flex flex-cols gap-2'>
              <p className='p-2 mt-3'>+63</p>
                <input 
                  className='border-2 p-2 mt-2 bg-blue-100 w-full'
                  type="tel"
                  maxLength="10" 
                  placeholder="Mobile Number" 
                  onChange={(e) => setMobileNum(e.target.value)}
                  value={ mobilenum }
                />
              </div>
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
              <Input 
                className='border-2 p-2 mt-2 bg-blue-100 w-full'
                type={ showPassword ? 'string' : 'password' }
                placeholder="Confirm Password" 
                onChange={(e) => setConfirmPw(e.target.value)}
                value={ confirmpw }
                endAdornment={ 
                    <InputAdornment position="end">
                        <IconButton onClick={ () => setShowPassword(!showPassword) }>
                            { showPassword ? < FaRegEye color='gray' /> : < FaRegEyeSlash color='gray' /> }
                        </IconButton>
                    </InputAdornment>
                }
            />
              <br />
              {/* <FormGroup>
                <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                  <p>Guarantor Code</p>
                  <FormControlLabel control={ <Switch checked={ checked } onChange={ toggleSwitch } inputProps={{ 'aria-label': 'controlled' }} /> } />
                </div>
              </FormGroup> */}
              { checked ? 
                <input 
                  className='border-2 p-2 mt-2 bg-blue-100 w-full'
                  type="text" 
                  placeholder="Enter Guarantor Code" 
                  onChange={(e) => setRefCode(e.target.value)}
                  value={ refCode }
                />
                  :
                ''
              }
              { refCode && (
                <div className='ml-2 flex gap-2 mt-2 text-sm items-center font-semibold'>                  
                  <p className={ sponsor ? '' : 'hidden' }>Sponsor Name:</p>
                  <p className={ sponsor ? 'text-orange-400' : 'text-red-500' }>{ sponsor ? sponsor.name : 'No Sponsor Found !' }</p>
                </div>
              ) } 

              <div className='mt-2'>
                <button className='bg-blue-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2'>Submit</button>
                <NavLink to='/login' className='pl-4 underline'>Back to login</NavLink>
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

export default Register
