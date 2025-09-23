import Cookies from 'universal-cookie'
import axios from 'axios'
import ValidationBeforeRegister from '../../ValidationBeforeRegister'
import { useEffect, useState } from 'react'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { MdOutlineRememberMe } from 'react-icons/md'
import { NavLink, useNavigate } from 'react-router-dom'
import { TbCurrencyPeso } from 'react-icons/tb'
import { Radio, RadioGroup, FormControlLabel } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Package = () => {
    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ pkg, setPackage ] = useState('')
    const [ goldActive, setGoldActive ] = useState('')

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
                if (res.data.user.class === 'Member')
                    setPackage('entrepreneur')
                else if (res.data.user.class === 'Entrepreneur')
                    setPackage('supervisor')
                    else if (res.data.user.class === 'Supervisor')
                    setPackage('manager')
                else if (res.data.user.class === 'Manager')
                    setPackage('ceo')
                else if (res.data.user.class === 'CEO')
                    setPackage('businessempire')
                else if (res.data.user.class === 'Business Empire')
                    setPackage('silver')
                else if (res.data.user.class === 'Silver' && res.data.user.rank === 'Business Empire')
                    setPackage('gold')
                else
                    setPackage('')
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user ])

    const upgrade = async (e) => {    
        e.preventDefault()
        e.currentTarget.disabled = true

        let pkgPrice = 0

        if (pkg === 'entrepreneur')
            pkgPrice = 1000
        if (pkg === 'supervisor') {
            if (currentUser.class === 'Member') pkgPrice = 3000
            else pkgPrice = 2000 // Entrepreneur
        }
        if (pkg === 'manager') {
            if (currentUser.class === 'Member') pkgPrice = 5000
            else if (currentUser.class === 'Entrepreneur') pkgPrice = 4000
            else pkgPrice = 3000 // Supervisor
        } 
        if (pkg === 'ceo') {
            if (currentUser.class === 'Member') pkgPrice = 8000
            else if (currentUser.class === 'Entrepreneur') pkgPrice = 7000
            else if (currentUser.class === 'Supervisor') pkgPrice = 5000
            else pkgPrice = 3000 // Manager
        }
        if (pkg === 'businessempire') {
            if (currentUser.class === 'Member') pkgPrice = 10000
            else if (currentUser.class === 'Entrepreneur') pkgPrice = 9000
            else if (currentUser.class === 'Supervisor') pkgPrice = 7000
            else if (currentUser.class === 'Manager') pkgPrice = 5000
            else pkgPrice = 2000 // CEO
        }

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('package', pkg)
        formData.append('price', pkgPrice)

        await axios.put(`/api/user/purchasepackage/${ user.id }`, formData, {
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
                window.location.href= '/profile' // redirect to profile page
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

    const activateGold = async (e) => {    
        e.preventDefault()
        e.currentTarget.disabled = true

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/user/activate-gold/${ user.id }`, { pkg: pkg }, {
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
                navigate('/profile')
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
                        <MdOutlineRememberMe className='fill-orange-500' />
                        <h1 className='text-lg text-center font-semibold mb-10 pl-1'>Subscription Package</h1>
                    </div>

                <div className='mt-2 px-6'>
                    <div className='mt-4'>
                        <div className='flex justify-center mt-4'>
                            <div className='flex flex-cols'>
                                <div className='text-gray-500 font-semibold pr-2'>Current: </div>
                                <div className={ `${ currentUser.class === 'Entrepreneur' ? 'text-yellow-200 bg-lime-500 w-36' : currentUser.class === 'Supervisor' ? 'text-yellow-200 bg-cyan-500 w-36' : currentUser.class === 'Manager' ? 'text-yellow-200 bg-amber-500 w-32' : currentUser.class === 'CEO' ? 'text-yellow-200 bg-purple-400 w-20' : currentUser.class === 'Business Empire' ? 'text-yellow-200 bg-red-500 w-40' : currentUser.class === 'Silver' ? 'text-yellow-200 bg-gradient-to-r from-stone-600 to-stone-300 border-2 border-gray-600 w-32' : currentUser.class === 'Gold' ? 'text-yellow-200 bg-gradient-to-r from-amber-600 to-amber-300 border-2 border-gray-600 w-32' : 'text-yellow-200 bg-gray-500 w-20' } font-semibold text-center text-md rounded-lg shadow-md` }>{ currentUser.class }</div>
                            </div>
                        </div>
                        <br />
                        <hr />

                        { user.religion || currentUser.religion ? 
                            <div className='mt-6'>
                                <RadioGroup name="use-radio-group" value={ currentUser.class ? pkg : '' }>
                                    <div className='flex flex-cols mt-2 items-center'>
                                        {/* <FormControlLabel disabled={ currentUser.class === 'Member' ? false : true } control={<Radio value="entrepreneur" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} /> */}
                                        <FormControlLabel control={<Radio value="entrepreneur" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} />
                                        <div className='text-yellow-200 bg-lime-500 w-36 font-semibold text-center text-lg rounded-lg shadow-md'>Entrepreneur</div>
                                        { pkg === 'entrepreneur' &&
                                            currentUser.class === 'Member' && (
                                                <div className='grid grid-cols-2 items-center justify-between px-35'>
                                                    <div className='flex items-center font-semibold'>
                                                        <TbCurrencyPeso color='red'/>
                                                        <p>1,000</p>
                                                    </div>
                                                    <button onClick={ (e) => upgrade(e) } className='font-semibold text-orange-500 underline'>Purchase</button>
                                                </div>
                                            )
                                        }
                                    </div>
                                    { currentUser.class !== 'Member' && (
                                        <div className='pl-12 text-sm text-lime-500'>Package Received: { currentUser.entrepreneur }</div>
                                    )}
                                    <div className='flex flex-cols mt-2 items-center'>
                                        {/* <FormControlLabel disabled={ currentUser.class === 'Member' || currentUser.class === 'Entrepreneur' ? false : true } control={<Radio value="supervisor" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} /> */}
                                        <FormControlLabel control={<Radio value="supervisor" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} />
                                        <div className='text-yellow-200 bg-cyan-500 w-36 font-semibold text-center text-lg rounded-lg shadow-md'>Supervisor</div>
                                        {/* { pkg === 'supervisor' &&
                                            <div className='grid grid-cols-2 items-center justify-between px-35'>
                                                <div className='flex items-center font-semibold'>
                                                    <TbCurrencyPeso color='red'/>
                                                    { currentUser.class === 'Member' ?
                                                        <p>3,000</p>
                                                        :
                                                        <p>2,000</p>
                                                    }
                                                </div>
                                                <button onClick={ (e) => upgrade(e) } className='font-semibold text-orange-500 underline'>{ currentUser.class === 'Member' ? 'Purchase' : 'Upgrade' }</button>
                                            </div>
                                        } */}
                                    </div>
                                    { currentUser.class !== 'Member' && (
                                        <div className='pl-12 text-sm text-cyan-500'>Package Received: { currentUser.supervisor }</div>
                                    )}
                                    <div className='flex flex-cols mt-2 items-center'>
                                        {/* <FormControlLabel disabled={ currentUser.class === 'Member' || currentUser.class === 'Entrepreneur' || currentUser.class === 'Supervisor' ? false : true } control={<Radio value="manager" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} /> */}
                                        <FormControlLabel control={<Radio value="manager" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} />
                                        <div className='text-yellow-200 bg-amber-500 w-32 font-semibold text-center text-lg rounded-lg shadow-md'>Manager</div>
                                        {/* { pkg === 'manager' &&
                                            <div className='grid grid-cols-2 items-center justify-between px-35'>
                                                <div className='flex items-center font-semibold'>
                                                    <TbCurrencyPeso color='red'/>
                                                    { currentUser.class === 'Member' ?
                                                        <p>5,000</p>
                                                        : currentUser.class === 'Entrepreneur' ?
                                                        <p>4,000</p>
                                                        : currentUser.class === 'Supervisor' ?
                                                        <p>3,000</p>
                                                        :
                                                        ''
                                                    }
                                                </div>
                                                <button onClick={ (e) => upgrade(e) } className='font-semibold text-orange-500 underline'>{ currentUser.class === 'Member' ? 'Purchase' : 'Upgrade' }</button>
                                            </div>
                                        } */}
                                    </div>
                                    { currentUser.class !== 'Member' && (
                                        <div className='pl-12 text-sm text-amber-500'>Package Received: { currentUser.manager }</div>
                                    )}
                                    <div className='flex flex-cols mt-2 items-center'>
                                        {/* <FormControlLabel disabled={ currentUser.class === 'Member' || currentUser.class === 'Entrepreneur' || currentUser.class === 'Supervisor' || currentUser.class === 'Manager' ? false : true } control={<Radio value="ceo" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} /> */}
                                        <FormControlLabel control={<Radio value="ceo" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} />
                                        <div className='text-yellow-200 bg-purple-400 w-20 font-semibold text-center text-lg rounded-lg shadow-md'>CEO</div>
                                        {/* { pkg === 'ceo' &&
                                            <div className='grid grid-cols-2 items-center justify-between px-35'>
                                                <div className='flex items-center font-semibold'>
                                                    <TbCurrencyPeso color='red'/>
                                                    { currentUser.class === 'Member' ?
                                                        <p>8,000</p>
                                                        : currentUser.class === 'Entrepreneur' ?
                                                        <p>7,000</p>
                                                        : currentUser.class === 'Supervisor' ?
                                                        <p>5,000</p>
                                                        : currentUser.class === 'Manager' ?
                                                        <p>3,000</p>
                                                        :
                                                        ''
                                                    }
                                                </div>
                                                <button onClick={ (e) => upgrade(e) } className='font-semibold text-orange-500 underline'>{ currentUser.class === 'Member' ? 'Purchase' : 'Upgrade' }</button>
                                            </div>
                                        } */}
                                    </div>
                                    { currentUser.class !== 'Member' && (
                                        <div className='pl-12 text-sm text-purple-400'>Package Received: { currentUser.ceo }</div>
                                    )}
                                    <div className='flex flex-cols mt-2 items-center'>
                                        {/* <FormControlLabel disabled={ currentUser.class === 'Member' || currentUser.class === 'Entrepreneur' || currentUser.class === 'Supervisor' || currentUser.class === 'Manager' || currentUser.class === 'CEO' ? false : true } control={<Radio value="businessempire" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} /> */}
                                        <FormControlLabel control={<Radio value="businessempire" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} />
                                        <div className='text-yellow-200 bg-red-500 w-44 font-semibold text-center text-lg rounded-lg shadow-md'>Business Empire</div>
                                        {/* { pkg === 'businessempire' &&
                                            <div className='grid grid-cols-2 items-center justify-between px-35'>
                                                <div className='flex items-center font-semibold'>
                                                    <TbCurrencyPeso color='red'/>
                                                    { currentUser.class === 'Member' ?
                                                        <p>10,000</p>
                                                        : currentUser.class === 'Entrepreneur' ?
                                                        <p>9,000</p>
                                                        : currentUser.class === 'Supervisor' ?
                                                        <p>7,000</p>
                                                        : currentUser.class === 'Manager' ?
                                                        <p>5,000</p>
                                                        : currentUser.class === 'CEO' ?
                                                        <p>2,000</p>
                                                        :
                                                        ''
                                                    }
                                                </div>
                                                <button onClick={ (e) => upgrade(e) } className='font-semibold text-orange-500 underline'>{ currentUser.class === 'Member' ? 'Purchase' : 'Upgrade' }</button>
                                            </div>
                                        } */}
                                    </div>
                                    { currentUser.class !== 'Member' && (
                                        <div className='pl-12 text-sm text-red-500'>Package Received: { currentUser.businessempire }</div>
                                    )}
                                    <div className='flex flex-cols mt-2 items-center'>
                                        <FormControlLabel control={<Radio value="silver" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} />
                                        <div className='text-yellow-200 bg-gradient-to-r from-stone-600 to-stone-300 border-2 border-gray-600 w-32 font-semibold text-center text-lg rounded-lg shadow-md'>Silver</div>
                                    </div>
                                    { currentUser.class === 'Silver' && currentUser.rank === 'Business Empire' && (
                                        <div className='flex flex-cols mt-2 items-center'>
                                            <FormControlLabel disabled={ currentUser.class !== 'Silver' && currentUser.rank !== 'Business Empire' } control={<Radio value="gold" onChange={(e) => setPackage(e.target.value)} style={{color: "gray"}} />} />
                                            <div className='text-yellow-200 bg-gradient-to-r from-amber-600 to-amber-300 border-2 border-gray-600 w-32 font-semibold text-center text-lg rounded-lg shadow-md'>Gold</div>
                                        </div>
                                    )}
                                </RadioGroup>
                            </div>
                            :
                            < ValidationBeforeRegister />
                        }

                        < br />
                        < hr />

                        <div className='mt-6 ml-3 font-semibold text-gray-400'>
                            { currentUser.religion && pkg === 'entrepreneur' ?
                                <ul className='list-disc'>
                                    <li>Earns down to 2nd Level</li>
                                    <li>1% Royalty Forever from purchases from Direct Invites in ecommerce</li>
                                    <li>EPA Badge</li>
                                    <li>EPA Life Insurance</li>
                                    <li>Entrepreneur Beauty Kit</li>
                                </ul>
                            : pkg === 'supervisor' ?
                                <ul className='list-disc'>
                                    <li>Earns down to 4th Level</li>
                                    <li>.5% Affiliate Commission in ecommerce</li>
                                    <li>1% Royalty Forever from purchases from Direct Invites in ecommerce</li>
                                    <li>EPA Calling Cards</li>
                                    <li>Supervisor Beauty Kit</li>
                                    <li>If Direct Purchased, you also get the package of Entrepreneur Package</li>
                                </ul>
                            : pkg === 'manager' ?
                                <ul className='list-disc'>
                                    <li>Earns down to 6th Level</li>
                                    <li>1% Affiliate Commission in ecommerce</li>
                                    <li>1% Royalty Forever from purchases from Direct Invites in ecommerce</li>
                                    <li>EPA Pin</li>
                                    <li>Manager Beauty Kit</li>
                                    <li>If direct purchased, you will also get the packages of Entrepreneur and Supervisor packages</li>
                                </ul>
                            : pkg === 'ceo' ?
                                <ul className='list-disc'>
                                    <li>Earns down to 8th Level</li>
                                    <li>1.5% Affiliate Commission in ecommerce</li>
                                    <li>1% Royalty Forever from purchases from Direct Invites in ecommerce</li>
                                    <li>EPA Polo Shirt</li>
                                    <li>CEO Beauty Kit</li>
                                    <li>If direct purchased, you will also get the packages from Entrepreneur, Supervisor and Manager Packages</li>
                                </ul>
                            : pkg === 'businessempire' ?
                                <ul className='list-disc'>
                                    <li>Earns down to 10th Level</li>
                                    <li>2% Affiliate Commission in ecommerce</li>
                                    <li>1% Royalty Forever from purchases from Direct Invites in ecommerce</li>
                                    <li>Business Empire Beauty Kit</li>
                                    <li>Or EPA Business Phone</li>
                                    <li>If direct purchased, you will also get the packages from Entrepreneur, Supervisor, Manager, and CEO packages</li>
                                </ul>
                            : pkg === 'gold' ?
                                <div onClick={ (e) => activateGold(e) } className='p-2 bg-gradient-to-r from-amber-600 to-amber-300 border-2 text-white rounded-xl shadow-md'>
                                    <div className='flex items-center justify-center gap-3'>
                                        <p className='font-semibold'>Activate Gold Membership</p>
                                    </div>
                                </div>
                            :
                                ''
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className='mb-20'/>

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

export default Package
