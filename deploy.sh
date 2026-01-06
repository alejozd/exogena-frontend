#!/bin/bash

# Script de despliegue para Exogena-Frontend

echo "🚀 Iniciando despliegue de Exogena-Frontend..."

# Navega a la carpeta del frontend
cd /var/www/exogena/exogena-frontend || { echo "❌ ERROR: No se pudo acceder a la carpeta"; exit 1; }

# Detiene ejecución si hay un error
set -e

# 1. Actualiza el código desde GitHub
echo "📥 git pull..."
# Ajustamos a 'main' que es el estándar actual, cámbialo a 'master' si usas esa rama
git pull origin main

# 2. Instala dependencias
echo "📦 npm install..."
npm install

# 3. Construye el frontend
echo "🔨 npm run build..."
# Vite genera por defecto la carpeta 'dist'
npm run build

# 4. Preparar archivos para Apache
# Si tu configuración de Apache apunta a la carpeta 'build', renombramos 'dist'
echo "🗂️ Actualizando carpeta de producción..."
rm -rf build
mv dist build

# 5. Permisos (Opcional pero recomendado para evitar errores 403 en Apache)
echo "🔑 Ajustando permisos..."
chmod -R 755 build

# 6. Reinicia Apache
echo "🔄 Reiniciando Apache..."
sudo systemctl reload apache2

echo "✅ Despliegue de Exogena-Frontend completado con éxito!"