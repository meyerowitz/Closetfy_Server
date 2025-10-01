import express from 'express';
import {createPool} from 'mysql2/promise';
import {Router} from 'express';

console.log('\n╔════════════════════════════╗')
console.log('║ Closetfy _ Mysql _ Server  ║')
console.log('╚════════════════════════════╝\n')
const app = express();

app.set('view engine', 'ejs');

app.set('views', './views'); // Esto busca las plantillas en una carpeta llamada 'views'


const db = createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   port: process.env.DB_PORT,
});

app.listen(3000)

console.log('  ---> Server is listened at port 3.000')


console.log('\n\n Restarting routers.get Post etc')

const router = Router();

app.use(router);
app.use(express.static('public'));


router.get("/", async(req,res)=>{
    console.log("Conexión a la página de inicio exitosa");
    
    // Usamos res.render() para enviar la plantilla 'index.ejs'
    res.render('index', { 
        titulo: "🎉 ¡Bienvenido a mi Servidor Web!" // Estos datos se pasan a la plantilla
    });
} )

router.get("/ping", async (req,res)=>{
    const result = db.query("SELECT * FROM user;");
    console.log("usuarios: "+result)
    res.json(result)
})

router.get("/users", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM user"); 

        if (rows.length === 0) {
            // Si no hay usuarios, puedes renderizar una vista de "sin resultados"
            // o usar la vista principal y pasarle una lista vacía.
            console.log("No se encontraron usuarios en la base de datos.");
            return res.render('users', { 
                users: [],
                title: "Lista de Usuarios (0 Encontrados)"
            });
        }
        
        // 3. RESPONDER CON LA VISTA EJS Y PASAR LOS DATOS (rows)
        console.log(`Se encontraron ${rows.length} usuarios.`);
        res.status(200).render('users', {
            users: rows, // <-- Aquí le pasamos la lista de usuarios
            title: `Lista de Usuarios (${rows.length})`
        });

    } catch (error) {
        // 4. Manejar cualquier error de la base de datos
        console.error("Error al obtener usuarios:", error);
        res.status(500).render('error', { // Podrías tener una vista 'error.ejs'
            message: "Error interno del servidor al consultar la base de datos."
        });
    }
});

// Este código debe ir en tu archivo de rutas (ej. routes/articulos.js)
router.get("/articulos", async (req, res) => {
    try {
        // 1. Ejecutar la consulta a la base de datos
        // NOTA: Asegúrate de que tu tabla se llame 'articulos' en tu DB.
        const [rows] = await db.query("SELECT * FROM articulos"); 

        if (rows.length === 0) {
            // Si no hay artículos, renderiza la vista con una lista vacía
            console.log("No se encontraron artículos en la base de datos.");
            return res.render('articulos', { 
                articulos: [], // Lista vacía para que el EJS muestre el placeholder
                title: "Inventario de Artículos (0 Encontrados)"
            });
        }
        
        // 2. Responder con la vista EJS y pasar los datos (rows)
        console.log(`Se encontraron ${rows.length} artículos.`);
        res.status(200).render('articulos', {
            articulos: rows, // <-- Aquí pasamos la lista para el carrusel EJS
            title: `Inventario de Artículos (${rows.length})`
        });

    } catch (error) {
        // 3. Manejar cualquier error de la base de datos
        console.error("Error al obtener artículos:", error);
        res.status(500).render('error', {
            message: "Error interno del servidor al consultar la base de datos para los artículos."
        });
    }
});