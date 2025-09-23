import React, { useState, useEffect } from 'react'
import Cookies from 'universal-cookie'
import axios from 'axios'
import moment from 'moment'
import PropTypes from 'prop-types'
import ModalAdmin from '../components/ModalAdmin'
import { AppBar, Box, Tab, Tabs, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { TbCurrencyPeso } from 'react-icons/tb'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
                <Typography>{ children }</Typography>
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

const Admin = () => {

    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ topUp, setTopUp ] = useState('')
    const [ withdraw, setWithdraw ] = useState('')
    const [ transaction, setTransaction ] = useState('')
    
    const theme = useTheme()
    const [ value, setValue ] = React.useState(0)

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        const topUpItems = []
        const withdrawItems = []
        const transactionItems = []

        if (user && user.id) {
            axios.get(`/api/load`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                res.data.loads.forEach(item => {
                    if (item.type.includes('topup') && item.status.includes('Pending'))
                        topUpItems.push(item)
                    if (item.type.includes('withdraw') && item.status.includes('Pending'))
                        withdrawItems.push(item)
                    if (!item.status.includes('Pending'))
                        transactionItems.push(item)
                })
                setTopUp(topUpItems)
                setWithdraw(withdrawItems)
                setTransaction(transactionItems)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user ])

    const approveButton = async (id) => {

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/load/approve/${ id }`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            setTopUp(res.data.load)
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

    const rejectButton = async (id) => {

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/load/reject/${ id }`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            setTopUp(res.data.load)
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

    const approveWithdrawButton = async (id) => {

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/load/approve-withdraw/${ id }`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            setWithdraw(res.data.load)
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

    const rejectWithdrawButton = async (id) => {

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/load/reject-withdraw/${ id }`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            setWithdraw(res.data.load)
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
    
    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    const topUpDisplay = ( topUp && topUp.length && topUp.map((item, idx) => (
        <div key={ item._id }>
            <ul className="px-4 text-lg">
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Top-up Amount : <span className="grid grid-cols-10 text-blue-800 items-center"><TbCurrencyPeso color='red'/>{ item.amount }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Payment Method : <span className={ item.paymentMethod === 'gcash' ? 'uppercase text-blue-500 font-semibold' : 'uppercase text-green-500 font-semibold' }>{ item.paymentMethod }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Status: <span className="grid grid-cols-10 text-orange-500 items-center">{ item.status }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Name : <span className="text-gray-800">{ item.email }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Mobile Number : <span className="text-gray-800">{ item.mobilenum }</span></li>
                {/* <li className="grid grid-cols-2 text-gray-500 font-semibold">Current Balance : <span className="grid grid-cols-10 text-blue-800 items-center"><TbCurrencyPeso color='red'/>{ item.userBalance }</span></li> */}
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Date Requested : <span className="text-gray-800 items-center">{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</span></li>             
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Screenshot : 
                  <a href={ window.location.origin + '/private/loads/' + item.image } target="_blank" rel="noreferrer">
                    <img src={ window.location.origin + '/private/loads/' + item.image } alt="receipt" />
                  </a>
                </li>
                <div className="flex gap-2 justify-end my-1 text-white text-sm font-bold">
                    <button onClick={(e) => openModal(item._id, e.target.value)} value={'topup-approve'} className="p-2 bg-green-500 rounded">Approve</button>
                    {/* <RejectButton id={item._id}/> */}
                    <button onClick={(e) => openModal(item._id, e.target.value)} value={'topup-reject'} className="p-2 bg-red-500 rounded">Reject</button>
                </div>          
            </ul>
            <hr className="mt-3 mb-3" />
        </div>
    )) )
  
      const withdrawDisplay = ( withdraw && withdraw.length && withdraw.map((item, idx) => (
        <div key={ item._id }>
            <ul className="px-4 text-lg">
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Withdrawal Amount : <span className="grid grid-cols-10 text-blue-800 items-center"><TbCurrencyPeso color='red'/>{ item.amount }</span></li>         
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Status: <span className="grid grid-cols-10 text-orange-500 items-center">{ item.status }</span></li>
                {/* <li className="grid grid-cols-2 text-gray-500 font-semibold">Service Charge : <span className="grid grid-cols-10 text-blue-500 items-center"><TbCurrencyPeso color='red'/>{ item.amount * 0.05 }</span></li>                                                      
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Credited Amount : <span className="grid grid-cols-10 text-blue-500 items-center"><TbCurrencyPeso color='red'/>{ item.amount * 0.95 }</span></li>                              */}
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Name : <span className="text-gray-800">{ item.email }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Mobile Number : <span className="text-gray-800">{ item.mobilenum }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Current Balance : <span className="grid grid-cols-10 text-blue-800 items-center"><TbCurrencyPeso color='red'/>{ item.userBalance }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Date Requested : <span className="text-gray-800 items-center">{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</span></li>              

                <div className="flex gap-2 justify-end my-1 text-white text-sm font-bold">
                    <button onClick={(e) => openModal(item._id, e.target.value)} value={'withdraw-approve'} className="p-2 bg-green-500 rounded">Approve</button>
                    {/* <RejectButton id={item._id}/> */}
                    <button onClick={(e) => openModal(item._id, e.target.value)} value={'withdraw-reject'} className="p-2 bg-red-500 rounded">Reject</button>
                </div>          
            </ul>
            <hr className="mt-3 mb-3" />
        </div>
    )) )
  
     const transactHistory = ( transaction && transaction.length && transaction.map((item, idx) => (
          <div key={ item._id }>
              <ul className="px-4 text-lg">
                  <li className="grid grid-cols-2 text-gray-500 font-semibold">{ item.type === 'topup' ? 'Top-up Amount : ' : 'Withdraw Amount : ' } <span className="grid grid-cols-10 text-blue-800 items-center"><TbCurrencyPeso color='red'/>{ item.amount }</span></li>
                  { item.paymentMethod !== '' && <li className="grid grid-cols-2 text-gray-500 font-semibold">Payment Method : <span className={item.paymentMethod === 'gcash' ? 'uppercase text-blue-500 font-semibold' : 'uppercase text-green-500 font-semibold' }>{ item.paymentMethod }</span></li> }
                  { item.status === 'Approved' ? 
                    <li className="grid grid-cols-2 text-gray-500 font-semibold">Status: <span className="grid grid-cols-10 text-green-600 items-center">{ item.status }</span></li>
                  : 
                    <li className="grid grid-cols-2 text-gray-500 font-semibold">Status: <span className="grid grid-cols-10 text-red-500 items-center">{ item.status }</span></li>
                  }
                  <li className="grid grid-cols-2 text-gray-500 font-semibold">Name : <span className="text-gray-800">{ item.email }</span></li>
                  <li className="grid grid-cols-2 text-gray-500 font-semibold">Mobile Number : <span className="text-gray-800">{ item.mobilenum }</span></li>     
                  {/* <li className="grid grid-cols-2 text-gray-500 font-semibold">User Balance :  <span className="grid grid-cols-10 text-blue-800 items-center"><TbCurrencyPeso color='red'/>{ item.userBalance }</span></li>      */}
                  <li className="grid grid-cols-2 text-gray-500 font-semibold">Date Requested : <span className="text-gray-800 items-center">{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</span></li>              
                  <li className="grid grid-cols-2 text-gray-500 font-semibold">Screenshot : 
                    <a href={ window.location.origin + '/private/loads/' + item.image } target="_blank" rel="noreferrer">
                        <img src={ window.location.origin + '/private/loads/' + item.image } alt="receipt" />
                    </a>
                </li>
              </ul>
              <hr className="mt-3 mb-3" />
          </div>
    )) )

    const [ show, setShow ] = useState(false)
    const [ itemId, setId ] = useState('')
    const [ type, setType ] = useState('')
 
    const openModal = (id, type) => {
        setShow(true)
        setId(id)
        setType(type)
    }
 
    const closeModal = (e) => {
        setShow(false)
        console.log('CLOSE MODAL >> ', e)
        if (e === 'yes') {
            if (type === 'topup-approve')
                approveButton(itemId)
            if (type === 'topup-reject')
                rejectButton(itemId)
            if (type === 'withdraw-approve')
                approveWithdrawButton(itemId)
            if (type === 'withdraw-reject')
                rejectWithdrawButton(itemId)
        }
    }

    return (
        <>
            <div>
                <h1 className="uppercase font-bold text-sm">Admin Panel</h1>
                <div className="flex justify-between rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                    <Box sx={{ bgcolor: 'background.paper', width: '100vw' }}>
                        <AppBar position='static'>
                            <Tabs
                                value={ value }
                                onChange={ handleChange }
                                indicatorColor='secondary'
                                textColor='inherit'
                                variant='fullWidth'
                                centered
                            >
                                <Tab label="Top-Up" { ...a11yProps(0) } />
                                <Tab label="Withdraw" { ...a11yProps(1) } />
                                <Tab label="Transaction History" { ...a11yProps(2) } />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={ value } index={ 0 } dir={ theme.direction }>
                            { topUpDisplay }
                        </TabPanel>
                        <TabPanel value={ value } index={ 1 } dir={ theme.direction }>
                            { withdrawDisplay }
                        </TabPanel>
                        <TabPanel value={ value } index={ 2 } dir={ theme.direction }>
                            { transactHistory }
                        </TabPanel>
                    </Box>
                </div>
            </div>
            <ModalAdmin show={ show } onClose={ closeModal }>
                { type === 'topup-approve' || type === 'withdraw-approve' ?
                    <h2 className="text-lg font-bold mb-4">Confirm Approval</h2>
                    :
                    <h2 className="text-lg font-bold mb-4">Confirm Reject</h2>
                }
                <p>Are you sure ?</p>
            </ModalAdmin>
            <ToastContainer
                position="bottom-center"
                autoClose={3000}
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

export default Admin
