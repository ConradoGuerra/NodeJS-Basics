//Importing fs and path
const fs = require('fs');
const path = require('path');
const Cart = require('./cart');

//First we create the path where the data is gonna be saved and type of file
const p = path.join(
    
    path.dirname(require.main.filename),
    'data',
    'products.json'
);

//Creating a refactoring function 
const getProductsFromFile = cb => {

    //Here we create a callback function, if the array is not empty (there are products), we will parse the json content file 
    fs.readFile(p, (err, fileContent) => {
        //If error, if there is no product, the array must be empty
        if(err){
            return cb([])
        }

        //Otherwise to return as array, not string, i have to call method parse
        cb(JSON.parse(fileContent))
    })

}

//Exportando uma classe dos produtos
module.exports = class Products {
    
    //nomenado um construtor para essa classe
    constructor(id, title, imageUrl, description, price){
        this.id = id
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    //criando um metodo para salvar os dados em um array
    save(){
        getProductsFromFile(products => {

            //If the product had id, then will be edited
            if(this.id){

                //Finding the product index to update with the new details
                const existingProductIndex = products.findIndex(prod => prod.id === this.id);
                const updatedProduct = [...products]
                updatedProduct[existingProductIndex] = this;            
                //Write the new product at file and converting the array to a JSON file
                fs.writeFile(p, JSON.stringify(updatedProduct), (err) => {
                    console.log(err)
                })
            }else{

                //saving a id in save object to add a id
                //creating a property id
                this.id = Math.random().toString();
        
                //Sending an callback as parameter, the result of this function return empty or filled array
                products.push(this)
        
                //Write the new product at file and converting the array to a JSON file
                fs.writeFile(p, JSON.stringify(products), (err) => {
                    console.log(err)
                })
            }
        })

    }
    static deleteById(id){
        getProductsFromFile(products => {
            //Filtering the produts that are not the product deleted
            const updatedProducts = products.filter(p => p.id !== id);
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                if (!err){
                    //Calling the function to delete from cart
                    Cart.deleteProduct(id, updatedProducts.price)

                }
            })
        })
        
    }

    //buscando os dados que foram salvos
    //criamos o módulo como estático para não ter que criar uma nova instância e poder chamá-lo a qualquer momento
    static fetchAll(cb){

        getProductsFromFile(cb)

    }

    //Creating a static function to find the id
    //Here we have two parameters, first the product ID, the second is a callback to be sychronous
    static findById(id, cb){
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id)
            cb(product)
        })
    }


}