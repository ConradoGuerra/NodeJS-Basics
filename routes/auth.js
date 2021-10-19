//Importing express
const express = require('express')

//Importing auth controller
const authController = require('../controllers/auth')

//Getting the router
const router = express.Router()

//Connecting the view to controller
router.get('/login', authController.getLogin)

//Connecting the view to controller
router.post('/login', authController.postLogin)

module.exports = router