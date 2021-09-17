const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const productos = require('./api/productos');
const Mensajes = require('./api/mensajes')
const handlebars = require('express-handlebars')
const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
const normalize = require('normalizr').normalize;
const schema = require('normalizr').schema;
const session = require('express-session');
const cluster = require('cluster')
const { fork } = require('child_process');
const numCPUs = require('os').cpus().length
const compression = require('compression');
const Sms = require('./mensajeria/sms')
const log4js = require("log4js");

const loggerConsola = log4js.getLogger('consola');
const loggerWarn = log4js.getLogger('warn');
const loggerError = log4js.getLogger('error');

// ROUTERS
const productosRouter = require('./routes/productos')
const mensajesRouter = require('./routes/mensajes')
const usuarioRouter = require('./routes/users')
const infoRandomRouter = require('./routes/infoRandom')
// USAR ROUTERS
app.use('/api/productos', productosRouter);
app.use('/api/mensajes', mensajesRouter);
app.use('/', usuarioRouter)
app.use('/', infoRandomRouter)

//CONECTAR CON MONGOOSE A LA DB DE MONGO
require('./database/connection');

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: false
}));

// -------------------------------------CLUSTER--------------------------------------------------------
const modoCluster = process.argv[3] == 'cluster'

if (modoCluster && cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', worker => {
        console.log('Worker', worker.process.pid, 'murió', new Date().toLocaleString())
        cluster.fork()
    })
} else {
    app.get('/info', (req, res) => {
        let informacion = {}
        informacion['Argumentos de entrada:'] = `${process.argv[2]} ${process.argv[3]} ${process.argv[4]} ${process.argv[5]}`;
        informacion['Nombre de plataforma:'] = process.platform;
        informacion['Version de Node:'] = process.version;
        informacion['Uso de memoria:'] = process.memoryUsage();
        informacion['Path de ejecucion:'] = process.execPath;
        informacion['Process id:'] = process.pid;
        informacion['Carpeta corriente:'] = process.cwd();
        informacion['Numero de procesadores'] = numCPUs
        informacion['Puerto'] = process.argv[2]

        res.send(JSON.stringify(informacion, null, 4))
    })
}

// ARCHIVOS ESTÁTICOS
app.use(express.static('public'));

//CONFIGURAR HANDLEBARS
app.engine('hbs', handlebars({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts'
}));

// ESTABLECER MOTOR DE PLANTILLAS
app.set("view engine", "hbs");
// DIRECTORIO ARCHIVOS PLANTILLAS
app.set("views", "./views");


// DATOS CHAT
const messages = [
    {
        autor: {
            email: "juan@gmail.com",
            nombre: "Juan",
            apellido: "Perez",
            edad: 25,
            alias: "Juano",
            avatar: "http://fotos.com/avatar.jpg"
        },
        texto: '¡Hola! ¿Que tal?'
    }
];

// SE EJECUTA AL REALIZAR LA PRIMERA CONEXION
io.on('connection', async socket => {
    loggerConsola.info('Usuario conectado')


    // GUARDAR PRODUCTO
    socket.on('nuevo-producto', nuevoProducto => {

        // console.log(nuevoProducto)
        productos.guardar(nuevoProducto)
    })
    // VERIFICAR QUE SE AGREGA UN PRODUCTO
    socket.emit('guardar-productos', () => {
        socket.on('notificacion', data => {
            console.log(data)
        })
    })
    // ACTUALIZAR TABLA
    socket.emit('actualizar-tabla', await productos.listar())

    // GUARDAR Y MANDAR MENSAJES QUE LLEGUEN DEL CLIENTE
    socket.on("new-message", async function (data) {


        if (data.texto.includes('administrador')) {         
            Sms.enviarSMS(data.autor.alias, data.texto)
        }
        await Mensajes.guardar(data)

        let mensajesDB = await Mensajes.getAll()

        const autorSchema = new schema.Entity('autor', {}, { idAttribute: 'nombre' });

        const mensajeSchema = new schema.Entity('texto', {
            autor: autorSchema
        }, { idAttribute: '_id' })

        const mensajesSchema = new schema.Entity('mensajes', {
            msjs: [mensajeSchema]
        }, { idAttribute: 'id' })

        const mensajesNormalizados = normalize(mensajesDB, mensajesSchema)

        messages.push(mensajesDB);

        loggerConsola.info(mensajesDB)

        loggerConsola.info(mensajesNormalizados)

        io.sockets.emit("messages", mensajesNormalizados);
    });
});

// pongo a escuchar el servidor en el puerto indicado
// definir puerto por linea de comandos
let puerto = 0
if (process.argv[2] && !isNaN(process.argv[2])) {
    puerto = process.argv[2]
} else if (isNaN(process.argv[2])) {
    loggerWarn.warn('No se ingresó un puerto válido, se usará el 8080')
    puerto = 8080
}


// USO server PARA EL LISTEN
const svr = server.listen(puerto, () => {
    loggerConsola.info(process.argv)
    loggerConsola.info(`servidor escuchando en http://localhost:${puerto}`)
});


// en caso de error, avisar
server.on('error', error => {
    loggerError.error('error en el servidor:', error)
});
