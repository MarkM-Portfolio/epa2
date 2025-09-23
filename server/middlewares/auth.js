const { User } = require('../models/model')
const jwt = require('jsonwebtoken')

exports.isAuth = async (req, res, next) => {
  // if (req.headers && req.headers.authorization) {
  if (req.headers && req.headers.cookie) { // replace temp req.headers.authorization to req.headers.cookie
    // const token = req.headers.authorization.split(' ')[1]
    const token = req.headers.cookie.split(' ')[0].split('=')[1].slice(0, -1)
    
    try {
      const decode = jwt.verify(token, process.env.SECRET_KEY)
      const user = await User.findById(decode.userId)
      
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized access!' })
      }

      req.user = user
      next()
    } catch (error) {
      console.log('ERROR: ', error)
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Unauthorized access!' })
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Sesson expired try sign in!' })
      }

      return res.status(401).json({ message: 'Internal server error!' })
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized access!' })
  }
}
