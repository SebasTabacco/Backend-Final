var express = require('express');
var router = express.Router();
var novedadesModel = require('./../../models/novedadesModel'); // Importar modelo

var util = require('util');
const cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload);
const destrey = util.promisify(cloudinary.uploader.destroy);

// Ruta para mostrar el listado de novedades
router.get('/', async function (req, res, next) {
    try {
        var novedades = await novedadesModel.getNovedades();

        // Procesar cada novedad para incluir la propiedad "imagen"
        novedades = novedades.map(novedad => ({
            ...novedad,
            imagen: novedad.img_id 
                ? cloudinary.image(novedad.img_id, {
                    width: 90,
                    height: 80,
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
});


/*mostrar agregar */
router.get('/agregar', (req, res, next) => {
    res.render('admin/agregar', {//agregar.hbs
        layout: 'admin/layout'
    });
});

router.post('/agregar', async (req, res, next) => {
    console.log("Datos recibidos del formulario:", req.body); // Verificar qué datos llegan

    try {

        var img_id = '';
        if (req.files && req.files.imagen) {
            const imagen = req.files.imagen;
            console.log("Archivo recibido:", imagen);
            img_id = (await uploader(imagen.tempFilePath)).public_id; // Correctamente configurado
            console.log("Imagen subida con éxito, img_id:", img_id);
        } else {
            console.log("No se recibió ningún archivo para subir.");
        }
        
        // Validar que todos los campos tengan valores
        if (req.body.disenio && req.body.Valor_USD && req.body.Opciones) {
            await novedadesModel.insertNovedades({
                ...req.body,
                img_id
            }); // Insertar en la base de datos
            res.redirect('/admin/novedades'); // Redirigir al listado
        } else {
            res.render('admin/agregar', {
                layout: 'admin/layout',
                error: true,
                message: 'Todos los campos son requeridos' // Mostrar error si hay campos vacíos
            });
        }
    } catch (error) {
        console.log("Error al guardar la novedad:", error);
        res.render('admin/agregar', {
            layout: 'admin/layout',
            error: true,
            message: 'No se pudo agregar la novedad' // Mostrar mensaje de error
        });
    }
});

/*eliminar */
router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new Error("Id no proporcionado o inválido");
        }

        console.log("Id recibido para eliminar:", id); // Depuración

        // Obtener la novedad por ID para acceder a su img_id
        const novedad = await novedadesModel.getNovedadesById(id);

        if (novedad.img_id) { 
            console.log("Eliminando imagen de Cloudinary, img_id:", novedad.img_id);
            await cloudinary.uploader.destroy(novedad.img_id); // Eliminar imagen de Cloudinary
        }

        // Eliminar los datos de la base de datos
        await novedadesModel.deleteNovedadesById(id);

        console.log("Novedad eliminada con éxito."); // Confirmación
        res.redirect('/admin/novedades'); // Redirigir al listado
    } catch (error) {
        console.log("Error al eliminar la novedad:", error); // Registro del error
        res.render('admin/novedades', {
            layout: 'admin/layout',
            error: true,
            message: 'No se pudo eliminar la novedad.'
        });
    }
});


/*controlador para editar una sola novedad */

router.get('/modificar/:id', async (req, res, next) => {
    var id = req.params.id;
    console.log(req.params.id);
    var novedades = await novedadesModel.getNovedadesById(id);

    res.render('admin/modificar', {
        layout: 'admin/layout',
        novedades
    })
});

// Ruta GET para mostrar el formulario de modificación
router.get('/modificar/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const novedad = await novedadesModel.getNovedadesById(id);

        // Asignar imagen predeterminada si no hay img_id
        novedad.imagen = novedad.img_id 
            ? cloudinary.url(novedad.img_id, { width: 100, height: 100, crop: 'fill' })
            : '/images/no/nofoto.png'; // Ruta de imagen predeterminada

        res.render('admin/modificar', {
            layout: 'admin/layout',
            novedades: novedad
        });
    } catch (error) {
        console.error('Error al cargar la novedad para modificar:', error);
        res.render('admin/modificar', {
            layout: 'admin/layout',
            error: true,
            message: 'Error al cargar la novedad.'
        });
    }
});


// Ruta POST para modificar la novedad
router.post('/modificar', async (req, res, next) => {
    try {
        let img_id = req.body.img_original; // Mantener la imagen original por defecto
        let borrar_img_vieja = false; // Bandera para borrar imagen vieja

        // Verificar si el usuario seleccionó eliminar la imagen actual
        if (req.body.img_delete === "1") { 
            img_id = null; // Eliminar la referencia al img_id
            borrar_img_vieja = true;
        } else if (req.files && req.files.imagen) { // Verificar si hay una nueva imagen
            const imagen = req.files.imagen;
            img_id = (await uploader(imagen.tempFilePath)).public_id; // Subir nueva imagen
            borrar_img_vieja = true;
        }

        // Eliminar la imagen vieja en Cloudinary si es necesario
        if (borrar_img_vieja && req.body.img_original) {
            await cloudinary.uploader.destroy(req.body.img_original);
        }

        // Crear objeto con los datos a actualizar
        const obj = {
            disenio: req.body.disenio,
            'valor-usd': req.body['valor-usd'],
            opciones: req.body.opciones,
            img_id // Actualizar img_id en la base de datos
        };

        // Actualizar la novedad en la base de datos
        await novedadesModel.modificarNovedadesById(obj, req.body.id);

        // Redirigir al listado
        res.redirect('/admin/novedades');
    } catch (error) {
        console.error('Error al modificar la novedad:', error);
        res.render('admin/modificar', {
            layout: 'admin/layout',
            error: true,
            message: 'Error al modificar la novedad.'
        });
    }
});

module.exports = router;