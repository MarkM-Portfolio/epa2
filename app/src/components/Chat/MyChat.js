import Cookies from 'universal-cookie'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { FaRegMessage } from 'react-icons/fa6'
// import { ToastContainer, toast } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'

const MyChat = () => {

    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const [ currentUser, setCurrentUser ] = useState([])
    const [ allUsers, setAllUsers ] = useState([])
    const [ isLoading, setIsLoading ] = useState(false)

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
        }
        return () => { source.cancel() }
    }, [ user ])

    useEffect(() => {
        setIsLoading(true)

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
    
        if (currentUser && currentUser.teams) {
            axios.get(`/api/user`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setAllUsers(res.data.users.filter(item => 
                    currentUser.teams.includes(item._id) || currentUser.sponsor.includes(item._id)
                ))
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            }).finally(() => {
                setIsLoading(false)
            })
            
            return () => { source.cancel() }
        }
    }, [ currentUser ])

    const goBack = () => {
        navigate(-1)
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
            
            <div className='lg:hidden font-montserrat'>

                <div className='px-6 mt-10 sticky top-0 z-40'>
                    <div className='flex items-center gap-2'> 
                        <div className='grid grid-cols-2 font-bold font-montserrat'>
                            <FaArrowAltCircleLeft onClick={ () => goBack() } className='text-4xl' />
                        </div>   
                    </div>
                </div>
                <div className='flex justify-center gap-2 text-3xl -mt-7'>
                    <FaRegMessage className='fill-orange-500' />
                    <h1 className='text-lg text-center font-semibold mb-10 pl-1'>Chat</h1>
                </div>

                <hr />

                { allUsers.map(item => (
                    <NavLink to='/chat' state={ item } key={ item._id }>
                        <div className="flex flex-cols gap-4 justify-start">
                            <div className='px-6 py-4 mb-1 flex items-center gap-4 bg-gray-100 text-xs w-full'>
                                { item.avatar ? 
                                    <img className='object-contain h-12 w-22' src={ window.location.origin + '/private/avatar/' + item.avatar } />
                                    :
                                    <img className='object-contain h-12 w-22' src="https://static-00.iconduck.com/assets.00/avatar-default-symbolic-icon-2048x1949-pq9uiebg.png" />
                                }
                                <h1 className='font-semibold'>{ item.name } ({ item.email })</h1>
                            </div>
                        </div>
                    </NavLink>
                )) }

            </div>

            {/* <ToastContainer
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
            /> */}
        </>
    )
}

export default MyChat
