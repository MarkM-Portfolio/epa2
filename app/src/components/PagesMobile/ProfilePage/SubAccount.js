import Cookies from 'universal-cookie'
import axios from 'axios'
import ModalSubAccount from '../../ModalSubAccount'
import ModalTransferAccount from '../../ModalTransferAccount'
import { useEffect, useState } from 'react'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import { MdOutlineSupervisorAccount } from 'react-icons/md'
import { TbTransferOut } from 'react-icons/tb'
// import { CiCirclePlus } from 'react-icons/ci'
import { NavLink } from 'react-router-dom'
import { Input, InputAdornment, IconButton } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const cookies = new Cookies()

const switchAccount = async (e, acctData) => {
    e.preventDefault()
    e.currentTarget.disabled = true

    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    const formData = new FormData()
    formData.append('email', acctData.email)

    await axios.post('/api/user/switch', formData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': process.env.API_KEY
      },
      data: { cancelToken: source.token }
    }).then(res => {
        console.log('Success OK: ', res.status)
        cookies.remove('token')
        cookies.remove('user')
        cookies.set('token', res.data.token)
        cookies.set('user', JSON.stringify(res.data.user))
        toast.info(res.data.message)
        setTimeout(() => {
          window.location.href= '/profile' // add timeout for refresh
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
    })
  }


const SubAccount = () => {

    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ allUsers, setAllUsers ] = useState([])
    const [ stores, setStores ] = useState('')
    const [ name, setName ] = useState('')
    const [ email, setEmail ] = useState('')
    const [ mobilenum, setMobileNum ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ confirmpw, setConfirmPw ] = useState('')
    const [ showPassword, setShowPassword ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ show, setShow ] = useState(false)
    const [ showTransfer, setShowTransfer ] = useState(false)
    const [ transferUserId, setTransferUserId ] = useState(false)

    const showModal = () => setShow(true)
    const closeModal = () => setShow(false)

    const showModalTransfer = () => setShowTransfer(true)
    const closeModalTransfer = () => setShowTransfer(false)

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

    useEffect(() => {
        setIsLoading(true)

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
        }).finally(() => {
            setIsLoading(false)
        })

        return () => { source.cancel() }
    }, [])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        axios.get(`/api/store`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            setStores(res.data.stores)
        }).catch((err) => {
            if (axios.isCancel(err)) console.log('Successfully Aborted')
            else console.error(err)
        })
        return () => { source.cancel() }
    }, [])

    const subAccounts = []

    if (currentUser && currentUser._id && currentUser.subAccounts.length && allUsers) {
        const filterSubAccounts = allUsers.filter(item => item.isSubAccount === true)
        
        filterSubAccounts.map(item => {
            if (currentUser.subAccounts.includes(item._id))
                subAccounts.push(item)
        })
    }

    const mainAccount = {}, subAccount = {}

    if (currentUser && currentUser._id && currentUser.isSubAccount && allUsers) {
        const filterMainAccount = allUsers.find(item => item._id === currentUser.owner)
        Object.assign(mainAccount, filterMainAccount)
        Object.assign(subAccount, currentUser)
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
                        <h1 className='text-lg text-center font-semibold mb-10 pl-1'>Sub Accont</h1>
                    </div>

                    <div className='-mt-7 flex flex-cols justify-center font-semibold text-xs gap-2 rounded-1xl text-center'>
                        <p className='font-semibold'>Total Sub Accounts: { currentUser.subAccounts && currentUser.subAccounts.length || 0 }</p>
                    </div>

                <div className='mt-2 px-6'>
                    { currentUser && currentUser._id && currentUser.subAccounts.length && subAccounts ? 
                        <div className='mt-4'>
                            {/* <div className='flex justify-center mt-4'>
                                <button className='h-8 w-8 bg-emerald-500 focus:outline-none focus:ring focus:ring-blue-400 text-white rounded-full' onClick={ () => showModal() }><CiCirclePlus className='h-8 w-8'/></button>
                            </div> */}
                            <br />
                            <hr />
                            <div className='mt-6'>
                                { stores && subAccounts.map(item => (
                                    <div className="mt-4" key={ item._id }>
                                        { stores.map(storeItem => (
                                            <div className="flex flex-cols font-semibold" key={ storeItem._id }>
                                                <NavLink to={ "/store" } state={ storeItem }>
                                                    { storeItem.owner === item._id ? 
                                                        <div className='flex gap-2 mb-2'>
                                                            <div className="flex flex-cols gap-2">
                                                                <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                                <div>{ storeItem.name }</div>
                                                            </div> 
                                                        </div>
                                                        : 
                                                        ''
                                                    }
                                                </NavLink>
                                            </div>
                                        )) }
                                        <div className="border h-28 w-full rounded-xl" onClick={ e => switchAccount(e, item) }>
                                            <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                                                { item.avatar ? 
                                                    <img className="object-contain h-28 w-2/5 rounded-l-lg" src={ window.location.origin + '/private/avatar/' + item.avatar } />
                                                    : 
                                                    <img className="object-contain h-28 w-2/5 rounded-l-lg"
                                                        src="https://static-00.iconduck.com/assets.00/avatar-default-symbolic-icon-2048x1949-pq9uiebg.png"
                                                        alt="Rounded avatar"
                                                    />
                                                }
                                                <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                                                    <h1 className='font-semibold'>{ item.name }</h1>
                                                    <h1 className='mt-1'>{ item.email.length > 20 ? item.email.substring(0, 20) + '...' : item.email }</h1>
                                                    <h1 className='mt-1'>{ item.mobilenum }</h1>
                                                    <h1 className={ `${ item.class === 'Entrepreneur' ? 'text-yellow-200 bg-lime-500 w-36' : item.class === 'Supervisor' ? 'text-yellow-200 bg-cyan-500 w-36' : item.class === 'Manager' ? 'text-yellow-200 bg-amber-500 w-32' : item.class === 'CEO' ? 'text-yellow-200 bg-purple-400 w-20' : item.class === 'Business Empire' ? 'text-yellow-200 bg-red-500 w-40' : 'text-yellow-200 bg-gray-500 w-20' } font-semibold text-center text-md rounded-lg` }>{ item.class }</h1>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex justify-end rounded-lg pt-3' onClick={ () => { setTransferUserId(item._id), showModalTransfer() } }>
                                            <div className='flex items-center gap-1'>
                                                <TbTransferOut size={ 20 } color='#06b6D4' />
                                                <p className='text-sm pt-1'>Transfer Account</p>
                                            </div>
                                        </div>
                                    </div>
                                )) }
                            </div>
                        </div>
                        :
                        <div>
                            { !show && !currentUser.isSubAccount ? 
                                <div className='mt-6'>
                                    <div className='flex justify-center'>
                                        <MdOutlineSupervisorAccount className='text-4xl fill-emerald-500' />
                                    </div>
                                    <h1 className='text-xl font-semibold text-center text-emerald-500 mt-4'>
                                        No Sub Accounts Found !
                                    </h1>
                                    <h2 className='text-gray-400 text-center mt-2'>
                                        Create new sub account.
                                    </h2>
                                    {/* <div className='flex justify-center mt-4'>
                                        <button className='h-8 w-8 bg-emerald-500 focus:outline-none focus:ring focus:ring-blue-400 text-white rounded-full' onClick={ () => showModal() }><CiCirclePlus className='h-8 w-8'/></button>
                                    </div> */}
                                </div>
                                : 
                                '' 
                            }
                        </div>
                    }

                    { currentUser && currentUser._id && currentUser.isSubAccount && mainAccount && subAccount ? 
                        <div className='mt-6'>
                            <div className='flex justify-center'>
                                <MdOutlineSupervisorAccount className='text-4xl' />
                            </div>

                            <h1 className='text-lg font-semibold text-center mt-4'>
                                My Sub Account
                            </h1>
                            { stores ?
                                <div className="mt-6">
                                    { stores.map(storeItem => (
                                        <div className="flex flex-cols font-semibold" key={ storeItem._id }>
                                            <NavLink to={ "/store" } state={ storeItem }>
                                                { storeItem.owner === subAccount._id ? 
                                                    <div className='flex gap-2 mb-2'>
                                                        <div className="flex flex-cols gap-2">
                                                            <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                            <div>{ storeItem.name }</div>
                                                        </div>
                                                    </div>
                                                    : ''
                                                }
                                            </NavLink>
                                        </div>
                                    )) }
                                </div>
                                :
                                ''
                            }
                            <div className="mt-2">
                                <div className="border h-28 w-full rounded-xl">
                                    <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                                        { subAccount.avatar ? 
                                            <img className="object-contain h-28 w-2/5 rounded-l-lg" src={ window.location.origin + '/private/avatar/' + subAccount.avatar } />
                                            : 
                                            <img className="object-contain h-28 w-2/5 rounded-l-lg"
                                                src="https://static-00.iconduck.com/assets.00/avatar-default-symbolic-icon-2048x1949-pq9uiebg.png"
                                                alt="Rounded avatar"
                                            />
                                        }
                                        <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                                            <h1 className='font-semibold'>{ subAccount.name }</h1>
                                            <h1 className='mt-1'>{ subAccount.email.length > 20 ? subAccount.email.substring(0, 20) + '...' : subAccount.email }</h1>
                                            <h1 className='mt-1'>{ subAccount.mobilenum }</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <br />
                            <br />    
                            <hr />
                            <h1 className='text-lg font-semibold text-center mt-4'>
                                Switch to Main Account
                            </h1>
                            { stores ?
                                <div className="mt-6">
                                    { stores.map(storeItem => (
                                        <div className="flex flex-cols font-semibold" key={ storeItem._id }>
                                            <NavLink to={ "/store" } state={ storeItem }>
                                                { storeItem.owner === mainAccount._id ? 
                                                    storeItem.owner === process.env.EPA_ACCT_ID ? 
                                                        <div className="flex flex-cols gap-2">
                                                            <img className='w-6 h-6' alt="EPA" src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                            <div className="text-lime-500 text-center text-xl font-bold">EPA.<span className='text-lg text-orange-500'>Mall</span></div>
                                                        </div>
                                                        : 
                                                        <div className="flex flex-cols gap-2">
                                                            <img className='w-6 h-6' src={ window.location.origin + '/public/stores/' + storeItem.image } />
                                                            <div>{ storeItem.name }</div>
                                                        </div>
                                                    : ''
                                                }
                                            </NavLink>
                                        </div>
                                    )) }
                                </div>
                                :
                                ''
                            }
                            <div className="mt-4">
                                <div className="border h-28 w-full rounded-xl" onClick={ e => switchAccount(e, mainAccount) }>
                                    <div className='flex flex-cols gap-2 rounded-lg shadow-2xl'>
                                        { mainAccount.avatar ? 
                                            <img className="object-contain h-28 w-2/5 rounded-l-lg" src={ window.location.origin + '/private/avatar/' + mainAccount.avatar } />
                                            : 
                                            <img className="object-contain h-28 w-2/5 rounded-l-lg"
                                                src="https://static-00.iconduck.com/assets.00/avatar-default-symbolic-icon-2048x1949-pq9uiebg.png"
                                                alt="Rounded avatar"
                                            />
                                        }
                                        <div className='flex flex-col pl-1 text-bold text-md justify-center'>
                                            <h1 className='font-semibold'>{ mainAccount.name }</h1>
                                            <h1 className='mt-1'>{ mainAccount.email }</h1>
                                            <h1 className='mt-1'>{ mainAccount.mobilenum }</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        :
                        <div>
                            { !show && currentUser.isSubAccount ? 
                                <div className='mt-6'>
                                    <div className='flex justify-center'>
                                        <MdOutlineSupervisorAccount className='text-4xl' />
                                    </div>
                                    <h1 className='text-xl font-semibold text-center mt-4'>
                                        No Sub Accounts Found !
                                    </h1>
                                    {/* <h2 className='text-gray-400 text-center mt-2'>
                                        Create new sub account.
                                    </h2>
                                    <div className='flex justify-center mt-4'>
                                        <button className='h-8 w-8 bg-emerald-500 focus:outline-none focus:ring focus:ring-blue-400 text-white rounded-full' onClick={ () => showModal() }><CiCirclePlus className='h-8 w-8'/></button>
                                    </div> */}
                                </div>
                                : 
                                '' 
                            }
                        </div>
                    }

                    <ModalSubAccount name={ name } email={ email } mobilenum={ currentUser.mobilenum } password={ password } confirmpw={ confirmpw } show={ show } onClose={ closeModal }>
                        <h2 className="text-lg font-bold">Create Sub Account</h2>
                        <div className='items-center'>
                            <br />
                            <input 
                                className='border-2 p-2 bg-white-100 w-full'
                                type="text" 
                                placeholder="Name" 
                                onChange={ (e) => setName(e.target.value)}
                            />
                            <input 
                                className='border-2 p-2 mt-2 bg-white-100 w-full'
                                id="email"
                                name="email"
                                placeholder="Email" 
                                rows={4}
                                onChange={ (e) => setEmail(e.target.value)}
                            />
                            <div className='border-2 p-2 mt-2 bg-white-100'>{ currentUser.mobilenum }</div>
                            {/* <input 
                                className='border-2 p-2 mt-2 bg-white-100'
                                type="tel"
                                maxLength="10" 
                                placeholder="Mobile Number" 
                                onChange={ (e) => setMobileNum(e.target.value)}
                            /> */}
                            <Input 
                                className='border-2 p-2 mt-2 bg-white w-full'
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
                            <Input 
                                className='border-2 p-2 mt-2 bg-white w-full'
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
                        </div>
                    </ModalSubAccount>

                    <ModalTransferAccount transferUserId={ transferUserId } name={ name } email={ email } mobilenum={ mobilenum } password={ password } confirmpw={ confirmpw } show={ showTransfer } onClose={ closeModalTransfer }>
                        <h2 className="text-lg font-bold">Transfer Account</h2>
                        <div className='items-center'>
                            <br />
                            <input 
                                className='border-2 p-2 bg-white-100 w-full'
                                type="text" 
                                placeholder="Name" 
                                onChange={ (e) => setName(e.target.value)}
                            />
                            <input 
                                className='border-2 p-2 mt-2 bg-white-100 w-full'
                                id="email2"
                                name="email"
                                placeholder="Email" 
                                rows={4}
                                onChange={ (e) => setEmail(e.target.value)}
                            />
                            <div className='flex flex-cols gap-2'>
                                <p className='p-2 mt-3'>+63</p>
                                <input 
                                    className='border-2 p-2 mt-3 bg-white-100 w-full'
                                    type="tel"
                                    maxLength="10" 
                                    placeholder="Mobile Number" 
                                    onChange={ (e) => setMobileNum(e.target.value)}
                                />
                            </div>
                            <Input 
                                className='border-2 p-2 mt-2 bg-white w-full'
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
                            <Input 
                                className='border-2 p-2 mt-2 bg-white w-full'
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
                        </div>
                    </ModalTransferAccount>

                    <div className='mb-10'/>
                    
                    <ToastContainer
                        position="top-center"
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
            </div>
        </>
    )
}

export default SubAccount
