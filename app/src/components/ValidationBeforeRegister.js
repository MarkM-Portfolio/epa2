import React, { useState } from 'react'
import Cookies from 'universal-cookie'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
// import epa_logo from '../assets/logo.png'
import { ToastContainer, toast } from 'react-toastify'

const ValidationBeforeRegister = () => {
    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ believeInGod, setBelieveInGod ] = useState('')
    const [ religion, setReligion ] = useState('')
    const [ honestAndTrustworthy, setHonestAndTrustworthy ] = useState('')
    const [ helpOthers, setHelpOthers ] = useState('')
    const [ respectGod, setRespectGod ] = useState('')

    // Reset function
    const resetQuestions = () => {
        setReligion('')
        setHonestAndTrustworthy('')
        setHelpOthers('')
        setRespectGod('')
    }

    // Change handler for the "believe in God" question
    const handleBelieveInGodChange = (e) => {
        setBelieveInGod(e.target.value)
        if (e.target.value.toLowerCase() !== 'yes') {
            resetQuestions()
        }
    }

    // Validation function for form submission
    const canSubmit = () => {
        return ( 
            believeInGod.toLowerCase() === 'yes' && 
            religion && 
            honestAndTrustworthy.toLowerCase() === 'yes' && 
            helpOthers.toLowerCase() === 'yes' && 
            respectGod.toLowerCase() === 'yes'
        )
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!canSubmit()) {
            toast.error('Please answer all questions correctly.')
            return
        }

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const religionFormat = religion.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') // format religion input

        await axios.put(`/api/user/setreligion/${ user.id }`, { 'religion': religionFormat }, {
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
                navigate('/privacypolicy')
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
            {/* Main container */}
            {/* <div className="h-screen bg-gradient-to-r from-emerald-300 to-lime-300 flex items-center justify-center text-gray-600"> */}
                {/* Form container */}
                {/* <div className="px-8 py-6 mt-32 text-left -translate-y-32"> */}
                {/* Header */}
                {/* <h3 className='flex mb-5 text-4xl font-bold font-montserrat'>
                    <img src={epa_logo} className='w-10 h-10 mr-3' alt="EPA" />EPA<span className='text-orange-600'>.</span>
                </h3> */}
                {/* Form */}
                <div className='px-8 py-6 mt-4 shadow-lg bg-emerald-100'>
                    <form onSubmit={ handleSubmit } className='p-2'>
                    <h2 className="text-2xl font-semibold text-center">Validation</h2>
                    <br />

                    {/* Questions */}
                    <div className="validation-form">
                        <div className="mb-4">
                        <label>Do you believe in God? (Yes/No)</label>
                        <input
                            className='border-2 p-2 mt-2 bg-blue-100 w-full'
                            type="text"
                            value={ believeInGod }
                            onChange={handleBelieveInGodChange}
                        />
                        </div>

                        {believeInGod.toLowerCase() === 'yes' && (
                        <>
                            <div className="mb-4">
                            <label>What is your Religion?</label>
                            <input
                                className='border-2 p-2 mt-2 bg-blue-100 w-full'
                                type="text"
                                value={ religion }
                                onChange={(e) => setReligion(e.target.value)}
                            />
                            </div>
                            <div className="mb-4">
                            <label>Are you Honest and Trustworthy? (Yes/No)</label>
                            <input
                                className='border-2 p-2 mt-2 bg-blue-100 w-full'
                                type="text"
                                value={ honestAndTrustworthy }
                                onChange={(e) => setHonestAndTrustworthy(e.target.value)}
                            />
                            </div>
                            {honestAndTrustworthy.toLowerCase() === 'yes' && (
                            <>
                                <div className="mb-4">
                                <label>Can you promise to help others and the Ecology? (Yes/No)</label>
                                <input
                                    className='border-2 p-2 mt-2 bg-blue-100 w-full'
                                    type="text"
                                    value={ helpOthers }
                                    onChange={(e) => setHelpOthers(e.target.value)}
                                />
                                </div>
                                {helpOthers.toLowerCase() === 'yes' && (
                                <div className="mb-4">
                                    <label>Do you respect God? (Yes/No)</label>
                                    <input
                                    className='border-2 p-2 mt-2 bg-blue-100 w-full'
                                    type="text"
                                    value={ respectGod }
                                    onChange={(e) => setRespectGod(e.target.value)}
                                    />
                                </div>
                                )}

                            </>
                            )}
                        </>
                        )}

                        {/* Submit button */}
                        <div className='text-center'>
                        <button className='bg-blue-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>Submit</button>
                        </div>
                    </div>
                    </form>
                </div>
                {/* </div>
            </div> */}

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

export default ValidationBeforeRegister
