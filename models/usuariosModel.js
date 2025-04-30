var pool = require('./bd');
var md5 = require('md5');

async function getUserByUsernameAndPassword(user, password) {
    try {
        var query = 'SELECT Id AS id, Usuario AS usuario, Password AS password FROM usuarios WHERE usuario = ? AND password = ? LIMIT 1';

        var rows = await pool.query(query, [user, md5(password)]);
        console.log("Resultado de la consulta SQL:", rows); // Depuración
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.log("Error en consulta de usuario:", error);
        return null;
    }
}

module.exports = { getUserByUsernameAndPassword};
/*testeo con mi base de datos */
/*async function testDatabaseConnection() {
    try {
        var query = 'SELECT * FROM usuarios LIMIT 1';
        var rows = await pool.query(query);
        console.log("Test de conexión:", rows);
    } catch (error) {
        console.log("Error en conexión a la base de datos:", error);
    }
}

testDatabaseConnection();
 */