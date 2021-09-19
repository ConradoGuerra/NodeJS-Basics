const Product = require('../models/product')

//Controller get para a view add product
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product', 
        path : "/admin/add-product",
        editing: false
    })
}

//Controller post to add product
exports.postAddProduct = (req, res) => {

    const title = req.body.title
    const imageUrl = req.body.imageUrl
    const description = req.body.description
    const price = req.body.price

    //Creating a new instance of the book's name
    const product = new Product(null, title, imageUrl, description, price)
    //Pushing the title into an array
    product.save()
    //Quando o usuário acessa a rota product, ela é redirecionada à raiz
    res.redirect('/')
}

//Controller get para a view edit product
exports.getEditProduct = (req, res, next) => {

    //Here we get the param of URL 
    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect('/')
    }

    //Get the param sent with get
    const prodId = req.params.productId

    //Searching the id
    Product.findById(prodId, product => {
        if(!product){
            return res.redirect('/')
        }

        //if id exists
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product', 
            path : "/admin/edit-product",
            editing: editMode,
            product: product
        })
        
    })
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId
    const updatedTitle = req.body.title
    const updatedImageUrl = req.body.imageUrl
    const updatedDescription = req.body.description
    const updatedPrice = req.body.price

    const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedDescription, updatedPrice)
    updatedProduct.save()

    res.redirect('/admin/products')

}


exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        //Render é um função do express.js que renderiza o template engine setado na página principal (no nosso caso o handlebars)
        res.render('admin/products', {
            prods: products, 
            pageTitle: 'Admin Products', 
            path: '/admin/products'
        })
    })
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    Product.deleteById(prodId)
    res.redirect('/admin/products')
}
