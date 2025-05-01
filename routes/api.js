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
                ? cloudinary.url(novedad.img_id, {
                    width:250,
                    height: 250,
                    crop: 'fill'
                    
                })
                : 'IMAGEN NO DISPONIBLE'
        }));
        
        console.log("Datos enviados:", novedades); 

        // Enviar respuesta JSON exclusivamente para el frontend
        res.json(novedades);
    } catch (error) {
        console.error("Error mostrando novedades:", error);
        res.status(500).json({ error: "Error cargando las novedades" });
    }
});




module.exports = router;