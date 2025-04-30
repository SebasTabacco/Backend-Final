var express = require('express');
var router = express.Router();
var usuariosModel = require('./../../models/usuariosModel');

router.get('/', function(req, res, next) {
  res.render('admin/login', {
    layout: 'admin/layout'
  });
});

router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.render('admin/login', {
    layout: 'admin/layout'
  });
});//cierro mi logout


router.post('/', async (req, res, next) => {
  try {
    var usuario = req.body.usuario;
    var password = req.body.password;

    var data = await usuariosModel.getUserByUsernameAndPassword(usuario, password);

    if (data) {
      req.session.id_usuario = data.id;
      req.session.nombre = data.usuario;
      
      

      console.log("Usuario autenticado:", req.session.Usuario); // Depuración

      res.redirect('/admin/novedades');
    } else {
      res.render('admin/login', {
        layout: 'admin/layout',
        error: true
      });
    }
  } catch (error) {
    console.log("Error en autenticación:", error);
    res.render('admin/login', {
      layout: 'admin/layout',
      error: "Error interno, intenta nuevamente."
    });
  }
});





module.exports = router;


