var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

require('dotenv').config();
var cloudinary = require('cloudinary').v2;

var session = require('express-session');
var pool = require('./models/bd'); // realiza ruteo
var fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/admin/login'); // mi controlador
var novedadesRouter = require('./routes/admin/novedades');
var apiRouter = require('./routes/api');

var app = express();

// **Habilitar CORS en todas las rutas**
app.use(cors());

// **Configurar Cloudinary correctamente**
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// **Prueba de conexión con Cloudinary**
cloudinary.api.ping()
  .then(result => console.log("✅ Conexión exitosa a Cloudinary:", result))
  .catch(error => console.error("❌ Error en la conexión a Cloudinary:", error));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp'
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: 'Tesla3699',
  resave: false,
  saveUninitialized: true
}));

secured = async (req, res, next) => {
  try {
    console.log(req.session.id_usuario);
    if (req.session_usuario) {
      next();
    } else {
      res.redirect('/admin/login');
    }
  } catch (error) {
    console.log(error);
  }
};

/* Rutas */
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin/login', loginRouter); // mi controlador
app.use('/admin/novedades', novedadesRouter);
app.use('/api', apiRouter); // 🔥 `/api/contacto` ya es accesible sin problemas

/* Prueba de consulta server */
pool.query('select * from novedades_web').then(function (resultados) {
  console.log(resultados);
});

// catch 404 and forward to

module.exports = app;
