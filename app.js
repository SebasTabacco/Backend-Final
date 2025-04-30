var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

require('dotenv').config();

var session = require('express-session');
var pool = require('./models/bd'); // realiza ruteo
var fileUpload = require('express-fileupload');

// Importa cloudinary antes de usarlo
const cloudinary = require('cloudinary').v2;

// Configura cloudinary después de la importación
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
//prueba de Ping en cloudinary
cloudinary.api.ping()
    .then(result => console.log("Conexión exitosa a Cloudinary:", result))
    .catch(error => console.error("Error en la conexión a Cloudinary:", error));


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/admin/login'); // mi controlador
var adminRouter = require('./routes/admin/novedades');
var novedadesRouter = require('./routes/admin/novedades');
var apiRouter = require('./routes/api')

var app = express();

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
app.use('/api', cors(), apiRouter);


/* Prueba de consulta server */
/*pool.query('select * from novedades_web').then(function (resultados) {
  console.log(resultados)
});*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
