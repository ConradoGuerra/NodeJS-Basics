// importando o express.js
const express = require('express')

//criando a variável de rotas
const router = express.Router()

const adminController = require('../controllers/admin')

//Procurando o caminho da view, já com o diretório raiz padronizado
// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct)

//Procurando o caminho da view, já com o diretório raiz padronizado
// /admin/products => GET
router.get('/products', adminController.getProducts)

//Podemos colocar dois métodos distintos de envio na mesma página
// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct)

router.get('/edit-product/:productId', adminController.getEditProduct)

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct)

module.exports = router;