var { buildSchema } = require('graphql');

var schema = buildSchema(`
    type Query {
        buscar: [Producto],
    },
    type Mutation {
        updateProducto(id: String!, title: String, price: String, thumbnail: String): Producto,
    },
    type Producto {
        _id: String,
        title: String,
        price: String,
        thumbnail: String
    }    
`);

//updateProducto(id: String!, title: String, price:String, thumbnail: String): Producto,
module.exports = { schema }