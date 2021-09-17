require('dotenv').config()
const express = require('express');
const productos = require('../api/productos') 
const Faker = require('../models/faker');
const log4js = require("log4js");
var { graphqlHTTP } = require('express-graphql');
const schema = require('../models/productosGraphQL').schema

// const loggerConsola = log4js.getLogger('consola');
// const loggerWarn = log4js.getLogger('warn');
const loggerError = log4js.getLogger('error');

const routerProductos = express.Router()

// VISTA-TEST ** FAKER **
routerProductos.get('/vista-test/', (req, res) => {
    res.render('vista', { hayProductos: true, productos: Faker.generarProductos(10) })
})

routerProductos.get('/vista-test/:cant', (req, res) => {
    let cantidad = req.params.cant
    res.render('vista', { hayProductos: true, productos: Faker.generarProductos(cantidad) })
})

// LISTAR PRODUCTOS
routerProductos.get('/listar', async (req, res) => {
    try {
        let result = await productos.listar();
        return res.json(result);
    } catch (error) {
        loggerError.error(error)
        return res.status(500).send({ error: error.message });
    }
})

// LISTAR PRODUCTOS POR ID
routerProductos.get('/listar/:id', async (req, res) => {

    try {
        let mensajeLista = await productos.listarPorId(req.params.id);
        res.json(mensajeLista)
    } catch (error) {
        loggerError.error(error)
        return res.status(500).send({ error: error.message });
    }
})

// GUARDAR PRODUCTO
routerProductos.post('/guardar', async (req, res) => {
    try {
        let nuevoProducto = {};
        nuevoProducto.title = req.body.title;
        nuevoProducto.price = req.body.price;
        nuevoProducto.thumbnail = req.body.thumbnail;
        await productos.guardar(nuevoProducto)
        res.json(nuevoProducto)
    } catch (error) {
        loggerError.error(error)
        return res.status(500).send({ error: error.message });
    }
})

//ACTUALIZAR PRODUCTO POR ID
routerProductos.put('/actualizar/:id', async (req, res) => {
    try {
        let nuevoProducto = await productos.actualizar(req.params.id, req.body);
        res.json(nuevoProducto);
    } catch (error) {
        loggerError.error(error)
        return res.status(500).send({ error: error.message });
    }
})

// BORRAR PRODUCTO POR ID
routerProductos.delete('/borrar/:id', async (req, res) => {
    let productoBorrado = await productos.borrar(req.params.id);
    return res.json(productoBorrado);
})


// FUNCIONES GRAPHQL
const buscar = async function () {
    return await productos.listar()
}
const actualizar = async function (nuevoProducto) {
    console.log(JSON.stringify(prod))
    return await productos.actualizar(nuevoProducto.id, nuevoProducto)
}
var root = {
    buscar: buscar,
    updateProducto: actualizar,
};

routerProductos.use('/graphql', graphqlHTTP({
	schema: schema,
	rootValue: root,
	graphiql: true
}))


module.exports = routerProductos;