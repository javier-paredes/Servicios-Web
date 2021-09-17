var { buildSchema } = require('graphql');

var schema = buildSchema(`
    type Query {
        buscar: [Producto],
    },    
    type Mutation {
        actualizarProducto(_id: String!, title: String, price: String, thumbnail: String) :  Producto  ,
    },
    type Producto {
        _id: String,
        title: String,
        price: String,
        thumbnail: String
    }    
`);

//actualizarProducto(id: String!, title: String, price:String, thumbnail: String): Producto,
module.exports = { schema }
/*
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
    createReview(episode: $ep, review: $review) {
      stars
      commentary
    }
  }

  mutation{updateProducto(_id:"60ed7758186ecd099113a486", 
  title: "Producto6", 
  price: "4330", 
  thumbnail: "6.jpg") {
  _id
  title
  price
  thumbnail
} }
*/