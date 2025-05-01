var pool = require('./bd'); 


async function getNovedades() {
    try {
        var query = 'SELECT id, `diseño` AS diseno, `valor-usd` AS valor_usd, opciones AS opciones, img_id FROM novedades_web';

        var rows = await pool.query(query);
        console.log("Novedades transformadas:", rows); 
        return rows;
    } catch (error) {
        console.log("Error obteniendo novedades:", error);
        throw error;
    }
}
async function insertNovedades(data) {
    try {
        console.log("Datos que se intentan insertar:", data);
        var query = 'INSERT INTO novedades_web (`Diseño`, `Valor-USD`, `Opciones`, `img_id`) VALUES (?, ?, ?, ?)';
        var rows = await pool.query(query, [data.Diseno, data.Valor_USD, data.Opciones, data.img_id]);
        
        return rows;
    } catch (error) {
        console.log("Error agregando novedad:", error); 
        throw error;
    }
}


async function deleteNovedadesById(id) {
    try {
        console.log("Id que se intenta eliminar:", id); 
        var query = 'DELETE FROM novedades_web WHERE id = ?';
        var rows = await pool.query(query, [id]); 
        console.log("Registro eliminado con éxito."); 
        return rows;
    } catch (error) {
        console.log("Error eliminando novedad:", error); 
        throw error;
    }
}
 

async function getNovedadesById(id) {
    const query = 'SELECT * FROM novedades_web WHERE id = ?';
    const rows = await pool.query(query, [id]);
    return rows[0];
}


async function modificarNovedadesById(obj, id) {
    const query = 'UPDATE novedades_web SET diseño = ?, `valor-usd` = ?, opciones = ?, img_id = ? WHERE id = ?';
    const rows = await pool.query(query, [obj.diseño, obj['valor-usd'], obj.opciones, obj.img_id, id]);
    return rows;
}


module.exports = { getNovedades, insertNovedades, deleteNovedadesById, getNovedadesById, modificarNovedadesById};

/*realizo prueba coneccion mi base de datos */
/*async function testConnection() {
    try {
        var query = 'SELECT * FROM novedades_web';
        var rows = await pool.query(query);
        console.log("Datos obtenidos:", rows);
    } catch (error) {
        console.log("Error conectando a la base de datos:", error);
    }
}

testConnection();*/