import Cookies from 'universal-cookie'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import { MdOutlineSupervisorAccount } from 'react-icons/md'
import { CiCirclePlus } from 'react-icons/ci'
import { FormControl, Select, MenuItem, Input, InputAdornment, IconButton } from '@mui/material'
import { NavLink } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const CreateAccount = () => {
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ iteration, setIteration ] = useState(1)
    const [ subAccount, setSubAccount ] = useState(false)
    const [ name, setName ] = useState('')
    const [ email, setEmail ] = useState('')
    const [ mobilenum, setMobileNum ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ confirmpw, setConfirmPw ] = useState('')
    const [ showPassword, setShowPassword ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (user && user.id) {
            axios.get(`/api/user/${ user.id }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setCurrentUser(res.data.user)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
    
            return () => { source.cancel() }
        }
    }, [ user ])

    const newAccount = async (e) => {
        e.preventDefault()
        e.currentTarget.disabled = true

        setIsLoading(true)
    
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
    
        const fullname = name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').trim() // format name input

        const formData = new FormData()
        formData.append('iteration', iteration)
        formData.append('subaccount', subAccount)
        formData.append('name', fullname)
        formData.append('email', email.toLowerCase())
        formData.append('mobilenum', !subAccount ? mobilenum : currentUser.mobilenum)
        formData.append('password', password)
        formData.append('confirmpw', confirmpw)
        formData.append('refCode', currentUser.refnum)
    
        await axios.post(`/api/user/create-account/${ user.id }`, formData, {
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
              const inputData = err.response.data.error.split(' ')[0].toLowerCase()
              if (inputData === 'name') setName('')
              if (inputData === 'email') setEmail('')
              if (inputData === 'mobile') setMobileNum('')
              if (inputData === 'password') setPassword(''); setConfirmPw('')
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

            <div className='font-montserrat lg:hidden'>
                <div className='px-6 mt-10'>
                        <div className='flex items-center gap-2'> 
                            <div className='grid grid-cols-2 font-bold font-montserrat'>
                                <NavLink to="/profile">
                                    <FaArrowAltCircleLeft className='text-4xl' />
                                </NavLink>
                            </div>   
                        </div>
                    </div>
                    <div className='flex justify-center gap-2 text-3xl -mt-7'>
                        <MdOutlineSupervisorAccount className='fill-orange-500' />
                        <h1 className='text-lg text-center font-semibold mb-10 pl-1'>Create Account</h1>
                    </div>

            <hr />

            <form onSubmit={ (e) => newAccount(e) } className='px-16 py-4'>
              <br />
              
              <div className='flex items-center'>
                <div className='px-2 text-gray-400'>Number of Accounts</div>
                <div className='flex items-center ml-4'>
                    <div className='-px-6 mb-1'>
                        <FormControl sx={{ m: 0, minWidth: 80 }} size="small">
                            <Select
                                labelId="create-account-label"
                                id='create-account-duration'
                                value={ iteration }
                                label="Number of Accounts"
                                onChange={ (e) => setIteration(e.target.value) }
                            >
                                <MenuItem value={ 1 }>1</MenuItem>
                                <MenuItem value={ 4 }>4</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>
            </div>

            <div className='flex items-center'>
              <div className='px-2 text-gray-400'>Sub Account</div>
              <div className='flex items-center ml-4'>
                  <div className='-px-6 mb-1'>
                      <FormControl sx={{ m: 0, minWidth: 80 }} size="small">
                          <Select
                              labelId="sub-account-label"
                              id='sub-account-duration'
                              value={ subAccount }
                              label="Sub Account"
                              onChange={ (e) => setSubAccount(e.target.value) }
                          >
                              <MenuItem value={ false }>No</MenuItem>
                              <MenuItem value={ true }>Yes</MenuItem>
                          </Select>
                      </FormControl>
                  </div>
              </div>
            </div>

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
              { subAccount ?
                <div className='flex flex-cols'>
                  <p className='p-2 mt-3'>+63</p>
                  <div className='p-2 mt-3 bg-white-100'>{ currentUser.mobilenum }</div>
                </div>
                  :
                  <div className='flex flex-cols gap-2'>
                    <p className='p-2 mt-3'>+63</p>
                    <input 
                      className='border-2 p-2 mt-3 bg-blue-100 w-full'
                      type="tel"
                      maxLength="10" 
                      placeholder="Mobile Number" 
                      onChange={(e) => setMobileNum(e.target.value)}
                      value={ mobilenum }
                    />
                  </div>
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
              <div className='mt-2'>
                <button className='bg-blue-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2'>Submit</button>
              </div>
            </form>

            <div className='mb-20'/>
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            </div>
        </>
    )
}

export default CreateAccount
