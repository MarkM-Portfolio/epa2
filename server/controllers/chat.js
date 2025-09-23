const { Chat } = require('../models/model')
const dateTime = require('luxon')

exports.sendMessage = async (req, res) => {
    console.log("<<< API POST CHAT NEW SESSION >>>")
    
    try {        
        const { sender, receiver, text } = req.body

        const newMsg = []
        newMsg.push({ sender, text })

        const chat = await Chat({ 
            sender: sender,
            receiver: receiver,
            message: newMsg,
            createdAt: dateTime.DateTime.local().toISO()
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        await chat.save()
        return res.status(201).json({ message: 'Message Sent Successfully!', chat })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.replyMessage = async (req, res) => {
    console.log("<<< API PUT CHAT REPLY MESSAGE >>>")

    try {
        const { sessionId } = req.params
        const { sender, text } = req.body

        const chat = await Chat.findOne({ _id: sessionId })

        chat.message.push({ sender: sender, text: text })

        await Chat.findByIdAndUpdate(sessionId, {
           message: chat.message,
           updatedAt: dateTime.DateTime.local().toISO()
        })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(201).json({ message: 'Reply Message Sent!', chat })
    } catch (error) {
        console.error('Error updating value', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}

exports.getMessagesHistory = async (req, res) => {
    console.log("<<< API GET CHAT MESSAGE HISTORY >>>")

    try {
        const { userId, receiverId } = req.params

        let chat = await Chat.findOne({ 
            $and: [ { sender: userId }, { receiver: receiverId } ] 
        })

        if (!chat)
            chat = await Chat.findOne({ 
                $and: [ { sender: receiverId }, { receiver: userId } ] 
            })

        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ error: 'Forbidden' })
        return res.status(200).json({ message: 'Get History Chat Messages Success!',  chat })
    } catch (error) {
        console.error('Error fetching messages:', error)
        return res.status(500).json({ error: 'Server Error!' })
    }
}
