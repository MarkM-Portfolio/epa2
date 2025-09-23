import Cookies from 'universal-cookie'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Switch, FormGroup, FormControlLabel, FormControl, Select, MenuItem } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Settings = () => {

    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ isVoucherChecked, setIsVoucherChecked ] = useState(false)
    const [ isPayChecked, setIsPayChecked ] = useState(false)
    const [ isCreateEpaChecked, setIsCreateEpaChecked ] = useState(false)
    const [ highToken, setHighToken ] = useState('')
    const [ lowToken, setLowToken ] = useState('')
    const [ monthlyVaultInterest, setMonthlyVaultInterest ] = useState('')
    const [ base, setBase ] = useState('')
    const [ lvlBonus, setLvlBonus ] = useState('')
    const [ passive, setPassive ] = useState('')
    const [ bonusForMerchants, setBonusForMerchants ] = useState('')
    const [ rewardsJBA, setRewardsJBA ] = useState('')
    const [ allowanceJBA, setAllowanceJBA ] = useState('')
    const [ employedJBA, setEmployedJBA ] = useState('')
    const [ maxEmployedJBA, setMaxEmployedJBA ] = useState('')
    const [ selfEmployedJBA, setSelfEmployedJBA ] = useState('')
    const [ maxSelfEmployedJBA, setMaxSelfEmployedJBA ] = useState('')
    const [ pensionJBA, setPensionJBA ] = useState('')
    const [ maxPensionJBA, setMaxPensionJBA ] = useState('')
    const [ dependentsJBA, setDependentsJBA ] = useState('')
    const [ entrepSolopreneurJBA, setEntrepSolopreneurJBA ] = useState('')
    const [ entrepSolopreneurFee, setEntrepSolopreneurFee ] = useState('')
    const [ entrepApprenticeJBA, setEntrepApprenticeJBA ] = useState('')
    const [ entrepApprenticeFee, setEntrepApprenticeFee ] = useState('')
    const [ entrepTeamLeaderJBA, setEntrepTeamLeaderJBA ] = useState('')
    const [ entrepTeamLeaderFee, setEntrepTeamLeaderFee ] = useState('')
    const [ entrepEntrepJBA, setEntrepEntrepJBA ] = useState('')
    const [ entrepEntrepFee, setEntrepEntrepFee ] = useState('')
    const [ supervSupervisorJBA, setSupervSupervisorJBA ] = useState('')
    const [ supervSupervisorFee, setSupervSupervisorFee ] = useState('')
    const [ managerManagerJBA, setManagerManagerJBA ] = useState('')
    const [ managerManagerFee, setManagerManagerFee ] = useState('')
    const [ ceoApprenticeJBA, setCeoApprenticeJBA ] = useState('')
    const [ ceoApprenticeFee, setCeoApprenticeFee ] = useState('')
    const [ ceoCeoJBA, setCeoCeoJBA ] = useState('')
    const [ ceoCeoFee, setCeoCeoFee ] = useState('')
    const [ businessEmpireJBA, setBusinessEmpireJBA ] = useState('')
    const [ businessEmpireFee, setBusinessEmpireFee ] = useState('')
    const [ silverEntrepreneurJBA, setSilverEntrepreneurJBA ] = useState('')
    const [ silverEntrepreneurFee, setSilverEntrepreneurFee ] = useState('')
    const [ silverSupervisorJBA, setSilverSupervisorJBA ] = useState('')
    const [ silverSupervisorFee, setSilverSupervisorFee ] = useState('')
    const [ silverManagerJBA, setSilverManagerJBA ] = useState('')
    const [ silverManagerFee, setSilverManagerFee ] = useState('')
    const [ silverCeoJBA, setSilverCeoJBA ] = useState('')
    const [ silverCeoFee, setSilverCeoFee ] = useState('')
    const [ silverBusinessJBA, setSilverBusinessJBA ] = useState('')
    const [ silverBusinessFee, setSilverBusinessFee ] = useState('')
    const [ goldEntrepreneurJBA, setGoldEntrepreneurJBA ] = useState('')
    const [ goldEntrepreneurFee, setGoldEntrepreneurFee ] = useState('')
    const [ goldSupervisorJBA, setGoldSupervisorJBA ] = useState('')
    const [ goldSupervisorFee, setGoldSupervisorFee ] = useState('')
    const [ goldManagerJBA, setGoldManagerJBA ] = useState('')
    const [ goldManagerFee, setGoldManagerFee ] = useState('')
    const [ goldCeoJBA, setGoldCeoJBA ] = useState('')
    const [ goldCeoFee, setGoldCeoFee ] = useState('')
    const [ goldBusinessJBA, setGoldBusinessJBA ] = useState('')
    const [ goldBusinessFee, setGoldBusinessFee ] = useState('')
    const [ entrepPercentCash, setEntrepPercentCash ] = useState('')
    const [ supervPercentCash, setSupervPercentCash ] = useState('')
    const [ managerPercentCash, setManagerPercentCash ] = useState('')
    const [ ceoPercentCash, setCeoPercentCash ] = useState('')
    const [ businessPercentCash, setBusinessPercentCash ] = useState('')
    const [ silverPercentCash, setSilverPercentCash ] = useState('')
    const [ goldPercentCash, setGoldPercentCash ] = useState('')

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

        if (user && user.id) {
            axios.get(`/api/setting`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setIsVoucherChecked(res.data.settings.showVoucher)
                setIsPayChecked(res.data.settings.isAutoPay)
                setIsCreateEpaChecked(res.data.settings.isAutoCreateEpa)
                setHighToken(res.data.settings.highToken * 100)
                setLowToken(res.data.settings.lowToken * 100)
                setMonthlyVaultInterest(res.data.settings.monthlyVaultInterest * 100)
                setBase(res.data.settings.base)
                setLvlBonus(res.data.settings.lvlBonus)
                setPassive(res.data.settings.passive)
                setBonusForMerchants(res.data.settings.bonusForMerchants * 100)
                setRewardsJBA(res.data.settings.rewardsJBA)
                setAllowanceJBA(res.data.settings.allowanceJBA)
                setEmployedJBA(res.data.settings.employedJBA)
                setMaxEmployedJBA(res.data.settings.maxEmployedJBA)
                setSelfEmployedJBA(res.data.settings.selfEmployedJBA)
                setMaxSelfEmployedJBA(res.data.settings.maxSelfEmployedJBA)
                setPensionJBA(res.data.settings.pensionJBA)
                setMaxPensionJBA(res.data.settings.maxPensionJBA)
                setDependentsJBA(res.data.settings.dependentsJBA)
                setEntrepSolopreneurJBA(res.data.settings.entrepSolopreneurJBA)
                setEntrepSolopreneurFee(res.data.settings.entrepSolopreneurFee)
                setEntrepApprenticeJBA(res.data.settings.entrepApprenticeJBA)
                setEntrepApprenticeFee(res.data.settings.entrepApprenticeFee)
                setEntrepTeamLeaderJBA(res.data.settings.entrepTeamLeaderJBA)
                setEntrepTeamLeaderFee(res.data.settings.entrepTeamLeaderFee)
                setEntrepEntrepJBA(res.data.settings.entrepEntrepJBA)
                setEntrepEntrepFee(res.data.settings.entrepEntrepFee)
                setSupervSupervisorJBA(res.data.settings.supervSupervisorJBA)
                setSupervSupervisorFee(res.data.settings.supervSupervisorFee)
                setManagerManagerJBA(res.data.settings.managerManagerJBA)
                setManagerManagerFee(res.data.settings.managerManagerFee)
                setCeoApprenticeJBA(res.data.settings.ceoApprenticeJBA)
                setCeoApprenticeFee(res.data.settings.ceoApprenticeFee)
                setCeoCeoJBA(res.data.settings.ceoCeoJBA)
                setCeoCeoFee(res.data.settings.ceoCeoFee)
                setBusinessEmpireJBA(res.data.settings.businessEmpireJBA)
                setBusinessEmpireFee(res.data.settings.businessEmpireFee)
                setSilverEntrepreneurJBA(res.data.settings.silverEntrepreneurJBA)
                setSilverEntrepreneurFee(res.data.settings.silverEntrepreneurFee)
                setSilverSupervisorJBA(res.data.settings.silverSupervisorJBA)
                setSilverSupervisorFee(res.data.settings.silverSupervisorFee)
                setSilverManagerJBA(res.data.settings.silverManagerJBA)
                setSilverManagerFee(res.data.settings.silverManagerFee)
                setSilverCeoJBA(res.data.settings.silverCeoJBA)
                setSilverCeoFee(res.data.settings.silverCeoFee)
                setSilverBusinessJBA(res.data.settings.silverBusinessJBA)
                setSilverBusinessFee(res.data.settings.silverBusinessFee)
                setGoldEntrepreneurJBA(res.data.settings.goldEntrepreneurJBA)
                setGoldEntrepreneurFee(res.data.settings.goldEntrepreneurFee)
                setGoldSupervisorJBA(res.data.settings.goldSupervisorJBA)
                setGoldSupervisorFee(res.data.settings.goldSupervisorFee)
                setGoldManagerJBA(res.data.settings.goldManagerJBA)
                setGoldManagerFee(res.data.settings.goldManagerFee)
                setGoldCeoJBA(res.data.settings.goldCeoJBA)
                setGoldCeoFee(res.data.settings.goldCeoFee)
                setGoldBusinessJBA(res.data.settings.goldBusinessJBA)
                setGoldBusinessFee(res.data.settings.goldBusinessFee)
                setEntrepPercentCash(res.data.settings.entrepPercentCash * 100)
                setSupervPercentCash(res.data.settings.supervPercentCash * 100)
                setManagerPercentCash(res.data.settings.managerPercentCash * 100)
                setCeoPercentCash(res.data.settings.ceoPercentCash * 100)
                setBusinessPercentCash(res.data.settings.businessPercentCash * 100)
                setSilverPercentCash(res.data.settings.silverPercentCash * 100)
                setGoldPercentCash(res.data.settings.goldPercentCash * 100)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user ])

    const toggleVoucher = async (e) => {
        setIsVoucherChecked(e.target.checked)

        const mode = !isVoucherChecked

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/setting/showvoucher/${ user.id }`, { 'mode': mode }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.settings)
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

    const togglePayment = async (e) => {
        setIsPayChecked(e.target.checked)

        const mode = !isPayChecked

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/setting/paymentmode/${ user.id }`, { 'mode': mode }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.settings)
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

    // const toggleEpaCreate = async (e) => {
    //     setIsCreateEpaChecked(e.target.checked)

    //     const mode = !isCreateEpaChecked

    //     const CancelToken = axios.CancelToken
    //     const source = CancelToken.source()

    //     await axios.put(`/api/setting/createepamode/${ user.id }`, { 'mode': mode }, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json',
    //             'X-Api-Key': process.env.API_KEY
    //         },
    //         data: { cancelToken: source.token }
    //     }).then(res => {
    //         console.log('Success OK: ', res.status)
    //         toast.info(res.data.settings)
    //         return res
    //     }).catch((err) => {
    //         if (axios.isCancel(err)) {
    //             console.log('Successfully Aborted')
    //             toast.error(err.response.data.error)
    //         } else if (err.response.status === 422) { // response >> validation errors
    //             console.log('Validation Error: ', err.response.status)
    //             toast.error(err.response.data.error)
    //         } else if (err.response.status === 403) { // response >> headers forbidden
    //             console.log('Forbidden: ', err.response.status)
    //             toast.error(err.response.data.error)
    //         } else { // response >> server/page not found 404,500
    //             console.log('Server Error: ', err.response.status)
    //             toast.error(err.response.data.error)
    //         }
    //         return err
    //     })
    // }

    const updateToken = async (e) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/setting/set-tokens/${ user.id }`, { lowToken: lowToken, highToken: highToken }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.settings)
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

    const updateQuota = async (e) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/setting/set-quota/${ user.id }`, { base: base, lvlBonus: lvlBonus, passive: passive }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.settings)
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

    const updateJBA = async (e) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/setting/set-jba/${ user.id }`, { rewardsJBA: rewardsJBA, allowanceJBA: allowanceJBA, employedJBA: employedJBA, maxEmployedJBA: maxEmployedJBA, selfEmployedJBA: selfEmployedJBA, maxSelfEmployedJBA: maxSelfEmployedJBA, pensionJBA: pensionJBA, maxPensionJBA: maxPensionJBA, dependentsJBA: dependentsJBA }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.settings)
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

    const updatePercentCash = async (e) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/setting/set-percentcash/${ user.id }`, { entrepPercentCash: entrepPercentCash, supervPercentCash: supervPercentCash, managerPercentCash: managerPercentCash, ceoPercentCash: ceoPercentCash, businessPercentCash: businessPercentCash, silverPercentCash: silverPercentCash, goldPercentCash: goldPercentCash }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.settings)
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

    const updatePkgJBA = async (e) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/setting/set-pkgjba/${ user.id }`, {
            entrepSolopreneurJBA: entrepSolopreneurJBA,
            entrepApprenticeJBA: entrepApprenticeJBA,
            entrepTeamLeaderJBA: entrepTeamLeaderJBA,
            entrepEntrepJBA: entrepEntrepJBA,
            supervSupervisorJBA: supervSupervisorJBA,
            managerManagerJBA: managerManagerJBA,
            ceoApprenticeJBA: ceoApprenticeJBA,
            ceoCeoJBA: ceoCeoJBA,
            businessEmpireJBA: businessEmpireJBA,
            silverEntrepreneurJBA: silverEntrepreneurJBA,
            silverSupervisorJBA: silverSupervisorJBA,
            silverManagerJBA: silverManagerJBA,
            silverCeoJBA: silverCeoJBA,
            silverBusinessJBA: silverBusinessJBA,
            goldEntrepreneurJBA: goldEntrepreneurJBA,
            goldSupervisorJBA: goldSupervisorJBA,
            goldManagerJBA: goldManagerJBA,
            goldCeoJBA: goldCeoJBA,
            goldBusinessJBA: goldBusinessJBA 
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.settings)
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

    const updatePkgFee = async (e) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/setting/set-pkgfee/${ user.id }`, {
            entrepSolopreneurFee: entrepSolopreneurFee,
            entrepApprenticeFee: entrepApprenticeFee,
            entrepTeamLeaderFee: entrepTeamLeaderFee,
            entrepEntrepFee: entrepEntrepFee,
            supervSupervisorFee: supervSupervisorFee,
            managerManagerFee: managerManagerFee,
            ceoApprenticeFee: ceoApprenticeFee,
            ceoCeoFee: ceoCeoFee,
            businessEmpireFee: businessEmpireFee,
            silverEntrepreneurFee: silverEntrepreneurFee,
            silverSupervisorFee: silverSupervisorFee,
            silverManagerFee: silverManagerFee,
            silverCeoFee: silverCeoFee,
            silverBusinessFee: silverBusinessFee,
            goldEntrepreneurFee: goldEntrepreneurFee,
            goldSupervisorFee: goldSupervisorFee,
            goldManagerFee: goldManagerFee,
            goldCeoFee: goldCeoFee,
            goldBusinessFee: goldBusinessFee
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.settings)
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

    return (
        <>
            <div>
                <h1 className="uppercase font-bold text-sm">Settings</h1>
                { currentUser && currentUser.role === 'admin' ? 
                    <div>
                        <div className="flex justify-between rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <FormGroup>
                                <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                    <div>Show Voucher :<p className={ isVoucherChecked ? 'text-orange-500' : 'text-gray-400' }>{ isVoucherChecked ? 'SHOW' : 'HIDE' }</p></div>
                                    <FormControlLabel control={ <Switch checked={ isVoucherChecked } onChange={ toggleVoucher } inputProps={{ 'aria-label': 'controlled' }} /> } />
                                </div>
                            </FormGroup>
                        </div> 
                        <div className="flex justify-between rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <FormGroup>
                                <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                    <div>Payment Mode :<p className={ isPayChecked ? 'text-orange-500' : 'text-gray-400' }>{ isPayChecked ? 'AUTO' : 'MANUAL' }</p></div>
                                    <FormControlLabel control={ <Switch checked={ isPayChecked } onChange={ togglePayment } inputProps={{ 'aria-label': 'controlled' }} /> } />
                                </div>
                            </FormGroup>
                        </div> 
                        {/* <div className="flex justify-between rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <FormGroup>
                                <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                    <div>EPA Create Account Mode :<p className={ isCreateEpaChecked ? 'text-orange-500' : 'text-gray-400' }>{ isCreateEpaChecked ? 'AUTO' : 'MANUAL' }</p></div>
                                    <FormControlLabel control={ <Switch checked={ isCreateEpaChecked } onChange={ toggleEpaCreate } inputProps={{ 'aria-label': 'controlled' }} /> } />
                                </div>
                            </FormGroup>
                        </div>  */}
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>High Token</div>
                                <input type="number" onChange={(e) => { setHighToken(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ highToken }%` } />
                                <div>Low Token</div>
                                <input type="number" onChange={(e) => { setLowToken(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ lowToken }%` } />
                                <div>Monthly EPA Vault Interest</div>
                                <input type="number" onChange={(e) => { setMonthlyVaultInterest(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ monthlyVaultInterest }%` } />
                            </div>
                            <button onClick={ (e) => updateToken(e) } className='text-sm px-4 rounded bg-orange-400 text-white hover:font-semibold hover:bg-red-700'>Set Token</button>
                        </div> 
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Base</div>
                                <input type="number" onChange={(e) => { setBase(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ base.$numberDecimal }` } />
                                <div>Level Bonus</div>
                                <input type="number" onChange={(e) => { setLvlBonus(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ lvlBonus.$numberDecimal }` } />
                                <div>Passive</div>
                                <input type="number" onChange={(e) => { setPassive(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ passive.$numberDecimal }` } />
                                <div>Bonus For Merchants</div>
                                <input type="number" onChange={(e) => { setBonusForMerchants(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ bonusForMerchants }%` } />
                            </div>
                            <button onClick={ (e) => updateQuota(e) } className='text-sm px-4 rounded bg-emerald-400 text-white hover:font-semibold hover:bg-red-700'>Set Quota</button>
                        </div> 
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Rewards JBA</div>
                                <input type="number" onChange={(e) => { setRewardsJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ rewardsJBA }` } />
                                <div>Allowance JBA</div>
                                <input type="number" onChange={(e) => { setAllowanceJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ allowanceJBA }` } />
                                <div>Employed JBA</div>
                                <input type="number" onChange={(e) => { setEmployedJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ employedJBA }` } />
                                <div>Self-Employed JBA</div>
                                <input type="number" onChange={(e) => { setSelfEmployedJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ selfEmployedJBA }` } />
                                <div>Pension JBA</div>
                                <input type="number" onChange={(e) => { setPensionJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ pensionJBA }` } />
                                <div>Dependents JBA</div>
                                <input type="number" onChange={(e) => { setDependentsJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ dependentsJBA }` } />
                            </div>
                            <button onClick={ (e) => updateJBA(e) } className='text-sm px-4 rounded bg-blue-400 text-white hover:font-semibold hover:bg-red-700'>Set JBA</button>
                        </div> 
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Max Employed JBA</div>
                                <input type="number" onChange={(e) => { setMaxEmployedJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ maxEmployedJBA }` } />
                                <div>Max Self-Employed JBA</div>
                                <input type="number" onChange={(e) => { setMaxSelfEmployedJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ maxSelfEmployedJBA }` } />
                                <div>Max Pension JBA</div>
                                <input type="number" onChange={(e) => { setMaxPensionJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ maxPensionJBA }` } />
                            </div>
                            <button onClick={ (e) => updateJBA(e) } className='text-sm px-4 rounded bg-blue-400 text-white hover:font-semibold hover:bg-red-700'>Set JBA</button>
                        </div> 
                        <h1 className="font-bold text-sm text-purple-400">% Percentage Cash</h1>
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Entrepreneur</div>
                                <input type="number" onChange={(e) => { setEntrepPercentCash(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ entrepPercentCash }%` } />
                                <div>Supervisor</div>
                                <input type="number" onChange={(e) => { setSupervPercentCash(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ supervPercentCash }%` } />
                                <div>Manager</div>
                                <input type="number" onChange={(e) => { setManagerPercentCash(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ managerPercentCash }%` } />
                                <div>CEO</div>
                                <input type="number" onChange={(e) => { setCeoPercentCash(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ ceoPercentCash }%` } />
                                <div>Business Empire</div>
                                <input type="number" onChange={(e) => { setBusinessPercentCash(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ businessPercentCash }%` } />
                                <div>Silver</div>
                                <input type="number" onChange={(e) => { setSilverPercentCash(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ silverPercentCash }%` } />
                                <div>Gold</div>
                                <input type="number" onChange={(e) => { setGoldPercentCash(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ goldPercentCash }%` } />
                            </div>
                            <button onClick={ (e) => updatePercentCash(e) } className='text-sm px-4 rounded bg-purple-400 text-white hover:font-semibold hover:bg-red-700'>Set % Cash</button>
                        </div> 
                        <h1 className="font-bold text-sm text-amber-400">Package JBA</h1>
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Solopreneur</div>
                                <input type="number" onChange={(e) => { setEntrepSolopreneurJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ entrepSolopreneurJBA }` } />
                                <div>Entrepreneur Apprentice</div>
                                <input type="number" onChange={(e) => { setEntrepApprenticeJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ entrepApprenticeJBA }` } />
                                <div>Team Leader</div>
                                <input type="number" onChange={(e) => { setEntrepTeamLeaderJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ entrepTeamLeaderJBA }` } />
                                <div>Entrepreneur</div>
                                <input type="number" onChange={(e) => { setEntrepEntrepJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ entrepEntrepJBA }` } />
                            </div>
                            <button onClick={ (e) => updatePkgJBA(e) } className='text-sm px-4 rounded bg-amber-400 text-white hover:font-semibold hover:bg-red-700'>Set Package JBA</button>
                        </div> 
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Supervisor</div>
                                <input type="number" onChange={(e) => { setSupervSupervisorJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ supervSupervisorJBA }` } />
                                <div>Manager</div>
                                <input type="number" onChange={(e) => { setManagerManagerJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ managerManagerJBA }` } />
                                <div>CEO Apprentice</div>
                                <input type="number" onChange={(e) => { setCeoApprenticeJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ ceoApprenticeJBA }` } />
                                <div>CEO</div>
                                <input type="number" onChange={(e) => { setCeoCeoJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ ceoCeoJBA }` } />
                                <div>Business Empire</div>
                                <input type="number" onChange={(e) => { setBusinessEmpireJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ businessEmpireJBA }` } />
                            </div>
                            <button onClick={ (e) => updatePkgJBA(e) } className='text-sm px-4 rounded bg-amber-400 text-white hover:font-semibold hover:bg-red-700'>Set Package JBA</button>
                        </div> 
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Silver Entrepreneur</div>
                                <input type="number" onChange={(e) => { setSilverEntrepreneurJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ silverEntrepreneurJBA }` } />
                                <div>Silver Supervisor</div>
                                <input type="number" onChange={(e) => { setSilverSupervisorJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ silverSupervisorJBA }` } />
                                <div>Silver Manager</div>
                                <input type="number" onChange={(e) => { setSilverManagerJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ silverManagerJBA }` } />
                                <div>Silver CEO</div>
                                <input type="number" onChange={(e) => { setSilverCeoJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ silverCeoJBA }` } />
                                <div>Silver Business Empire</div>
                                <input type="number" onChange={(e) => { setSilverBusinessJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ silverBusinessJBA }` } />
                            </div>
                            <button onClick={ (e) => updatePkgJBA(e) } className='text-sm px-4 rounded bg-amber-400 text-white hover:font-semibold hover:bg-red-700'>Set Package JBA</button>
                        </div> 
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Gold Entrepreneur</div>
                                <input type="number" onChange={(e) => { setGoldEntrepreneurJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ goldEntrepreneurJBA }` } />
                                <div>Gold Supervisor</div>
                                <input type="number" onChange={(e) => { setGoldSupervisorJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ goldSupervisorJBA }` } />
                                <div>Gold Manager</div>
                                <input type="number" onChange={(e) => { setGoldManagerJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ goldManagerJBA }` } />
                                <div>Gold CEO</div>
                                <input type="number" onChange={(e) => { setGoldCeoJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ goldCeoJBA }` } />
                                <div>Gold Business Empire</div>
                                <input type="number" onChange={(e) => { setGoldBusinessJBA(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ goldBusinessJBA }` } />
                            </div>
                            <button onClick={ (e) => updatePkgJBA(e) } className='text-sm px-4 rounded bg-amber-400 text-white hover:font-semibold hover:bg-red-700'>Set Package JBA</button>
                        </div> 
                        <h1 className="font-bold text-sm text-rose-400">Package Fee</h1>
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Solopreneur</div>
                                <input type="number" onChange={(e) => { setEntrepSolopreneurFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ entrepSolopreneurFee } PHP` } />
                                <div>Entrepreneur Apprentice</div>
                                <input type="number" onChange={(e) => { setEntrepApprenticeFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ entrepApprenticeFee } PHP` } />
                                <div>Team Leader</div>
                                <input type="number" onChange={(e) => { setEntrepTeamLeaderFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ entrepTeamLeaderFee } PHP` } />
                                <div>Entrepreneur</div>
                                <input type="number" onChange={(e) => { setEntrepEntrepFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ entrepEntrepFee } PHP` } />
                            </div>
                            <button onClick={ (e) => updatePkgFee(e) } className='text-sm px-4 rounded bg-rose-400 text-white hover:font-semibold hover:bg-red-700'>Set Package Fee</button>
                        </div> 
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Supervisor</div>
                                <input type="number" onChange={(e) => { setSupervSupervisorFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ supervSupervisorFee } PHP` } />
                                <div>Manager</div>
                                <input type="number" onChange={(e) => { setManagerManagerFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ managerManagerFee } PHP` } />
                                <div>CEO Apprentice</div>
                                <input type="number" onChange={(e) => { setCeoApprenticeFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ ceoApprenticeFee } PHP` } />
                                <div>CEO</div>
                                <input type="number" onChange={(e) => { setCeoCeoFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ ceoCeoFee } PHP` } />
                                <div>Business Empire</div>
                                <input type="number" onChange={(e) => { setBusinessEmpireFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ businessEmpireFee } PHP` } />
                            </div>
                            <button onClick={ (e) => updatePkgFee(e) } className='text-sm px-4 rounded bg-rose-400 text-white hover:font-semibold hover:bg-red-700'>Set Package Fee</button>
                        </div> 
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Silver Entrepreneur</div>
                                <input type="number" onChange={(e) => { setSilverEntrepreneurFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ silverEntrepreneurFee } PHP` } />
                                <div>Silver Supervisor</div>
                                <input type="number" onChange={(e) => { setSilverSupervisorFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ silverSupervisorFee } PHP` } />
                                <div>Silver Manager</div>
                                <input type="number" onChange={(e) => { setSilverManagerFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ silverManagerFee } PHP` } />
                                <div>Silver CEO</div>
                                <input type="number" onChange={(e) => { setSilverCeoFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ silverCeoFee } PHP` } />
                                <div>Silver Business Empire</div>
                                <input type="number" onChange={(e) => { setSilverBusinessFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ silverBusinessFee } PHP` } />
                            </div>
                            <button onClick={ (e) => updatePkgFee(e) } className='text-sm px-4 rounded bg-rose-400 text-white hover:font-semibold hover:bg-red-700'>Set Package Fee</button>
                        </div> 
                        <div className="flex justify-start rounded-lg bg-white py-4 px-8 mt-3 mb-5">
                            <div className='ml-2 flex gap-4 mt-2 items-center font-semibold'>
                                <div>Gold Entrepreneur</div>
                                <input type="number" onChange={(e) => { setGoldEntrepreneurFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ goldEntrepreneurFee } PHP` } />
                                <div>Gold Supervisor</div>
                                <input type="number" onChange={(e) => { setGoldSupervisorFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ goldSupervisorFee } PHP` } />
                                <div>Gold Manager</div>
                                <input type="number" onChange={(e) => { setGoldManagerFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ goldManagerFee } PHP` } />
                                <div>Gold CEO</div>
                                <input type="number" onChange={(e) => { setGoldCeoFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ goldCeoFee } PHP` } />
                                <div>Gold Business Empire</div>
                                <input type="number" onChange={(e) => { setGoldBusinessFee(e.target.value) }} className='border rounded w-full mr-4 ml-2 p-2 bg-gray-100' placeholder={ `${ goldBusinessFee } PHP` } />
                            </div>
                            <button onClick={ (e) => updatePkgFee(e) } className='text-sm px-4 rounded bg-rose-400 text-white hover:font-semibold hover:bg-red-700'>Set Package Fee</button>
                        </div> 
                    </div>
                    : 
                    ''
                }
            </div>

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

export default Settings
