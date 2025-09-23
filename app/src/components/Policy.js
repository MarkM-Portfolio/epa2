import React from 'react'
import epa_logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import jsPDF from 'jspdf'


const Policy = () => {
    const navigate = useNavigate()

    const redirectPage = () => {
        toast.success('Policy Agreement Confirmed!')
        toast.info('Redirecting to Profile...')
        setTimeout(() => {
            navigate('/profile')
        }, 2000)
    }

    // const exportPDF = () => {
    //     // Create a new jsPDF instance
    //     const doc = new jsPDF()

    //     doc.text("EPA Policy", 10, 10)
    //     doc.setFontSize(12)

    //     const policyItems = [
    //         "Respect and Obedience: All members and subscribers of the Ecology Peoples Amenities Foundation (EPA Foundation) must agree to show respect and obedience to the elders and officers of the foundation. This includes following their guidance, instructions, and decisions made in the best interest of the foundation and its members.",
    //         "Compliance with Rules: Every member or subscriber is expected to obey and follow the rules and regulations set forth by the EPA Foundation. These rules are designed to maintain a harmonious and productive environment for the benefit of all members. Failure to comply with these rules may result in penalties or suspension.",
    //         "Commitment to Help and Glorify God: Members are encouraged to actively participate in initiatives that help other members and contribute to the overall well-being of the community. Additionally, members are expected to conduct themselves in a manner that glorifies God, promoting ethical behavior, compassion, and understanding. Members or subscribers are encouraged to follow prayer schedules and thanksgiving to God.",
    //         "Token Quota: Each member is assigned a target token quota that they must comply with to sustain the foundation's economic activities. Adhering to the assigned token quota ensures the smooth functioning of the foundation and its various programs. Members are responsible for meeting their quota within the specified time frames.",
    //         "Prohibition of Illegal Activities: Engaging in any form of illegal activities within the EPA Foundation is strictly prohibited and will not be tolerated. Any member found involved in illegal activities may face account penalties or suspension, depending on the severity of the offense.",
    //         "Harmony, Peace, and Understanding: The EPA Foundation emphasizes the importance of maintaining harmony, peace, and understanding among its members. Any form of corruption, disagreements, or conflicts that disrupt the foundation's unity will not be allowed. Members are encouraged to address issues through respectful dialogue and cooperation.",
    //         "Disciplinary Actions: Violations of the EPA Foundation policies may result in disciplinary actions, including but not limited to warnings, penalties, suspension, or expulsion from the foundation, depending on the severity and recurrence of the offense.",
    //         "Amendments to Policy: The EPA Foundation reserves the right to amend this policy as deemed necessary for the betterment of the foundation and its members. Members will be informed of any policy changes in a timely manner."
    //     ]

    //     let yPos = 20

    //     policyItems.forEach(item => {
    //         const lines = doc.splitTextToSize(item, 180) // Adjust width as needed
    //         doc.text(lines, 10, yPos)
    //         yPos += (lines.length * 7) + 5 // Approximate line height
    //     })

    //     doc.save("EPA_Policy.pdf")
    // }

    return (
        <>
             <div className="bg-gradient-to-r from-emerald-300 to-lime-300">
                <div className='flex items-center justify-center text-gray-600'>
                    <div className="mx-4 px-8 py-6 mt-4 text-left">
                        <h3 className='mt-10 flex mb-5 text-4xl font-bold font-montserrat'>
                            <img src={ epa_logo } className='w-10 h-10 mr-3' alt="EPA" />
                            EPA<span className='text-orange-600'>.</span>
                            <span className='text-2xl font-semibold py-2'></span>
                        </h3>
                        <div className='px-8 py-6 mt-4 rounded-lg shadow-lg bg-emerald-100'>
                            <h3 className='text-2xl pb-6 font-bold text-center'>Privacy Policy</h3>
                            <ol className="list-decimal list-inside text-sm">
                                <li className='pb-2'>
                                    <strong>Respect and Obedience:</strong> All members and subscribers of the Ecology Peoples Amenities Foundation (EPA Foundation) must agree to show respect and obedience to the elders and officers of the foundation. This includes following their guidance, instructions, and decisions made in the best interest of the foundation and its members.
                                </li>
                                <li className='pb-2'>
                                    <strong>Compliance with Rules:</strong> Every member or subscriber is expected to obey and follow the rules and regulations set forth by the EPA Foundation. These rules are designed to maintain a harmonious and productive environment for the benefit of all members. Failure to comply with these rules may result in penalties or suspension.
                                </li>
                                <li className='pb-2'>
                                    <strong>Commitment to Help and Glorify God:</strong> Members are encouraged to actively participate in initiatives that help other members and contribute to the overall well-being of the community. Additionally, members are expected to conduct themselves in a manner that glorifies God, promoting ethical behavior, compassion, and understanding. Members or subscribers are encouraged to follow prayer schedules and thanksgiving to God.
                                </li>
                                <li className='pb-2'>
                                    <strong>Token Quota:</strong> Each member is assigned a target token quota that they must comply with to sustain the foundation's economic activities. Adhering to the assigned token quota ensures the smooth functioning of the foundation and its various programs. Members are responsible for meeting their quota within the specified time frames.
                                </li>
                                <li className='pb-2'>
                                    <strong>Prohibition of Illegal Activities:</strong> Engaging in any form of illegal activities within the EPA Foundation is strictly prohibited and will not be tolerated. Any member found involved in illegal activities may face account penalties or suspension, depending on the severity of the offense.
                                </li>
                                <li className='pb-2'>
                                    <strong>Harmony, Peace, and Understanding:</strong> The EPA Foundation emphasizes the importance of maintaining harmony, peace, and understanding among its members. Any form of corruption, disagreements, or conflicts that disrupt the foundation's unity will not be allowed. Members are encouraged to address issues through respectful dialogue and cooperation.
                                </li>
                                <li className='pb-2'>
                                    <strong>Disciplinary Actions:</strong> Violations of the EPA Foundation policies may result in disciplinary actions, including but not limited to warnings, penalties, suspension, or expulsion from the foundation, depending on the severity and recurrence of the offense.
                                </li>
                                <li className='pb-2'>
                                    <strong>Amendments to Policy:</strong> The EPA Foundation reserves the right to amend this policy as deemed necessary for the betterment of the foundation and its members. Members will be informed of any policy changes in a timely manner.
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div className='flex items-center justify-center '>
                    <button onClick={ () => redirectPage() } className='bg-blue-400 hover:bg-red-700 text-white font-bold py-2 px-8 w-full rounded-lg shadow-md mx-12 mt-2 mb-10'>Agree</button>
                </div>

                {/* <div className='flex items-center justify-center'>
                    <button onClick={ exportPDF } className='border-2 border-orange-400 hover:bg-red-700 text-orange-400 font-bold py-2 px-8 w-full rounded-lg shadow-md mx-12 mt-2 mb-10'>Download Policy</button>
                </div> */}


                <ToastContainer
                    position="top-center"
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
            </div>
        </>
    )
}

export default Policy
