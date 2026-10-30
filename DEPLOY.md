# Publicar el gestor

## Acceso desde cualquier red

El proyecto incluye `render.yaml` para desplegar el servidor en Render. Para publicarlo:

1. Sube los cambios de esta carpeta al repositorio conectado a GitHub.
2. En Render, crea un servicio con `New > Blueprint` y selecciona ese repositorio.
3. Confirma el despliegue. El Blueprint genera `SHARED_ACCESS_KEY` automáticamente.
4. En Render, abre `Environment`, revela y copia el valor de `SHARED_ACCESS_KEY`.
5. Abre `https://<dominio-del-servicio>/gestor.html#access=<clave>` y comparte esa misma URL con tus colaboradores.

La clave forma parte del enlace: cualquiera que lo reciba podrá ver y modificar los proyectos. No publiques el enlace en lugares abiertos. El endpoint de datos exige esa clave y `data.json` no se sirve como archivo público.

El servicio gratuito puede suspenderse cuando no recibe tráfico. Además, su sistema de archivos no es persistente tras reinicios o despliegues; usa una base de datos persistente antes de guardar información importante.

## Trabajo sin conexión

Abre el enlace con internet al menos una vez en cada dispositivo para que el navegador guarde la aplicación. Después, los cambios hechos offline se conservan en ese navegador y se sincronizan al reconectar. Las ediciones simultáneas del mismo proyecto no tienen resolución avanzada de conflictos.

## Prueba local

```bash
SHARED_ACCESS_KEY=una-clave-local npm start
```

Abre `http://localhost:3000/gestor.html#access=una-clave-local` y comprueba `http://localhost:3000/health`.
