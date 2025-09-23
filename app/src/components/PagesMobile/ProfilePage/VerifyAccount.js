import Cookies from 'universal-cookie'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { FaArrowAltCircleLeft, FaCamera } from 'react-icons/fa'
import { MdDomainVerification } from 'react-icons/md'
import { NavLink, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import idImg from '../../../assets/id.png'

const VerifyAccount = () => {
    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ userImg1, setUserImg1 ] = useState('')
    const [ userImg2, setUserImg2 ] = useState('')
    const [ userImg3, setUserImg3 ] = useState('')
    const [ salaryEmployed, setSalaryEmployed ] = useState('')
    const [ salarySelfEmployed, setSalarySelfEmployed ] = useState('')
    const [ salaryPension, setSalaryPension ] = useState('')
    const [ father, setFather ] = useState('')
    const [ mother, setMother ] = useState('')
    const [ sibling1, setSibling1 ] = useState('')
    const [ sibling2, setSibling2 ] = useState('')
    const [ sibling3, setSibling3 ] = useState('')
    const [ sibling4, setSibling4 ] = useState('')
    const [ sibling5, setSibling5 ] = useState('')
    const [ otherSiblings, SetOtherSiblings ] = useState('')
    const [ dependents, setDependents ] = useState('')
    const [ currentCompany, SetCurrentCompany ] = useState('')
    const [ currentJob, setCurrentJob ] = useState('')
    const [ dreamJob, setDreamJob ] = useState('')

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

    const readFileAsBlob = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const result = reader.result
                resolve(new Blob([result], { type: file.type }))
            }
            reader.onerror = reject
            reader.readAsArrayBuffer(file)
        })
    }

    const handleFileSave = async() => {

        const userImg1Blob = await readFileAsBlob(userImg1)
        const userImg2Blob = await readFileAsBlob(userImg2)
        const userImg3Blob = await readFileAsBlob(userImg3)

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('verify', userImg1Blob)
        formData.append('verify', userImg2Blob)
        formData.append('verify', userImg3Blob)
        formData.append('salaryEmployed', salaryEmployed)
        formData.append('salarySelfEmployed', salarySelfEmployed)
        formData.append('salaryPension', salaryPension)
        formData.append('father', father)
        formData.append('mother', mother)
        formData.append('sibling1', sibling1)
        formData.append('sibling2', sibling2)
        formData.append('sibling3', sibling3)
        formData.append('sibling4', sibling4)
        formData.append('sibling5', sibling5)
        formData.append('otherSiblings', otherSiblings)
        formData.append('dependents', dependents)
        formData.append('currentCompany', currentCompany)
        formData.append('currentJob', currentJob)
        formData.append('dreamJob', dreamJob)

        await axios.put(`/api/user/submitverification/${ user.id }`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'multipart/form-data',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            toast.info(res.data.message)
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
                    <MdDomainVerification className='fill-orange-500' />
                    <h1 className='text-lg text-center font-semibold mb-10 pl-1'>Verify Account</h1>
                </div>

                <div className='-mt-7 mb-7 flex flex-cols justify-center font-semibold text-xs gap-2 rounded-1xl text-center'>
                    <p className='font-normal'>The Verification process will take for about 72 hours  </p>
                </div>
                <hr />
            </div>

            <div className='px-6 font-montserrat'>
                <div className='flex justify-center'>
                    <img src={ idImg } className='w-40 h-40' />
                </div>
                
                <div>
                    <h1 className='font-semibold text-center text-md'>To proceed with the verification, we kindly request you to provide the following:</h1>
                    <p className='py-2 text-gray-400 text-sm'>1. A clear and legible copy of your government-issued photo identification (e.g., driver's license, passport, or national ID card).</p>
                    <p className='py-2 text-gray-400 text-sm'>2. A secondary identification document, such as a recent utility bill or bank statement, confirming your current address.</p>
                    <p className='py-2 text-gray-400 text-sm'>3. A selfie holding the provided identification documents, clearly showing your face for comparison.</p>
                </div>

                <div className='mt-2 border border-green-400 rounded-lg p-4'>
                    <h1 className='font-semibold mb-2'>Upload 3 government ID's to verify account.</h1>
                    <div>
                        <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setUserImg1(e.target.files[0]) } />
                        <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setUserImg2(e.target.files[0]) } />
                        <input type='file' accept='image/jpeg, image/jpg, image/png' onChange={ (e) => setUserImg3(e.target.files[0]) } />
                    </div>

                    <br />
                    <div className='flex flex-cols gap-2'>
                        <input
                            className='border-2 p-2 bg-blue-100'
                            type="tel"
                            placeholder="Employed Salary" 
                            onChange={(e) => setSalaryEmployed(e.target.value)}
                            value={ salaryEmployed }
                        />
                        <h1 className='mt-2'>/ month</h1>
                    </div>
                    <br />
                    <div className='flex flex-cols gap-2'>
                        <input
                            className='border-2 p-2 bg-blue-100'
                            type="tel"
                            placeholder="Self-Employed Salary" 
                            onChange={(e) => setSalarySelfEmployed(e.target.value)}
                            value={ salarySelfEmployed }
                        />
                        <h1 className='mt-2'>/ month</h1>
                    </div>
                    <br />
                    <div className='flex flex-cols gap-2'>
                        <input
                            className='border-2 p-2 bg-blue-100'
                            type="tel"
                            placeholder="Pension" 
                            onChange={(e) => setSalaryPension(e.target.value)}
                            value={ salaryPension }
                        />
                        <h1 className='mt-2'>/ month</h1>
                    </div>
                    <br />
                    <input 
                        className='border-2 mt-2 p-2 bg-blue-100 w-full'
                        type="text" 
                        placeholder="Father's Name"
                        onChange={(e) => setFather(e.target.value)}
                        value={ father }
                    />
                    <br />
                    <input 
                        className='border-2 mt-2 p-2 bg-blue-100 w-full'
                        type="text" 
                        placeholder="Mother's Maiden Name"
                        onChange={(e) => setMother(e.target.value)}
                        value={ mother }
                    />
                    <br />
                    <h1 className='mt-2'>Siblings</h1>
                    <input 
                        className='border-2 mt-2 p-2 bg-blue-100 w-full'
                        type="text" 
                        placeholder="Sibling # 1" 
                        onChange={(e) => setSibling1(e.target.value)}
                        value={ sibling1 }
                    />
                    <br />
                    <input 
                        className='border-2 mt-2 p-2 bg-blue-100 w-full'
                        type="text" 
                        placeholder="Sibling # 2" 
                        onChange={(e) => setSibling2(e.target.value)}
                        value={ sibling2 }
                    />
                    <br />
                    <input 
                        className='border-2 mt-2 p-2 bg-blue-100 w-full'
                        type="text" 
                        placeholder="Sibling # 3" 
                        onChange={(e) => setSibling3(e.target.value)}
                        value={ sibling3 }
                    />
                    <br />
                    <input 
                        className='border-2 mt-2 p-2 bg-blue-100 w-full'
                        type="text" 
                        placeholder="Sibling # 4" 
                        onChange={(e) => setSibling4(e.target.value)}
                        value={ sibling4 }
                    />
                    <br />
                    <input 
                        className='border-2 mt-2 p-2 bg-blue-100 w-full'
                        type="text" 
                        placeholder="Sibling # 5" 
                        onChange={(e) => setSibling5(e.target.value)}
                        value={ sibling5 }
                    />
                    <br />
                    <textarea 
                        className='border-2 mt-2 p-2 bg-blue-100 w-full'
                        type="text" 
                        placeholder="Other Siblings" 
                        rows={ 5 }
                        onChange={(e) => SetOtherSiblings(e.target.value)}
                        value={ otherSiblings }
                    />
                    <br />
                    { user.gender === 'female' || currentUser.gender === 'female' && (
                        <div>
                            <div className='flex flex-cols gap-2'>
                                <input
                                    className='border-2 p-2 bg-blue-100 w-full'
                                    type="number"
                                    placeholder="# of Children" 
                                    onChange={(e) => setDependents(e.target.value)}
                                    value={ dependents }
                                />
                                <h1 className='mt-2 text-xs'>Only mother can apply for child support.</h1>
                            </div>
                        </div>
                        // <br />
                    )}
                    <br />
                    <input 
                        className='border-2 mt-2 p-2 bg-blue-100 w-full'
                        type="text" 
                        placeholder="Current Company"
                        onChange={(e) => SetCurrentCompany(e.target.value)}
                        value={ currentCompany }
                    />
                    <br />
                    <input 
                        className='border-2 mt-2 p-2 bg-blue-100 w-full'
                        type="text" 
                        placeholder="Current Job"
                        onChange={(e) => setCurrentJob(e.target.value)}
                        value={ currentJob }
                    />
                    <br />
                    <input 
                        className='border-2 p-2 mt-2 bg-blue-100 w-full'
                        type="text" 
                        placeholder="Dream Job" 
                        onChange={(e) => setDreamJob(e.target.value)}
                        value={ dreamJob }
                    />
                </div>

                <div className='flex justify-center mt-7'>
                    <button className='p-3 text-white text-lg font-semibold tracking-wider bg-emerald-400 rounded-lg shadow-md w-full' onClick={ handleFileSave }>Submit</button>
                </div>
                
                <NavLink to="/profile">
                    <h1 className='py-2 underline text-center text-emerald-400 font-semibold'>I don't have any ID</h1>
                </NavLink>

                <hr />

                <div>
                    <p className='py-2 text-red-400 text-xs'>Please be assured that the information you provide will be treated with the utmost confidentiality and used exclusively for the purpose of identity verification. We appreciate your cooperation in this matter, as it helps us maintain a secure environment for all our users.</p>
                    <p className='py-2 text-red-400 text-xs'>You can securely upload the documents by accessing the verification section in your account settings or by replying to this email with attachments. Our team will promptly review the submitted documents and notify you of the verification status.</p>
                    <p className='py-2 mb-4 text-blue-400 text-center text-xs'>Thank you for your understanding and cooperation.</p>
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

export default VerifyAccount
