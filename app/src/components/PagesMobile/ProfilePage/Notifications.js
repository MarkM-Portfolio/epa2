import React, { useState, useEffect } from 'react'
import Cookies from 'universal-cookie'
import axios from 'axios'
import moment from 'moment'
import PropTypes from 'prop-types'
import notifs_img from '../../../assets/notifications.png'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { IoMdNotifications } from 'react-icons/io'
import { createTheme, ThemeProvider, Box, Tab, Tabs } from '@mui/material'

const Notifications = () => {
    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ myNotifs, setMyNotifs ] = useState('')
    const [ sellerNotifs, setSellerNotifs ] = useState('')
    const [ value, setValue ] = React.useState(0)

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
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (currentUser && currentUser._id) {
            axios.get(`/api/notification/${ user.id }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setMyNotifs(res.data.notif)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ currentUser ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (currentUser && currentUser._id) {
            axios.get(`/api/notification`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setSellerNotifs(res.data.notifs)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ currentUser ])

    const customFont = {
        fontFamily: 'montserrat',
        fontWeight: 700,
    }
    
    const theme = createTheme({
        palette: {
            primary: {
                main: user.class === 'Entrepreneur' ? '#84CC16' : user.class === 'Supervisor' ? '#06b6D4' : user.class === 'Manager' ? '#F59E0B' : user.class === 'CEO' ? '#C084FC' : user.class === 'Business Empire' ? '#EF4444' : user.class === 'Silver' ? '#C0C0C0' : user.class === 'Gold' ? '#FFD700' : '#50C8A0',
            },
        },
        typography: {
            fontFamily: 'montserrat', 
        },
        components: {
            MuiTab: {
                styleOverrides: {
                root: customFont,
              },
            },
        }
    })
    
    const TabPanel = (props) => {
        const { children, value, index, ...other } = props
      
        return (
            <div
                role="tabpanel"
                hidden={ value !== index }
                id={`full-width-tabpanel-${ index }`}
                aria-labelledby={`full-width-tab-${ index }`}
                { ...other }
            >
                {  value === index && (
                <Box sx={{ p: 3 }}>
                    <div>{ children }</div>
                </Box>
                ) }
            </div>
        )
    }
      
    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    }
      
    const a11yProps = (index) => {
        return {
            id: `full-width-tab-${ index }`,
            'aria-controls': `full-width-tabpanel-${ index }`,
        }
    }

    const goBack = () => {
        navigate(-1)
    }

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    let date_time = new Date()
    let date = (date_time.getDate())

    const myNotifications = ( myNotifs && myNotifs.map(item =>
        <div className="flex flex-2 items-end" key={ item._id }>
            { item.type === 'mynotif' ? 
                <div className={ `${ item.image ? 'bg-emerald-300' : 'border-2 border-blue-400 bg-gray-50' } rounded-lg shadow-md px-4 flex items-center justify-between gap-4 py-6 text-xs w-full mb-2` }>
                    { !item.image ? 
                        <img className="w-22 h-12 rounded-full" src={ notifs_img } alt="Notifs image" />  
                        : item.tags === 'order-product' ?
                            <NavLink to="/myorders">
                                <img className="w-22 h-12 rounded-full" src={ window.location.origin + '/public/products/' + item.image } alt="Notifs image" />
                            </NavLink>
                        : item.tags === 'order-service' ?
                            <NavLink to="/myorders">
                                <img className="w-22 h-12 rounded-full" src={ window.location.origin + '/public/services/' + item.image } alt="Notifs image" />
                            </NavLink>
                        : item.tags === 'delivery-product' ?
                            <NavLink to="/mysales">
                                <img className="w-22 h-12 rounded-full" src={ window.location.origin + '/public/products/' + item.image } alt="Notifs image" />
                            </NavLink>
                        : item.tags === 'delivery-service' ?
                            <NavLink to="/mysales">
                                <img className="w-22 h-12 rounded-full" src={ window.location.origin + '/public/services/' + item.image } alt="Notifs image" />
                            </NavLink>
                        : item.tags === 'sponsor-commission' ?
                            <img className="w-22 h-12 rounded-full" src={ window.location.origin + '/private/avatar/' + item.image } alt="Notifs image" />
                        :
                            <img className="w-22 h-12 rounded-full" src={ window.location.origin + '/public/stores/' + item.image } alt="Notifs image" />
                    }
                    { item.tags === 'delivery-product' || item.tags === 'delivery-service' ? 
                        <NavLink to="/mysales">
                            <h2>{ item.message }</h2>
                        </NavLink>
                        : item.tags === 'order-product' || item.tags === 'order-service' ?
                        <NavLink to="/myorders">
                            <h2>{ item.message }</h2>
                        </NavLink>
                        :
                        <h2>{ item.message }</h2>
                    }
                    { date === new Date(item.createdAt).getDate() ? 
                        // <h2 className='text-gray-600'>{ 'Today' }</h2>
                        <h2 className='text-gray-600'>{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</h2>
                        :
                        <h2 className='text-gray-600'>{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</h2>
                    }
                    {/* { date === new Date(item.createdAt).getDate() - 1 ? 
                        <h2 className='text-gray-600'>{ 'Yesterday' }</h2>
                        :
                        <h2 className='text-gray-600'>{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</h2>
                    } */}
                </div>
                :
                ''
            }
        </div>
    ))

    const sellerUpdates = ( sellerNotifs && sellerNotifs.map(item =>
        <div className="flex flex-2 items-end" key={ item._id }>
            { item.type === 'seller' ? 
                <div className='px-4 flex items-center justify-between gap-4 bg-gray-50 py-6 text-xs w-full mb-2'>
                    <img className="w-22 h-12 rounded-full" src={ window.location.origin + '/public/stores/' + item.image } alt="Notifs image" />
                    <h2>{ item.message }</h2>
                    <h2 className='text-gray-600'>{ date === new Date(item.createdAt).getDate() ? 'Today' : moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</h2>
                </div>
                :
                ''
            }
        </div>
    ))

    return (
        <>
            <div className='font-montserrat lg:hidden'>
                <div className='px-6 mt-10'>
                    <div className='flex items-center gap-2'> 
                        <div className='grid grid-cols-2 font-bold font-montserrat'>
                            <FaArrowAltCircleLeft onClick={ () => goBack() } className='text-4xl' />
                        </div>   
                    </div>
                </div>
                <div className='flex justify-center gap-2 text-3xl -mt-7'>
                    <IoMdNotifications className='fill-orange-500' />
                    <h1 className='text-lg text-center font-semibold mb-10 pl-1'>Notifications</h1>
                </div>

                <div className="flex justify-between rounded-lg bg-white">
                    <ThemeProvider theme={ theme }>
                        <Box sx={{ bgcolor: 'background.paper', width: '100vw' }}>
                            <Tabs
                                value={ value }
                                onChange={ handleChange }
                                textColor='primary'
                                variant='fullWidth'
                                centered
                            >
                                <Tab label="My Notifications" { ...a11yProps(0) } />
                                <Tab label="Seller Updates" { ...a11yProps(1) } />
                            </Tabs>
                            <TabPanel value={ value } index={ 0 } dir={ theme.direction }>
                                <div className='px-2'>
                                    { myNotifications }
                                </div>
                            </TabPanel>
                            <TabPanel value={ value } index={ 1 } dir={ theme.direction }>
                                <div className='px-2'>
                                    { sellerUpdates }
                                </div>
                            </TabPanel>
                        </Box>
                    </ThemeProvider>
                </div>

                {/* <div className='px-6'>
                    <div>
                        <h1 className='pb-4'>New</h1>
                        <div className='px-4 flex items-center justify-between gap-4 bg-gray-50 py-6 text-xs'>
                            <img className="w-12 h-12 rounded-full" src="https://www.travelandleisure.com/thmb/80zSLBjUd8dtB77prhlNVzXbbZQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/cariuma-avatar-underwater-canvas-57b765bbed0b4ff9afa70c4f124d5968.jpg" alt="Rounded avatar" />
                            <h2>
                                <span className='text-blue-500'>50% Off</span>
                                in Ultraboost All Terrain Ltd Shoes
                            </h2>
                            <h2 className='text-gray-400'>9:35am</h2>
                        </div>
                        <div className='mt-4 px-4 flex items-center justify-between gap-4 bg-gray-50 py-6 text-xs'>
                            <img className="w-12 h-12 rounded-full" src="https://i.ebayimg.com/images/g/Q2wAAOSwp2deLy-J/s-l1200.webp" alt="Rounded avatar" />
                            <h2>
                                One step ahead with new <span className='font-bold'>stylish collections</span> every week
                            </h2>
                            <h2 className='text-gray-400'>9:20am</h2>
                        </div>
                    </div>

                    <div>
                        <h1 className='pb-4 pt-4'>Earlier</h1>
                        <div className='px-4 flex items-center justify-between gap-4 bg-gray-50 py-6 text-xs'>
                            <img className="w-12 h-12 rounded-full" src="https://www.pushengage.com/wp-content/uploads/2022/10/How-to-Add-a-Push-Notification-Icon.png" alt="Rounded avatar" />
                            <h2>
                                Package from your order <span className='text-blue-500'>#1982345</span> has <span className='font-bold'>arrived</span>
                            </h2>
                            <h2 className='text-gray-400'>Yesterday</h2>
                        </div>
                    </div>
                </div> */}
            </div>
        </>
    )
}

export default Notifications