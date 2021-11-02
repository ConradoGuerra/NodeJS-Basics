// importando o express.js
const express = require("express");

const { body } = require("express-validator");

//criando a variável de rotas
const router = express.Router();

const adminController = require("../controllers/admin");

const isAuth = require("../middleware/is-auth");

// //Procurando o caminho da view, já com o diretório raiz padronizado
// // /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// //Procurando o caminho da view, já com o diretório raiz padronizado
// // /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// //Podemos colocar dois métodos distintos de envio na mesma página
// // /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title", "Invalid title").isString().isLength({ min: 3 }).trim(),
    body("imageUrl", "Invalid imageUrl").isURL(),
    body("price", "Invalid price").isFloat(),
    body("description", "Invalid description").isLength({ min: 5 }).trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

// //Route for view admin/edit-product
// //View => admin/products
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// //Route to send data to edit the product
// //View => admin/edit-product
router.post(
  "/edit-product",
  [
    body("title", "Invalid title").isString().isLength({ min: 3 }).trim(),
    body("imageUrl", "Invalid imageUrl").isURL(),
    body("price", "Invalid price").isFloat(),
    body("description", "Invalid description").isLength({ min: 5 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

// //Route to delete a product
// //View => admin/products
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
