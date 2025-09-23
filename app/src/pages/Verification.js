import React, { useState, useEffect } from 'react'
import Cookies from 'universal-cookie'
import axios from 'axios'
import moment from 'moment'
import PropTypes from 'prop-types'
import ModalVerification from '../components/ModalVerification'
import { AppBar, Box, Tab, Tabs } from '@mui/material'
import { useTheme } from '@mui/material/styles'
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

const Verification = () => {
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ pending, setPending ] = useState([])
    const [ approved, setApproved ] = useState([])
    const [ rejected, setRejected ] = useState([])
    // const [ topUp, setTopUp ] = useState('')
    // const [ withdraw, setWithdraw ] = useState('')
    // const [ transaction, setTransaction ] = useState('')
    
    const theme = useTheme()
    const [ value, setValue ] = React.useState(0)

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (user && user.id) {
            axios.get(`/api/user`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setPending(res.data.users.filter(usr => !usr.isVerified && usr.status === 'Pending'))
                setApproved(res.data.users.filter(usr => usr.isVerified && usr.status === 'Approved'))
                setRejected(res.data.users.filter(usr => !usr.isVerified && usr.status === 'Rejected'))
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user ])

    const handleButtonClick = async (id, type) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/user/verify/${ id }`, { type: type }, {
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

    const forVerificationDisplay = ( pending && pending.map(item => (
        <div key={ item._id }>
            <ul className="px-4 text-lg">
                {/* <li className="grid grid-cols-2 text-gray-500 font-semibold">Status: <span className="grid grid-cols-10 text-orange-500 items-center">{ item.status }</span></li> */}
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Name : <span className="text-gray-800">{ item.name }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Email : <span className="text-gray-800">{ item.email }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Mobile Number : <span className="text-gray-800">{ item.mobilenum }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Employed Salary : <span className="text-gray-800">{ item.salaryEmployed.$numberDecimal }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Self-Employed Salary : <span className="text-gray-800">{ item.salarySelfEmployed.$numberDecimal }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Pension : <span className="text-gray-800">{ item.salaryPension.$numberDecimal }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Spouse's Name : <span className="text-gray-800">{ item.spouse }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Father's Name : <span className="text-gray-800">{ item.father }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Mother's Maiden Name : <span className="text-gray-800">{ item.mother }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Sibling # 1 : <span className="text-gray-800">{ item.sibling1 }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Sibling # 2 : <span className="text-gray-800">{ item.sibling2 }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Sibling # 3 : <span className="text-gray-800">{ item.sibling3 }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Sibling # 4 : <span className="text-gray-800">{ item.sibling4 }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Sibling # 5 : <span className="text-gray-800">{ item.sibling5 }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Other Siblings : <span className="text-gray-800">{ item.otherSiblings }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold"># of Dependents : <span className="text-gray-800">{ item.dependents }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Current Company : <span className="text-gray-800">{ item.currentCompany }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Current Job : <span className="text-gray-800">{ item.currentJob }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Dream Job : <span className="text-gray-800">{ item.dreamJob }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Date Requested : <span className="text-gray-800 items-center">{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">IDs Submitted : 
                  <a href={ window.location.origin + '/private/verify/' + item.idImage1 } target="_blank" rel="noreferrer">
                    <img src={ window.location.origin + '/private/verify/' + item.idImage1 } alt="receipt" />
                  </a>
                  <a href={ window.location.origin + '/private/verify/' + item.idImage2 } target="_blank" rel="noreferrer">
                    <img src={ window.location.origin + '/private/verify/' + item.idImage2 } alt="receipt" />
                  </a>
                  <a href={ window.location.origin + '/private/verify/' + item.idImage3 } target="_blank" rel="noreferrer">
                    <img src={ window.location.origin + '/private/verify/' + item.idImage3 } alt="receipt" />
                  </a>
                </li>
                <div className="flex gap-2 justify-end my-1 text-white text-sm font-bold">
                    <button onClick={(e) => openModal(item._id, e.target.value)} value={'approved'} className="p-2 bg-green-500 rounded">Approve</button>
                    {/* <RejectButton id={item._id}/> */}
                    <button onClick={(e) => openModal(item._id, e.target.value)} value={'rejected'} className="p-2 bg-red-500 rounded">Reject</button>
                </div>          
            </ul>
            <hr className="mt-3 mb-3" />
        </div>
    )) )
  
    const approvedDisplay = ( approved && approved.map(item => (
        <div key={ item._id }>
            <ul className="px-4 text-lg">
                {/* <li className="grid grid-cols-2 text-gray-500 font-semibold">Status: <span className="grid grid-cols-10 text-orange-500 items-center">{ item.status }</span></li> */}
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Name : <span className="text-gray-800">{ item.name }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Email : <span className="text-gray-800">{ item.email }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Mobile Number : <span className="text-gray-800">{ item.mobilenum }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Date Requested : <span className="text-gray-800 items-center">{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</span></li>             
                <li className="grid grid-cols-2 text-gray-500 font-semibold">IDs Submitted : 
                  <a href={ window.location.origin + '/private/verify/' + item.idImage1 } target="_blank" rel="noreferrer">
                    <img src={ window.location.origin + '/private/verify/' + item.idImage1 } alt="receipt" />
                  </a>
                  <a href={ window.location.origin + '/private/verify/' + item.idImage2 } target="_blank" rel="noreferrer">
                    <img src={ window.location.origin + '/private/verify/' + item.idImage2 } alt="receipt" />
                  </a>
                  <a href={ window.location.origin + '/private/verify/' + item.idImage3 } target="_blank" rel="noreferrer">
                    <img src={ window.location.origin + '/private/verify/' + item.idImage3 } alt="receipt" />
                  </a>
                </li>      
            </ul>
            <hr className="mt-3 mb-3" />
        </div>
    )) )
  
    const rejectedDisplay = ( rejected && rejected.map(item => (
        <div key={ item._id }>
            <ul className="px-4 text-lg">
                {/* <li className="grid grid-cols-2 text-gray-500 font-semibold">Status: <span className="grid grid-cols-10 text-orange-500 items-center">{ item.status }</span></li> */}
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Name : <span className="text-gray-800">{ item.name }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Email : <span className="text-gray-800">{ item.email }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Mobile Number : <span className="text-gray-800">{ item.mobilenum }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Employed Salary : <span className="text-gray-800">{ item.salaryEmployed.$numberDecimal }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Self-Employed Salary : <span className="text-gray-800">{ item.salarySelfEmployed.$numberDecimal }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Pension : <span className="text-gray-800">{ item.salaryPension.$numberDecimal }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Spouse's Name : <span className="text-gray-800">{ item.spouse }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Father's Name : <span className="text-gray-800">{ item.father }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Mother's Maiden Name : <span className="text-gray-800">{ item.mother }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Sibling # 1 : <span className="text-gray-800">{ item.sibling1 }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Sibling # 2 : <span className="text-gray-800">{ item.sibling2 }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Sibling # 3 : <span className="text-gray-800">{ item.sibling3 }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Sibling # 4 : <span className="text-gray-800">{ item.sibling4 }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Sibling # 5 : <span className="text-gray-800">{ item.sibling5 }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Other Siblings : <span className="text-gray-800">{ item.otherSiblings }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold"># of Dependents : <span className="text-gray-800">{ item.dependents }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Current Company : <span className="text-gray-800">{ item.currentCompany }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Current Job : <span className="text-gray-800">{ item.currentJob }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Dream Job : <span className="text-gray-800">{ item.dreamJob }</span></li>
                <li className="grid grid-cols-2 text-gray-500 font-semibold">Date Requested : <span className="text-gray-800 items-center">{ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }</span></li>             
                <li className="grid grid-cols-2 text-gray-500 font-semibold">IDs Submitted : 
                  <a href={ window.location.origin + '/private/verify/' + item.idImage1 } target="_blank" rel="noreferrer">
                    <img src={ window.location.origin + '/private/verify/' + item.idImage1 } alt="receipt" />
                  </a>
                  <a href={ window.location.origin + '/private/verify/' + item.idImage2 } target="_blank" rel="noreferrer">
                    <img src={ window.location.origin + '/private/verify/' + item.idImage2 } alt="receipt" />
                  </a>
                  <a href={ window.location.origin + '/private/verify/' + item.idImage3 } target="_blank" rel="noreferrer">
                    <img src={ window.location.origin + '/private/verify/' + item.idImage3 } alt="receipt" />
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
            console.log('type: ', type)
            handleButtonClick(itemId, type)
        }
    }

    return (
        <>
            <div>
                <h1 className="uppercase font-bold text-sm">Verification</h1>
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
                                <Tab label="For Verification" { ...a11yProps(0) } />
                                <Tab label="Approved" { ...a11yProps(1) } />
                                <Tab label="Rejected" { ...a11yProps(2) } />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={ value } index={ 0 } dir={ theme.direction }>
                            { forVerificationDisplay }
                        </TabPanel>
                        <TabPanel value={ value } index={ 1 } dir={ theme.direction }>
                            { approvedDisplay }
                        </TabPanel>
                        <TabPanel value={ value } index={ 2 } dir={ theme.direction }>
                            { rejectedDisplay }
                        </TabPanel>
                    </Box>
                </div>
            </div>


            <ModalVerification show={ show } onClose={ closeModal }>
                { type === 'approved' ?
                    <h2 className="text-lg font-bold mb-4">Confirm Approval</h2>
                    :
                    <h2 className="text-lg font-bold mb-4">Confirm Reject</h2>
                }
                <div>Are you sure ?</div>
            </ModalVerification>

            <div className='mb-20'/>

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

export default Verification
