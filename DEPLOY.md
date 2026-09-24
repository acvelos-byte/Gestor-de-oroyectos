# Publicar el gestor

## Opcion gratuita

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta.
2. Entra en Render y elige `New > Blueprint`.
3. Selecciona el repositorio y confirma `render.yaml`.
4. Render asignara una URL publica parecida a:
   `https://gestor-de-proyectos-publico.onrender.com/gestor.html`

La URL de Render es publica y se puede compartir. El servicio gratuito puede dormirse cuando no recibe trafico y volvera a arrancar al abrirlo.

## Persistencia

El archivo `data.json` sirve para pruebas y despliegues simples. En el plan gratuito de Render, el disco local no es persistente tras reinicios o nuevos despliegues. Para datos importantes, conecta la API a una base de datos gratuita, por ejemplo Supabase o Neon, antes de usarla como sistema definitivo.

## Prueba local

```bash
npm start
```

Luego abre `http://localhost:3000/gestor.html` y comprueba `http://localhost:3000/health`.
