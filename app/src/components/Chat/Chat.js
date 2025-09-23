import Cookies from 'universal-cookie'
import axios from 'axios'
import { io } from 'socket.io-client'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import { FaRegMessage } from 'react-icons/fa6'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Chat = () => {

    // const webSocketUrl = io(process.env.NODE_ENV === 'production' ? `https://${ process.env.DOMAIN }` : `${ window.location.hostname }:${ process.env.DB_PORT }`)
    // const webSocketUrl = io(`${ window.location.href }`)
    const webSocketUrl = io(`http://${ window.location.hostname }:5000`) // prod-8080 dev-3000
    console.log('webSocketUrl >>> ', webSocketUrl)
    console.log('site test >>> ', `${ window.location.href }`)
    const navigate = useNavigate()
    const cookies = new Cookies()
    const [ user ] = useState(cookies.get('user'))
    const { state } = useLocation()
    const [ messages, setMessages ] = useState('')
    const [ newMessage, setNewMessage ] = useState('')
    const [ historyMessage, setHistoryMessage ] = useState('')
    const [ isSessionExist, setIsSessionExist ] = useState(historyMessage && historyMessage._id ? historyMessage._id : false)

    const socketRef = useRef(null)

    useEffect(() => {
        if (user) {
            socketRef.current = io(webSocketUrl, { secure: true, rejectUnauthorized: false })
            socketRef.current.emit('join-chat', { userId: user.id, userName: user.name })
        }
        return () => { 
            socketRef.current.on('new-message', (data) => {
                setMessages((prev) => [ ...prev, data ])
            })
        }
    }, [ user ])

    useEffect(() => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        if (user && state) {
            axios.get(`/api/chat/${ user.id }/${ state.owner ? state.owner : state._id }`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Api-Key': process.env.API_KEY
                },
                data: { cancelToken: source.token }
            }).then(res => {
                console.log('Success OK: ', res.status)
                setIsSessionExist(res.data.chat._id ? res.data.chat._id : false)
                setHistoryMessage(res.data.chat)
            }).catch((err) => {
                if (axios.isCancel(err)) console.log('Successfully Aborted')
                else console.error(err)
            })
            return () => { source.cancel() }
        }
    }, [ user, state ])

    const handleSendMessage = async () => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        const formData = new FormData()
        formData.append('sender', user.id)
        formData.append('receiver', state.owner ? state.owner : state._id)
        formData.append('text', newMessage)

        await axios.post(`/api/chat/send`, formData, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json; charset=utf-8',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            socketRef.current.emit('send-message', { sessionId: res.data.chat._id, sender: user.id, senderName: user.name, receiver: state.owner ? state.owner : state._id, receiverName: state.name, text: newMessage })
            setIsSessionExist(res.data.chat._id)
            setMessages([ ...messages, { sessionId: res.data.chat._id, sender: user.id, senderName: user.name, receiver: state.owner ? state.owner : state._id, receiverName: state.name, text: newMessage } ])
            setNewMessage('')
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

    const handleReplyMessage = async () => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        await axios.put(`/api/chat/reply/${ isSessionExist }`, { sender: user.id, text: newMessage }, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json; charset=utf-8',
                'X-Api-Key': process.env.API_KEY
            },
            data: { cancelToken: source.token }
        }).then(res => {
            console.log('Success OK: ', res.status)
            socketRef.current.emit('send-message', { sessionId: res.data.chat._id, sender: user.id, senderName: user.name, receiver: state.owner ? state.owner : state._id, receiverName: state.name, text: newMessage })
            setMessages([ ...messages, { sessionId: res.data.chat._id, sender: user.id, senderName: user.name, receiver: state.owner ? state.owner : state._id, receiverName: state.name, text: newMessage } ])
            setNewMessage('')
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

    const goBack = () => {
        navigate(-1)
    }

    return (
        <>
            <div className='lg:hidden font-montserrat'>
                <div className='px-6'>
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
            </div>

            <div className="sticky top-0 z-40  pt-2 chat-app">
                <div className="px-6 messages-container">
                    {/* Display historical messages */}
                    { historyMessage && historyMessage.message.map((hist, idx) => (
                        <div key={ idx } className={`message ${ hist.sender === user.id ? 'sent' : 'received' }`}>
                            <div className="message-text">
                                <div>{ hist.sender === user.id ? 'You' : state.name }: { hist.text }</div>
                                {/* <div>{ hist.sender !== user.id && <button onClick={ () => handleReplyMessage(historyMessage._id) }>Reply</button> }</div> */}
                            </div>
                        </div>
                    )) }

                    { messages && messages.map((msg, idx) => (
                        <div key={ idx } className={`message ${ msg.sender === user.id ? 'sent' : 'received' }`}>
                            <div className="message-text">
                                <div>{ msg.sender === user.id ? 'You' : state.name }: { msg.text }</div>
                            </div>
                        </div>
                    )) }
                </div>

                <div className="input-container">
                    <input
                        type="text"
                        value={ newMessage }
                        onChange={ (e) => setNewMessage(e.target.value) }
                        placeholder="Type a message..."
                    />
                    <button className='chat-button' onClick={ isSessionExist ? () => handleReplyMessage() : () => handleSendMessage() }>Send</button>
                </div>
            </div>

            <ToastContainer
                position=' bottom-center'
                autoClose={ 3000 }
                hideProgressBar={ false }
                newestOnTop={ false }
                closeOnClick
                rtl={ false }
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme='colored'
            />
        </>
    )
}

export default Chat
