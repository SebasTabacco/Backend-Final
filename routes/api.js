var express = require('express');
var router = express.Router();
var novedadesModel = require('./../../back/models/novedadesModel');
var cloudinary = require('cloudinary').v2;



router.get('/novedades', async function (req, res, next) {
    try {
        var novedades = await novedadesModel.getNovedades();

        // Procesar cada novedad para incluir la propiedad "imagen"
        novedades = novedades.map(novedad => ({
            ...novedad,
            imagen: novedad.img_id 
                ? cloudinary.image(novedad.img_id, {
                    width: 100,
                    height: 100,
                    crop: 'fill'
                })
                : 'IMAGEN NO DISPONIBLE' // Imagen predeterminada
        }));

        console.log("Datos enviados a la vista:", novedades); // Depuración
        res.render('admin/novedades', {
            layout: 'admin/layout',
            persona: req.session.nombre,
            novedades
        });
    } catch (error) {
        console.log("Error mostrando novedades:", error);
        res.render('admin/novedades', {
            layout: 'admin/layout',
            persona: req.session.nombre,
            error: "Error cargando las novedades"
        });
    }
    res.json(novedades);
});



module.exports = router;