import express from 'express';
import { createPool } from 'mysql2/promise'; 
import { Router } from 'express';

const app = express();
const router = Router();
app.use(router); 
app.use(express.static('public')); 

app.set('view engine', 'ejs');
app.set('views', './views');

// Función asíncrona para manejar la inicialización y la conexión
async function main() {
    try {
        // 1. CONEXIÓN A LA BASE DE DATOS (ESPERA A QUE EL POOL ESTÉ LISTO)
        const db = createPool({
            // Los valores se leen de las variables de entorno de Railway
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
        });

        // Verificación de Conexión
        await db.query("SELECT 1"); 
        console.log('✅ Conexión a DB de Railway establecida con éxito.');
        
        // 2. DEFINICIÓN DE RUTAS (Ahora pueden usar await db.query)
        
        // Ruta raíz
        router.get("/", async(req,res)=>{
            res.render('index', { titulo: "🎉 ¡Bienvenido a mi Servidor Web!" });
        });
        
        // Ruta /users (con await corregido)
        router.get("/users", async (req, res) => {
             const [rows] = await db.query("SELECT * FROM user"); 
             res.status(200).render('users', { users: rows, title: `Lista de Usuarios (${rows.length})`});
        });
        
        // Ruta /articulos (con await corregido)
        router.get("/articulos", async (req, res) => {
             const [rows] = await db.query("SELECT * FROM articulos"); 
             res.status(200).render('articulos', { articulos: rows, title: `Inventario de Artículos (${rows.length})`});
        });


        // 3. INICIAR EL SERVIDOR (SOLO SI LA CONEXIÓN FUE EXITOSA)
        app.listen(3000, () => {
            console.log(`\n\n🎉 Servidor Express iniciado y escuchando en el puerto 3000`);
            console.log(`Dominio público: [Tu Dominio Railway]`);
        });

    } catch (error) {
        console.error('\n\n❌ ERROR FATAL EN INICIALIZACIÓN:', error.message);
        console.error('El servidor no pudo iniciar. Revisa las variables de entorno (DB_HOST, etc.).');
        process.exit(1); 
    }
}

main();