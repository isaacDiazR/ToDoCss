# 🎮 Pixel Todo App

Una aplicación de gestión de tareas con estilo **pixel art gaming** y colores RGB neón.

## 🚀 Funcionalidades

- ✅ **CRUD Completo**: Crear, listar, editar, eliminar y completar tareas
- 📱 **Responsive**: Se adapta a móviles, tablets y desktop
- 🔄 **Filtros**: Ver todas, pendientes o completadas
- 📊 **Estadísticas**: Contador de tareas totales, completadas y pendientes

## 🛠️ Tecnologías

- **HTML5** - Estructura
- **CSS3** - Estilos pixel art gaming
- **JavaScript** - Lógica de la aplicación

## 🌐 API

La app consume la API REST: `https://todoapitest.juansegaliz.com/todos`

### Endpoints utilizados:
- `GET /todos` - Obtener todas las tareas
- `POST /todos` - Crear nueva tarea
- `PUT /todos/{id}` - Actualizar tarea
- `DELETE /todos/{id}` - Eliminar tarea

## 🎯 Uso

1. Las tareas se cargan automáticamente desde la API
2. Crea, edita, completa o elimina tareas usando la interfaz
3. Usa los filtros para organizar tu vista

## 🎨 Características Visuales

- Paleta de colores gaming (cyan, magenta, verde matrix)
- Efectos glow y animaciones suaves
- Tipografía pixel "Press Start 2P"
- Interfaz intuitiva con feedback visual

## 🐳 Docker

### Requisitos previos
- Docker
- Docker Compose

### Instalación y uso

#### Opción 1: Usando el script de ayuda (Windows)
```powershell
# Construir la imagen
.\docker-helper.ps1 build

# Iniciar en producción (puerto 3000)
.\docker-helper.ps1 start

# Iniciar en desarrollo (puerto 8080)
.\docker-helper.ps1 dev

# Ver estado
.\docker-helper.ps1 status

# Ver logs
.\docker-helper.ps1 logs

# Detener
.\docker-helper.ps1 stop

# Limpiar todo
.\docker-helper.ps1 clean
```

#### Opción 2: Comandos Docker directos
```bash
# Construir y iniciar en producción
docker-compose up -d todo-app

# Construir y iniciar en desarrollo
docker-compose --profile development up -d todo-dev

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Puertos
- **Producción**: http://localhost:3000
- **Desarrollo**: http://localhost:8080

### Características Docker
- ✅ Imagen optimizada con Nginx Alpine
- ✅ Configuración de headers de seguridad
- ✅ Cache de assets estáticos
- ✅ Modo desarrollo con hot reload
- ✅ Red interna para futuras extensiones

---