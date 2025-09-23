import Cookies from 'universal-cookie'
import axios from 'axios'
import gcash from '../../../assets/gcash.png'
import maya from '../../../assets/maya.png'
import epa_logo from '../../../assets/logo.png'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { BsCashCoin } from 'react-icons/bs'
import { TbCurrencyPeso } from 'react-icons/tb'
import { FaPercent } from 'react-icons/fa'
// import { Radio, RadioGroup, FormControlLabel } from '@mui/material'
import { Radio, RadioGroup, Switch, FormGroup, FormControlLabel, FormControl, Select, MenuItem } from '@mui/material'
import moment from 'moment'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { downloadExcel } from 'react-export-table-to-excel'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const EpaCash = () => {

    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ currentPayMode, setCurrentPayMode ] = useState('')
    // const [ fileExist, setFileExist ] = useState(false)
    // const [ file, setFile ] = useState()
    // const [ topUp, setTopUp ] = useState('')
    // const [ withdraw, setWithdraw ] = useState('')
    const [ payment, setPayment ] = useState('gcash')
    const [ amount, setAmount ] = useState('')
    const [ vaultAmount, setVaultAmount ] = useState('')
    // const [ epaAccount, setEpaAccount ] = useState('')
    const [ generate, setGenerate ] = useState('')
    const [ allLedger, setAllLedger ] = useState('')
    const [ ledger, setLedger ] = useState('')
    const [ epaLedger, setEpaLedger ] = useState('')
    const [ allUsers, setAllUsers ] = useState([])
    const [ eWalletNum, setEwalletNum ] = useState('')
    const [ iou, setIou ] = useState([])
    const [ iouAmount, setIouAmount ] = useState('')
    const [ iouInterest, setIouInterest ] = useState(0)
    const [ iouTerms, setIouTerms ] = useState('')
    const [ iouDuration, setIouDuration ] = useState('week')
    const [ iouEwallet, setIouEwallet ] = useState('')
    const [ checked, setChecked ] = useState(false)
    let headers, body, totalAmount
    let epaHeaders, epaBody, epaTotalAmount
    let allHeaders, allBody, allTotalAmount

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

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
                setLedger(res.data.loads.filter(item => item.owner.includes(user.id)))
                setEpaLedger(res.data.loads.filter(item => item.type === 'Generate EPA Cash'))
                setAllLedger(res.data.loads.filter(item => item.type === 'Send EPA Cash' || item.type === 'Send IOU' && item.isIouConfirmed))
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

        const allItems = []
    
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
                res.data.users.forEach(item => {
                    if (user.email !== 'edchan333@gmail.com') {
                        if (item._id !== user.id)
                            allItems.push(item)
                    }
                    else {
                        allItems.push(item)
                    }
                })
                setAllUsers(allItems)
                // setAllUsers(res.data.users.filter(item => item._id !== user.id))
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
            axios.get(`/api/setting`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setCurrentPayMode(res.data.settings.isAutoPay)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ currentUser ])

    // useEffect(() => {
    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     if (currentUser && currentUser._id) {
    //         axios.get(`/api/user/${ process.env.EPA_ACCT_ID }`, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json',
    //                 'X-Api-Key': process.env.API_KEY
    //             },
    //             data: { cancelToken: source.token }
    //         }).then(res => {
    //             console.log('Success OK: ', res.status)
    //             setEpaAccount(res.data.user)
    //         }).catch((err) => {
    //             if (axios.isCancel(err)) console.log('Successfully Aborted')
    //             else console.error(err)
    //         })
    //         return () => { source.cancel() }
    //     }
    // }, [ currentUser ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (user && user.id) {
            axios.get(`/api/load/iou/${ user.email }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                // if (!res.data.load.isIouConfirmed)
                //     setIou(res.data.load)
                setIou(res.data.load.filter(item => !item.isIouConfirmed))
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user ])

    if (ledger) {
        headers = [ 'Date', 'Type', 'Sender', 'Recipient', 'Email', 'Mobile #', 'Amount' ]

        if (ledger.length) {
                body = [ ...ledger.map((item) => [
                    `${ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }`,
                    item.type,
                    item.sender,
                    item.recipient,
                    item.email,
                    item.mobilenum,
                    String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                ])
            ]

            totalAmount = ledger.reduce((sum, item) => sum + parseFloat(item.amount.$numberDecimal), 0)
        } else {
            const newArr = []
            newArr.push(ledger)
                body = [ ...newArr.map((item) => [
                    `${ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }`,
                    item.type,
                    item.sender,
                    item.recipient,
                    item.email,
                    item.mobilenum,
                    item.amount && String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                ])
            ]

            totalAmount = ledger.reduce((sum, item) => sum + parseFloat(item.amount.$numberDecimal), 0)
        }
    }

    if (allLedger) {
        allHeaders = [ 'Date', /*'Type',*/ 'Sender', 'Recipient', 'Email', 'Mobile #', 'Amount' ]
        
        if (allLedger.length) {
            allBody = [ ...allLedger.map((item) => [
                    `${ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }`,
                    // item.type,
                    item.sender,
                    item.recipient,
                    item.email,
                    item.mobilenum,
                    String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                ])
            ]
    
            allTotalAmount = allLedger.reduce((sum, item) => sum + parseFloat(item.amount.$numberDecimal), 0)
        } else {
            const newArr = []
            newArr.push(allLedger)
                allBody = [ ...newArr.map((item) => [
                    `${ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }`,
                    // item.type,
                    item.sender,
                    item.recipient,
                    item.email,
                    item.mobilenum,
                    item.amount && String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                ])
            ]

            allTotalAmount = allLedger.reduce((sum, item) => sum + parseFloat(item.amount.$numberDecimal), 0)
        }
    }

    if (epaLedger) {
        epaHeaders = [ 'Date', 'Type', 'Sender', 'Recipient', 'Email', 'Mobile #', 'Amount' ]
        
        if (epaLedger.length) {
            epaBody = [ ...epaLedger.map((item) => [
                    `${ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }`,
                    item.type,
                    item.sender,
                    item.recipient,
                    item.email,
                    item.mobilenum,
                    String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                ])
            ]
    
            epaTotalAmount = epaLedger.reduce((sum, item) => sum + parseFloat(item.amount.$numberDecimal), 0)
        } else {
            const newArr = []
            newArr.push(epaLedger)
                epaBody = [ ...newArr.map((item) => [
                    `${ moment(item.createdAt).format('MM/DD/YYYY hh:mm A') }`,
                    item.type,
                    item.sender,
                    item.recipient,
                    item.email,
                    item.mobilenum,
                    item.amount && String(parseFloat(item.amount.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                ])
            ]

            epaTotalAmount = epaLedger.reduce((sum, item) => sum + parseFloat(item.amount.$numberDecimal), 0)
        }
    }

    const goBack = () => {
        navigate(-1)
    }

    const toggleSwitch = (e) => {
        setChecked(e.target.checked)
    }

    const ledgerExportPDF = () => {
        const doc = new jsPDF()

        const bodyTotal = [
            [{ content: `TOTAL Amount: ${ String(parseFloat(totalAmount).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }`, colSpan: 7, 
                styles: { fillColor: [ 0, 255, 128 ] }
            }]
        ]

        bodyTotal.forEach(item => {
            body.push(item)
        })

        doc.autoTable({ 
            head: [ headers ], 
            body: body
        })
        
        doc.save('Transactions_Ledger.pdf')

        setTimeout(() => {
            window.location.reload() // add timeout for refresh
        }, 1000)
    }

    // const ledgerExportXLS = () => {
    //     const bodyTotal = [[
    //         'TOTAL', '', '', '', '', '',
    //         totalAmount
    //     ]]

    //     bodyTotal.forEach(item => {
    //         body.push(item)
    //     })

    //     downloadExcel({
    //         fileName: 'Transactions.xls',
    //         sheet: 'Transactions',
    //         tablePayload: {
    //             headers,
    //             body: body
    //         }
    //     })

    //     setTimeout(() => {
    //         window.location.reload() // add timeout for refresh
    //     }, 1000)
    // }

    const allLedgerExportPDF = () => {
        const doc = new jsPDF()

        const bodyTotal = [
            [{ content: `TOTAL Amount: ${ String(parseFloat(allTotalAmount).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }`, colSpan: 7, 
                styles: { fillColor: [ 0, 255, 128 ] }
            }]
        ]

        bodyTotal.forEach(item => {
            allBody.push(item)
        })

        doc.autoTable({ 
            head: [ allHeaders ], 
            body: allBody
        })
        
        doc.save('All_Transactions_Ledger.pdf')

        setTimeout(() => {
            window.location.reload() // add timeout for refresh
        }, 1000)
    }


    // const allLedgerExportXLS = () => {
    //     const bodyTotal = [[
    //         'TOTAL', '', '', '', '', '',
    //         allTotalAmount
    //     ]]

    //     bodyTotal.forEach(item => {
    //         allBody.push(item)
    //     })

    //     downloadExcel({
    //         fileName: 'All_Transactions.xls',
    //         sheet: 'All Transactions',
    //         tablePayload: {
    //             allHeaders,
    //             body: allBody
    //         }
    //     })

    //     setTimeout(() => {
    //         window.location.reload() // add timeout for refresh
    //     }, 1000)
    // }

    const epaLedgerExportPDF = () => {
        const doc = new jsPDF()

        const bodyTotal = [
            [{ content: `TOTAL Amount: ${ String(parseFloat(epaTotalAmount).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }`, colSpan: 7, 
                styles: { fillColor: [ 0, 255, 128 ] }
            }]
        ]

        bodyTotal.forEach(item => {
            epaBody.push(item)
        })

        doc.autoTable({ 
            head: [ epaHeaders ], 
            body: epaBody
        })
        
        doc.save('All_Generated_Ledger.pdf')

        setTimeout(() => {
            window.location.reload() // add timeout for refresh
        }, 1000)
    }


    // const epaLedgerExportXLS = () => {
    //     const bodyTotal = [[
    //         'TOTAL', '', '', '', '', '',
    //         epaTotalAmount
    //     ]]

    //     bodyTotal.forEach(item => {
    //         epaBody.push(item)
    //     })

    //     downloadExcel({
    //         fileName: 'All_Generated_Transactions.xls',
    //         sheet: 'All Generated EPA Cash',
    //         tablePayload: {
    //             epaHeaders,
    //             body: epaBody
    //         }
    //     })

    //     setTimeout(() => {
    //         window.location.reload() // add timeout for refresh
    //     }, 1000)
    // }

    const sendEpaVault = async (e) => {

        if (vaultAmount) {
            e.preventDefault()
            e.currentTarget.disabled = true
        }

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/load/send-epavault/${ user.id }`, { amount: vaultAmount }, {
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
                setVaultAmount('')
                toast.error(err.response.data.error)
                if (err.response.data.error === 'Purchase subscription package first to send EPA Vault.') {
                    toast.info('Redirecting to Purchase Subscription Package page...')
                    setTimeout(() => {
                        window.location.href='/package'
                    }, 3000)
                }
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

    const sendEpaCash = async (e) => {

        if (amount && recipient) {
            e.preventDefault()
            e.currentTarget.disabled = true
        }

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.post(`/api/load/send-epacash/${ user.id }`, { amount: amount, eWalletNum: eWalletNum }, {
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
                if (inputData === 'amount' || inputData === 'not' || inputData === 'Max') setAmount('')
                if (err.response.data.error === 'Purchase subscription package first to send EPA Cash.') {
                    toast.info('Redirecting to Purchase Subscription Package page...')
                    setTimeout(() => {
                        window.location.href='/package'
                    }, 3000)
                }
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

    const submitIOU = async (e) => {

        if (iouAmount && iouInterest && iouTerms && iouEwallet) {
            e.preventDefault()
            e.currentTarget.disabled = true   
        }

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.post(`/api/load/create-iou/${ user.id }`, { amount: iouAmount, interest: iouInterest, terms: iouTerms, duration: iouDuration, eWalletNum: iouEwallet }, {
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
                if (err.response.data.error === 'Purchase subscription package first to Send to IOU.') {
                    setIouAmount('')
                    toast.info('Redirecting to Purchase Subscription Package page...')
                    setTimeout(() => {
                        window.location.href='/package'
                    }, 3000)
                }
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

    const generateEpaCash = async (e) => {

        if (generate) {
            e.preventDefault()
            e.currentTarget.disabled = true
        }

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/load/generate-epacash/${ user.id }`, { amount: generate }, {
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
                setGenerate('')
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

    const recipient = allUsers.find(item => {
        return item.eWalletnum === eWalletNum
    })

    const recipientIOU = allUsers.find(item => {
        return item.eWalletnum === iouEwallet
    })

//     const submitTopUp = async (e) => {
//         e.preventDefault()
//         e.currentTarget.disabled = true
        
//         const CancelToken = axios.CancelToken
//         const source = CancelToken.source()

//         const formData = new FormData()
//         formData.append('loads', file)
//         formData.append('amount', amount)
//         formData.append('paymentMethod', channel)
//         formData.append('paymentMode', currentPayMode ? 'auto' : 'manual')
//         formData.append('type', 'topup')

//         await axios.post(`/api/load/topup/${ user.id }`, formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//                 'Accept': 'multipart/form-data',
//                 'X-Api-Key': process.env.API_KEY
//             },
//             data: { cancelToken: source.token }
//         }).then(res => {
//             console.log('Success OK: ', res.status)
//             toast.success(res.data.message)
//             setTimeout(() => {
//                 window.location.reload()
//             }, 1000)
//             return res
//         }).catch((err) => {
//             if (axios.isCancel(err)) {
//                 console.log('Successfully Aborted')
//                 toast.error(err.response.data.error)
//             } else if (err.response.status === 422) { // response >> validation errors
//                 console.log('Validation Error: ', err.response.status)
//                 toast.error(err.response.data.error)
//             } else if (err.response.status === 403) { // response >> headers forbidden
//                 console.log('Forbidden: ', err.response.status)
//                 toast.error(err.response.data.error)
//             } else { // response >> server/page not found 404,500
//                 console.log('Server Error: ', err.response.status)
//                 toast.error(err.response.data.error)
//             }
//             return err
//         })
//     }

//    const submitWithdraw = async (e) => {
//         e.preventDefault()
//         e.currentTarget.disabled = true
        
//         const CancelToken = axios.CancelToken
//         const source = CancelToken.source()

//         const formData = new FormData()
//         formData.append('amount', amount)
//         formData.append('paymentMethod', channel)
//         formData.append('paymentMode', currentPayMode ? 'auto' : 'manual')
//         formData.append('type', 'withdraw')

//         await axios.post(`/api/load/withdraw/${ user.id }`, formData, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json',
//                 'X-Api-Key': process.env.API_KEY
//             },
//             data: { cancelToken: source.token }
//         }).then(res => {
//             console.log('Success OK: ', res.status)
//             toast.success(res.data.message)
//             setTimeout(() => {
//                 window.location.reload()
//             }, 1000)
//             return res
//         }).catch((err) => {
//             if (axios.isCancel(err)) {
//                 console.log('Successfully Aborted')
//                 toast.error(err.response.data.error)
//             } else if (err.response.status === 422) { // response >> validation errors
//                 console.log('Validation Error: ', err.response.status)
//                 toast.error(err.response.data.error)
//             } else if (err.response.status === 403) { // response >> headers forbidden
//                 console.log('Forbidden: ', err.response.status)
//                 toast.error(err.response.data.error)
//             } else { // response >> server/page not found 404,500
//                 console.log('Server Error: ', err.response.status)
//                 toast.error(err.response.data.error)
//             }
//             return err
//         })
//     }

//     let channel = ''
    
//     if (payment === 'gcash')
//         channel = 'gcash'

//     if (payment === 'maya')
//         channel = 'maya'

    return (
        <>
            <div className='font-montserrat lg:hidden'>
                <div className='px-6 mt-10'>
                    <div className='flex items-center gap-2'> 
                        <div className='grid grid-cols-2 font-bold font-montserrat'>
                            <FaArrowAltCircleLeft onClick={ () => goBack() } className='text-4xl'/>
                        </div>   
                    </div>
                    </div>
                    <div className='flex justify-center gap-2 text-3xl -mt-7'>
                        {/* <BsCashCoin className='fill-orange-500' /> */}
                        <img className='h-8 w-8' src={ epa_logo } />
                    <h1 className='text-2xl text-center font-semibold mb-10 pl-1'> Cash</h1>
                </div>
                <hr />

                <div className='p-4 m-2 rounded bg-gray-100 flex justify-between'>
                    <div className='flex items-center gap-2'>
                        <p className='text-gray-400 font-semibold'>Balance</p>
                        <div className='flex items-center font-semibold'>
                            <TbCurrencyPeso size={ 20 } color='red'/>
                            <p>{ currentUser.epacash && String(parseFloat(currentUser.epacash.$numberDecimal).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</p>
                        </div>
                    </div>
                    {/* <div className='flex gap-1'>
                        <button onClick={ () => { setTopUp(true), setWithdraw(false), setAmount(''), setFileExist(false) } } className='text-sm py-2 px-4 rounded bg-emerald-400 text-white hover:font-semibold'>Top Up</button>
                        <button onClick={ () => { setWithdraw(true), setTopUp(false), setAmount(''), setFileExist(false) } } className='text-sm py-2 px-4 rounded bg-red-500 text-white hover:font-semibold'>Withdraw</button>
                    </div> */}
                </div>

                <div className="flex justify-between rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                    <div className='ml-4 mt-5'>
                        <p className='text-gray-400 pb-2'>Send EPA Vault</p>
                        <div className='flex items-center'>
                            <TbCurrencyPeso size={ 30 } color='red' />
                            <input type="number" value={ vaultAmount } onChange={(e) => { setVaultAmount(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder='Enter amount to vault' />
                            <button disabled={ !vaultAmount } onClick={ (e) => sendEpaVault(e) } className='text-sm py-2 px-4 rounded shadow-md bg-orange-400 text-white hover:font-semibold hover:bg-red-700'>Send</button>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-200 pb-3" />

                <div className="flex justify-between rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                    <div className='ml-4'>
                        <p className='text-gray-400 pb-2'>Send EPA Cash</p>
                        <div className='flex items-center'>
                            <TbCurrencyPeso size={ 20 } color='red' />
                            <input type="number" disabled={ checked } value={ amount } onChange={(e) => { setAmount(e.target.value) }} className={ `${ checked ? 'bg-gray-300' : 'bg-gray-100' } border rounded w-full mr-4 ml-2 p-2 }`} placeholder='Enter amount to send' />
                        </div>
                        {/* <h1 className='pb-2'>Member Name</h1>
                        <FormControl sx={{ m: 0, minWidth: 150 }} size="small">
                            <Select
                                labelId="member-select-label"
                                id='member-select'
                                value={ member }
                                label="Member Name"
                                onChange={ (e) => setMember(e.target.value) }
                            >
                                { allUsers.map(item => (
                                    <MenuItem value={ item._id }>{ item.name }</MenuItem>
                                )) }
                            </Select>
                        </FormControl> */}
                        < br />
                        <div className='flex items-center ml-4'>
                            <input type="text" disabled={ checked || !amount } onChange={ (e) => setEwalletNum(e.target.value) } className={ `${ checked || !amount ? 'bg-gray-300' : 'bg-gray-100' } border rounded w-full mr-4 ml-2 p-2 }`} placeholder='Enter e-Wallet #' />
                            <button disabled={ checked || !amount } onClick={ (e) => sendEpaCash(e) } className={ `${ checked ? 'bg-gray-400' : 'bg-emerald-400' } text-sm py-2 px-4 rounded shadow-md text-white hover:font-semibold hover:bg-red-700 }`}>Send</button>
                        </div>
                        { recipient && !checked && (
                            <div className='ml-7 flex gap-2 mt-2 items-center text-sm font-semibold'>                  
                                <p>Recipient:</p>
                                <p className='text-orange-400'>{ recipient.name }</p>
                            </div>
                        ) }
                    </div>
                </div>

                <div className="bg-gray-200 pb-3" />

                <FormGroup>
                    <div className='px-6 flex flex-cols items-center justify-between'>
                        <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                            <p>I O U</p>
                            <FormControlLabel control={ <Switch checked={ checked } onChange={ toggleSwitch } inputProps={{ 'aria-label': 'controlled' }} /> } />
                        </div>
                        { iou && iou.length !== 0 && (
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <p className='text-red-500'>Received IOU</p>
                                <NavLink to='/receipts' state={ iou[0] }>
                                    <button className='text-sm py-1 px-4 rounded shadow-md bg-blue-400 text-white hover:font-semibold hover:bg-red-700'>Check</button>
                                </NavLink>
                            </div>
                        ) }
                    </div>
                </FormGroup>

                { checked &&
                    <div className="flex justify-between rounded-lg bg-white py-4 px-8 mt-2 mb-5">
                        <div className='ml-4 mt-2'>
                            <div className='flex items-center'>
                                <TbCurrencyPeso size={ 20 } color='red' />
                                <input type="number" value={ iouAmount } onChange={(e) => { setIouAmount(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-blue-100' placeholder='Enter IOU amount' />
                            </div>
                            < br />
                            <div className='flex items-center'>
                                <FaPercent size={ 12 } color='red' />
                                <div className='flex items-center ml-4'>
                                    <div className='-px-6 mb-1'>
                                        <FormControl sx={{ m: 0, minWidth: 80 }} size="small">
                                            <Select
                                                labelId="iou-interest-label"
                                                id='iou-interest-duration'
                                                value={ iouInterest }
                                                label="Interest"
                                                onChange={ (e) => setIouInterest(e.target.value) }
                                            >
                                                <MenuItem value={ 0 }>0 %</MenuItem>
                                                <MenuItem value={ 0.5 }>0.5 %</MenuItem>
                                                <MenuItem value={ 1 }>1 %</MenuItem>
                                                <MenuItem value={ 1.5 }>1.5 %</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                                <div className='px-2 text-gray-400'>Interest</div>
                            </div>
                            <br />
                            <div className='flex items-center ml-4'>
                                <input type="number" value={ iouTerms } onChange={(e) => { setIouTerms(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-blue-100' placeholder='Enter IOU terms' />
                                <div className='-px-6 mb-1'>
                                    <FormControl sx={{ m: 0, minWidth: 80 }} size="small">
                                        <Select
                                            labelId="iou-terms-label"
                                            id='iou-terms-duration'
                                            value={ iouDuration }
                                            label="Terms"
                                            onChange={ (e) => setIouDuration(e.target.value) }
                                        >
                                            <MenuItem value='week'>week</MenuItem>
                                            {/* <MenuItem value='month'>month</MenuItem>
                                            <MenuItem value='year'>year</MenuItem> */}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <br />
                            <div className='flex items-center ml-4'>
                                <input type="text" disabled={ !iouAmount } onChange={(e) => { setIouEwallet(e.target.value) }} className={ `${ !iouAmount ? 'bg-gray-100' : 'bg-blue-100' } border rounded w-full mr-4 ml-2 p-2` } placeholder='Enter e-Wallet #' />
                                <button disabled={ !iouAmount } onClick={ (e) => submitIOU(e) } className='text-sm py-2 px-4 rounded shadow-md bg-blue-400 text-white hover:font-semibold hover:bg-red-700'>Send</button>
                            </div>
                            { recipientIOU && (
                                <div className='ml-7 flex gap-2 mt-2 items-center text-sm font-semibold'>                  
                                    <p>Recipient:</p>
                                    <p className='text-orange-400'>{ recipientIOU.name }</p>
                                </div>
                            ) }
                        </div>
                    </div>
                }

                <hr />

                { currentUser._id === process.env.EPA_ACCT_ID &&
                    <div className='flex flex-cols justify-between items-center text-center px-4 mt-10 mb-4'>
                        <TbCurrencyPeso size={ 30 } color='red' />
                        <input type="number" onChange={(e) => { setGenerate(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-blue-100' placeholder='Generate EPA Cash' />
                        <button disabled={ !generate } onClick={ (e) => generateEpaCash(e) } className="justify-center bg-blue-400 text-white mr-4 font-semibold py-2 px-4 rounded shadow-md hover:bg-red-700">
                            Generate
                        </button>
                    </div>
                }

                <div className='text-center mt-10 mb-6'>
                    <button onClick={ ledgerExportPDF } className="border-2 border-red-400 text-red-400 font-semibold py-2 px-4 rounded shadow-md hover:bg-red-700">
                        Download PDF (EPA Cash Ledger)
                    </button>
                    {/* <button onClick={ ledgerExportXLS } className="mt-2 border-2 border-emerald-400 text-emerald-400 font-semibold py-2 px-4 rounded shadow-md hover:bg-red-700">
                        Download XLS (EPA Cash Ledger)
                    </button> */}
                </div>

                { user.id === process.env.EPA_ACCT_ID && currentUser.role === 'admin' &&
                    <div>
                        <div className="bg-gray-200 pb-3" />
                    
                        <div className='text-center mt-4 mb-4'>
                            <button onClick={ epaLedgerExportPDF } className="mt-4 border-2 border-orange-400 bg-fuchsia-400 text-white font-semibold py-2 px-4 rounded shadow-md hover:bg-red-700">
                                Download PDF (All Generated EPA Cash)
                            </button>
                            {/* <button onClick={ allLedgerExportXLS } className="mt-2 mb-4 bg-emerald-400 text-white font-semibold py-2 px-4 rounded shadow-md hover:bg-red-700">
                                Download XLS (All EPA Cash Transactions)
                            </button> */}
                            <button onClick={ allLedgerExportPDF } className="mt-4 border-2 border-orange-400 bg-rose-400 text-white font-semibold py-2 px-4 rounded shadow-md hover:bg-red-700">
                                Download PDF (All EPA Cash Transactions)
                            </button>
                        </div>
                    </div>
                }

                {/* { topUp ? 
                    <div>
                        <div className='ml-4 mt-5'>
                            <p className='text-gray-400 pb-2'>Top-Up Amount:</p>
                            <div className='flex items-center'>
                                <TbCurrencyPeso size={20} color='red' />
                                <input type="number" value={ amount } onChange={(e) => { setAmount(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder='Please enter the top-up amount' />
                            </div>
                        </div>

                        { currentPayMode !== '' && !currentPayMode ? 
                            <div className='ml-4 mt-2'>
                                <p className='text-gray-400 pb-2'>Screenshot:</p>
                                <div className='flex items-center'>
                                    <input
                                        type="file"
                                        className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100'
                                        placeholder='Please upload the transaction screenshot'
                                        accept='image/jpeg, image/jpg, image/png'
                                        required onChange={ (e) => { setFile(e.target.files[0]), setFileExist(true) } }
                                    />
                                </div>
                            </div>
                            : 
                            '' 
                        }
                    </div>
                    : 
                    ''
                }

                { withdraw ? 
                    <div className='ml-4 mt-5'>
                        <p className='text-gray-400 pb-2'>Withdraw Amount:</p>
                        <div className='flex items-center'>
                            <TbCurrencyPeso size={20} color='red' />
                            <input type="number" value={ amount } onChange={(e) => { setAmount(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder='Please enter the top-up amount' />
                        </div>
                    </div>
                    : 
                    '' 
                }

                { topUp || withdraw ? 
                    <div>
                        <div className='ml-4 mt-6'>
                            <p className='text-gray-400'>Select payment channel:</p>
                            <div className='p-6 flex items-center justify-between px-35'>
                                <RadioGroup name="use-radio-group" defaultValue="gcash">
                                    <div className='p-3 grid grid-cols-2 gap-10 items-center justify-between mr-10'>
                                        <div className='grid grid-cols-2 items-center justify-between'>
                                            <img className='rounded-full w-5/12' src={gcash} alt="Gcash Icon" /><p className='text-lg font-semibold'>GCash</p>
                                        </div>
                                        <FormControlLabel control={<Radio value="gcash" onChange={(e) => setPayment(e.target.value)} style={{color: "#51BB5E"}} />} />
                                    </div>
                                    <div className='p-3 grid grid-cols-2 gap-10 items-center justify-between mr-10'>
                                        <div className='grid grid-cols-2 items-center justify-between'>
                                            <img className='rounded-full w-5/12' src={maya} alt="Maya Icon" /><p className='text-lg font-semibold'>Maya</p>
                                        </div>
                                        <FormControlLabel control={<Radio value="maya" onChange={(e) => setPayment(e.target.value)} style={{color: "#51BB5E"}} />} />
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <div className='ml-7 -mt-8'>
                            <div className='p-6 flex items-center justify-between px-35'>
                                <div className='grid grid-cols-2 items-center justify-between px-35'>
                                    <p className={ `${ channel === 'gcash' ? 'text-blue-600' : 'text-emerald-600'} mt-4 font-semibold` }>{ channel === 'gcash' ? 'GCash' : 'Maya' } Account Number:</p>
                                    <p className='mt-4 ml-9 font-semibold text-red-600'>{ epaAccount.mobilenum }</p>
                                    <p className={ `${ channel === 'gcash' ? 'text-blue-600' : 'text-emerald-600'} mt-4 font-semibold` }>{ channel === 'gcash' ? 'GCash' : 'Maya' } Account Name:</p>
                                    <p className='mt-4 ml-9 font-semibold text-red-600'>{ epaAccount.name }</p>
                                </div>
                            </div>
                        </div>

                        <div className='m-2'>
                            { currentPayMode !== '' && !currentPayMode ? 
                                <button onClick={ topUp ? (e) => submitTopUp(e) : (e) => submitWithdraw(e) } disabled={ !amount || topUp && !fileExist } className={`${ !amount || topUp && !fileExist ? 'bg-gray-400' : 'bg-blue-400' } hover:bg-orange-400 mt-3 rounded w-full text-center` }>
                                    <p className='text-white text-lg font-semibold'>Submit</p>
                                </button>
                                : 
                                <button onClick={ topUp ? (e) => submitTopUp(e) : (e) => submitWithdraw(e) } disabled={ !amount } className={`${ !amount ? 'bg-gray-400' : 'bg-blue-400' } hover:bg-orange-400 mt-3 rounded w-full text-center` }>
                                    <p className='text-white text-lg font-semibold'>Submit</p>
                                </button>
                            }
                        </div>
                    </div>
                    : '' 
                } */}
            </div>

            {/* { currentPayMode !== '' && !currentPayMode && topUp ? 
                <div className='text-sm mt-4 p-4 bg-gray-100'>
                    <p className='mb-2 font-bold text-green-600'>Top-Up Instructions:</p>
                    <p className='mt-4 font-semibold text-gray-500'>1. Choose between GCash or Maya to make a Top-Up.</p>
                    <p className='mt-4 font-semibold text-gray-500'>2. Enter the Top-Up Amount.</p>
                    <p className='mt-4 font-semibold text-red-500'>Note: The transferred amount must be exactly the same as the submitted amount.</p>       
                    <p className='mt-4 font-semibold text-gray-500'>3. To proceed for payment, click "NEXT" to get the GCash or Maya EPA account receiving account number.</p>
                    <p className='mt-4 font-semibold text-gray-500'>4. After the transfer is successful, please attach the screenshot and wait for your Top-Up to get credited to your account.</p>
                </div>
                : 
                '' 
            }

            { currentPayMode !== '' && !currentPayMode && withdraw ? 
                    <div className='text-sm mt-4 p-4 bg-gray-100'>
                <p className='mb-2 font-bold text-green-600'>Withdrawal Instructions:</p>
                    <p className='mt-4 font-semibold text-gray-500'>1. Choose between GCash or Maya to make a Withdraw.</p>
                    <p className='mt-4 font-semibold text-gray-500'>2. The withdrawal amount needs to be at least 100 pesos ? before you can apply for a withdrawal.</p>
                    <p className='mt-4 font-semibold text-gray-500'>. There is a processing fee of 5% ? for every withrawal made.</p>
                </div>
                : 
                '' 
            } */}

            <div className='mb-10'/>

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

export default EpaCash
