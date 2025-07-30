# Silvifrid Catalog API

Este repositorio contiene una API REST para el manejo de un catálogo de productos. Está desarrollada con Node.js, Express y MongoDB (Mongoose). El propósito principal es permitir que desarrolladores gestionen productos en una base de datos de manera sencilla y segura.

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/nelrsf/silvifrid-catalog.git
   cd silvifrid-catalog
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura tus variables de entorno en un archivo `.env`:
   ```
   DB_CONNECTION=mongodb://usuario:contraseña@host:puerto/base_de_datos
   PORT=3000
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```
   El servidor escuchará en el puerto configurado por `PORT`.

## Endpoints principales

### Obtener todos los productos

- **GET** `/getproducts`
- **Respuesta:** Array de productos en formato JSON.

```json
[
  {
    "nombre": "Producto Ejemplo",
    "descripcion": "Descripción del producto",
    "categoria": "Categoría",
    "precio": 100,
    "cantidad": 10
  }
]
```

### Obtener producto por ID

- **GET** `/getproducts/:id`
- **Parámetro:** `id` del producto (ObjectId de MongoDB).
- **Respuesta:** El producto correspondiente, o un mensaje de error si no existe.

### Crear un producto

- **POST** `/createproduct`
- **Protegido por autenticación** (requiere middleware de autenticación).
- **Body ejemplo:**
```json
{
  "nombre": "Nuevo Producto",
  "descripcion": "Descripción...",
  "categoria": "Categoría",
  "precio": 150,
  "cantidad": 5
}
```
- **Respuesta:** `201 Ok` si se crea correctamente.

## Modelo de Producto

```js
{
  nombre: String,        // requerido
  descripcion: String,   // requerido
  categoria: String,     // requerido
  precio: Number,        // requerido
  cantidad: Number       // requerido
}
```

## Seguridad

- El endpoint de creación (`POST /createproduct`) requiere autenticación mediante el guard `authGuard`. Puedes personalizar este middleware en `guards/authGuard.js`.

## Testing

El repositorio incluye pruebas en la carpeta `__tests__` para los endpoints principales utilizando Jest y Supertest.

## Contribuciones

1. Haz un fork del repositorio.
2. Crea una rama para tu feature/fix.
3. Haz tus cambios y prueba localmente.
4. Haz un pull request describiendo tu aporte.

## Licencia

MIT

---

**Contacto**: Para dudas o soporte, abre un issue en este repositorio.
