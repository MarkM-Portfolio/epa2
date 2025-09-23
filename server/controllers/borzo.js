// const { createProxyMiddleware } = require('http-proxy-middleware')

// exports.borzoAuth = createProxyMiddleware({
//     target: process.env.DB_ENV === 'production' ? process.env.BORZO_URL : process.env.BORZO_MOCK_URL,
//     pathRewrite: async (path, req) => { 
//         console.log("<<< API GET DELIVERY BORZO AUTH >>>")
//         return path.replace(req.originalUrl, `/${ process.env.BORZO_ENDPOINT }/${ process.env.BORZO_API_VER }`) 
//     },
//     changeOrigin: true,
//     logger: console
// })

// exports.borzoCalcOrder = createProxyMiddleware({
//     target: process.env.DB_ENV === 'production' ? process.env.BORZO_URL : process.env.BORZO_MOCK_URL,
//     pathRewrite: async (path, req) => { 
//         console.log("<<< API POST DELIVERY BORZO CALCULATE ORDER >>>")
//         return path.replace(req.originalUrl, `/${ process.env.BORZO_ENDPOINT }/${ process.env.BORZO_API_VER }/calculate-order`) 
//     },
//     changeOrigin: true,
//     logger: console  
// })

// exports.borzoCOD = createProxyMiddleware({
//     target: process.env.DB_ENV === 'production' ? process.env.BORZO_URL : process.env.BORZO_MOCK_URL,
//     pathRewrite: async (path, req) => { 
//         console.log("<<< API POST DELIVERY BORZO CASH ON DELIVERY >>>")
//         return path.replace(req.originalUrl, `/${ process.env.BORZO_ENDPOINT }/${ process.env.BORZO_API_VER }/create-order`) 
//     },
//     changeOrigin: true,
//     logger: console  
// })

// exports.borzoMyOrders = createProxyMiddleware({
//     target: process.env.DB_ENV === 'production' ? process.env.BORZO_URL : process.env.BORZO_MOCK_URL,
//     pathRewrite: async (path, req) => { 
//         console.log("<<< API GET DELIVERY BORZO MY ORDERS >>>")
//         return path.replace(req.originalUrl, `/${ process.env.BORZO_ENDPOINT }/${ process.env.BORZO_API_VER }/orders`) 
//     },
//     changeOrigin: true,
//     logger: console
// })

// exports.borzoCourierInfo = createProxyMiddleware({
//     target: process.env.DB_ENV === 'production' ? process.env.BORZO_URL : process.env.BORZO_MOCK_URL,
//     pathRewrite: async (path, req) => { 
//         console.log("<<< API GET DELIVERY BORZO COURIER INFO >>>")
//         console.log(req.originalUrl)
//         // return path.replace(`${ req.originalUrl }${ req.params }`, `/${ process.env.BORZO_ENDPOINT }/${ process.env.BORZO_API_VER }/courier?order_id=741825`) 
//         return path.replace(req.originalUrl, `/${ process.env.BORZO_ENDPOINT }/${ process.env.BORZO_API_VER }/courier?order_id=741825`) 
//     },
//     changeOrigin: true,
//     logger: console
// })

/* OTHER METHOD */
// exports.borzoMyOrders = async (req, res) => {
//     console.log("<<< API GET DELIVERY BORZO MY ORDERS >>>")
//     try {
//         const result = createProxyMiddleware({
//             target: process.env.DB_ENV === 'production' ? process.env.BORZO_URL : process.env.BORZO_MOCK_URL,
//             pathRewrite: { [ req.originalUrl ] : `/${ process.env.BORZO_ENDPOINT }/${ process.env.BORZO_API_VER }/orders` },
//             changeOrigin: true,
//             logger: console  
//         })
//         // console.log('result >> ', result)
//         return res.status(200).json({ message: 'Borzo Auth Success!', result })
//     } catch (error) {
//         console.error('Error updating value', error)
//         return res.status(500).json({ error: 'Server Error!' })
//     }
// }