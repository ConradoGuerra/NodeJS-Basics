//Importing express
const express = require('express')

//Importing auth controller
const authController = require('../controllers/auth')

//Getting the router
const router = express.Router()

//Connecting the view to controller
router.get('/login', authController.getLogin)

//Connecting the view signup to controller
router.get('/signup', authController.getSignup)

//Connecting the view to controller
router.post('/login', authController.postLogin)

//Connecting the view to controller
router.post('/signup', authController.postSignup)

//Connecting the view to controller logout
router.post('/logout', authController.postLogout)

//Connecting to view reset
router.get('/reset', authController.getReset)

//Post submit to reset password
router.post('/reset', authController.postReset)

module.exports = router