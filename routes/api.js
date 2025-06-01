var express = require('express');
var router = express.Router();
var novedadesModel = require('./../../back/models/novedadesModel');
var cloudinary = require('cloudinary').v2;
var nodemailer = require('nodemailer');
require('dotenv').config(); // Cargar variables desde `.env`



router.get('/novedades', async function (req, res, next) {
    try {
        var novedades = await novedadesModel.getNovedades();

        novedades = novedades.map(novedad => {
            console.log("Procesando novedad:", novedad); // 🔥 Verifica cada novedad
            console.log("ID de imagen:", novedad.img_id); // 🔥 Verifica si img_id existe

            return {
                ...novedad,
                imagen: novedad.img_id 
                    ? cloudinary.url(novedad.img_id, {
                        width: 250,
                        height: 250,
                        crop: 'fill'
                    })
                    : 'IMAGEN NO DISPONIBLE'
            };
        });

        console.log("Novedades con imágenes generadas:", novedades); // 🔥 Verifica el JSON final
        res.json(novedades);
    } catch (error) {
        console.error("❌ Error mostrando novedades:", error);
        res.status(500).json({ error: "Error cargando las novedades." });
    }
});


// **RUTA PARA ENVIAR EL FORMULARIO AL BACKEND**
router.post('/contacto', async (req, res) => {
    console.log("Datos recibidos en backend:", req.body); // Verificar qué llega desde el frontend

    const { nombre, email, comentario, telefono } = req.body;

    if (!nombre || !email || !comentario || !telefono) {
        return res.status(400).json({ error: true, message: "Todos los campos son obligatorios." });
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 2525,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: "nucleosweb9@gmail.com",
        subject: "Contacto Web",
        html: `
            <p><strong>${nombre}</strong> ha contactado a través de la web.</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Comentario:</b> ${comentario}</p>
            <p><b>Teléfono:</b> ${telefono}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(201).json({ error: false, message: "Mensaje enviado exitosamente." });
    } catch (error) {
        console.error("Error al enviar el correo:", error.message);
        res.status(500).json({ error: true, message: "Hubo un problema al enviar el correo." });
    }
});

module.exports = router;