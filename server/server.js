require('./models/db')

const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
// const https = require('https')
const socketIO = require('socket.io')
const fs = require('fs')

const userRoutes = require('./routes/user')
const loadRoutes = require('./routes/load')
const notifRoutes = require('./routes/notification')
const storeRoutes = require('./routes/store')
const productRoutes = require('./routes/product')
const serviceRoutes = require('./routes/service')
const orderRoutes = require('./routes/order')
const paymentRoutes = require('./routes/payment')
const deliveryRoutes = require('./routes/delivery')
// const borzoRoutes = require('./routes/borzo')
const chatRoutes = require('./routes/chat')
const settingRoutes = require('./routes/setting')
// const transactionRoutes = require('./routes/transaction')

// proxy delivery channel route before parse body
// app.use('/api/borzo', borzoRoutes)

app.use(express.static(path.join(__dirname, '../app/build')))
app.use(cors())
app.use(express.json())
app.use(express.static('assets'))

// Assume a simple in-memory store for messages (You should replace this with a database in production)
// let messages = []

// routes
app.use('/api/user', userRoutes)
app.use('/api/load', loadRoutes)
app.use('/api/notification', notifRoutes)
app.use('/api/store', storeRoutes)
app.use('/api/product', productRoutes)
app.use('/api/service', serviceRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/delivery', deliveryRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/setting', settingRoutes)

app.get('/api', (req, res) => {
    console.log("<<< API GATEWAY >>>")

    try {
        // Protect API for Internal Use Only
        if (req.header('X-Api-Key') !== process.env.API_KEY)
            return res.status(403).json({ message: 'Forbidden!' })
        return res.status(200).json({ message: 'EXPRESS BACKEND IS CONNECTED TO REACT' })
    } catch(error) {
        return res.status(500).json({ error: 'Server Error!' })
    }
})

// Build static files to root
app.get('*', (req, res) => {
	return res.sendFile(path.join(__dirname, '../app/build/index.html'))
})

// Global error handling
app.use((err, _req, res, next) => {
    return res.status(500).send("Internal Server Error 500 !")
})

// Enable CORS Port 3000
// app.listen(3000, () => {
//   console.log("CORS-enabled web server listening on port 3000")
// })

// Connect Database Server
const server = app.listen(process.env.DB_PORT, () => {
    console.log(`\nCurrent Environment: ${ process.env.DB_ENV.toUpperCase() }`)
    console.log(`Server is running on port: ${ process.env.DB_PORT }`)
})

// HTTPS options with the certificate and private key
const options = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.cert')
}

// open port for web socket in dev environment
// let httpServer = ''
// if (process.env.DB_ENV === 'development')
// const server = https.createServer(options, app)

const io = socketIO(server, options, {
    cors: {
        origin: '*',
        methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ]
    },
    "log level" : 1,
    "match origin protocol" : true,
    "transports" : [ 'websocket', 'flashsocket', 'xhr-polling', 'jsonp-polling' ]
})

// open port for web socket in dev environment
// if (process.env.DB_ENV === 'development')
    // server.listen(process.env.WS_PORT, () => console.log(`Web Socket Server Running on Port: ${ process.env.WS_PORT }`))

// Socket.io Connection
io.on('connection', (socket) => {
    socket.on('join-chat', (data) => {
        socket.join(data.userId)
        console.log(`⚡: ${ data.userName } user joined the chat.`)
    })

    socket.on('send-message', (data) => {
        io.to(data.receiver).emit('new-message', data)
        console.log('send-message >> ', data)
    })

    socket.on('disconnect', (data) => {
        console.log(`🔥: ${ data.userName } user is disconnected!`)
    })
})

// local tunnel for testing payment webhooks locally
const ngrok = require('ngrok')

if (process.env.DB_ENV === 'development' && process.env.PAYMENT === 'hitpay') {
    ( async () => {
        const url = await ngrok.connect({
            authtoken: process.env.EPA_LOCAL_AUTH_TOKEN,
            addr: `http://[::1]:${ process.env.DB_PORT }`
        })
        console.log(`Listening to local tunnel: ${ url }`)

        fs.readFile('./.env', 'utf8', (err, data) => {
            if (err) return console.log(err)
            
            let result = data.replace(new RegExp('^.*' + 'EPA_LOCAL_TUNNEL' + '.*$', 'gm'), `EPA_LOCAL_TUNNEL = "${ url }"`)
          
            fs.writeFile('./.env', result, 'utf8', (err) => {
               if (err) return console.log(err)
            })
        })
    })()
}
