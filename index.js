import express from 'express';
import { createPool } from 'mysql2/promise'; 
import { Router } from 'express';

const app = express();
const router = Router(); // Inicializa el router

// ----------------------------------------------------
// 1. CONFIGURACIÓN EJS Y ARCHIVOS ESTÁTICOS
// ----------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', './views'); // Indica que las plantillas están en la carpeta 'views'

// 🛑 ORDEN CRÍTICO: Sirve archivos estáticos (CSS, JS, imágenes) ANTES que las rutas.
app.use(express.static('public')); 

// 🛑 ORDEN CRÍTICO: Usa el router global DESPUÉS de los archivos estáticos.
app.use(router); 
// ----------------------------------------------------


// ... [Código de logs] ...

// Función asíncrona para manejar la inicialización y la conexión
async function main() {
    try {
        // CONEXIÓN A LA BASE DE DATOS (ESPERA)
        const db = createPool({
            host: 'localhost',
            user:'root',
            password: '',
            database: 'closetfy_bd',
            port: '3306',
        });

        await db.query("SELECT 1"); 
        console.log('✅ Conexión a DB de Railway establecida con éxito.');

        // ----------------------------------------------------
        // 2. DEFINICIÓN DE RUTAS (AHORA DENTRO DE main Y USANDO 'db')
        // ----------------------------------------------------
        
        // Ruta raíz
        router.get("/", async(req,res)=>{
            // EJS busca './views/index.ejs'
            res.render('index', { titulo: "Bienvenido" });
        });
        
        // Ruta /users (EJS renderizado)
        router.get("/users", async (req, res) => {
             // 🛑 CORRECCIÓN: Usa await para obtener los datos
             const [rows] = await db.query("SELECT * FROM user"); 
             // EJS busca './views/users.ejs'
             res.status(200).render('users', { users: rows, title: `Lista de Usuarios`});
        });
        
        // Ruta /articulos (EJS renderizado)
        router.get("/articulos", async (req, res) => {
             const [rows] = await db.query("SELECT * FROM articulos"); 
             // EJS busca './views/articulos.ejs'
             res.status(200).render('articulos', { articulos: rows, title: `Inventario`});
        });


        // 3. INICIAR EL SERVIDOR (SOLO DESPUÉS DE LA CONEXIÓN EXITOSA)
        app.listen(3000, () => {
            console.log(`\n\n🎉 Servidor Express iniciado y escuchando en el puerto 3000`);
        });

    } catch (error) {
        console.error('\n\n❌ ERROR FATAL EN INICIALIZACIÓN:', error.message);
        process.exit(1); 
    }
}

main();