#!/bin/bash

# Script de instalación del backend Tactika-X
# Ejecutar desde /home/allanb/tactika-x

echo "🚀 Instalando Tactika-X Backend..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "app" ]; then
  echo "❌ Error: Ejecutar este script desde /home/allanb/tactika-x"
  exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
cd api
pnpm install

# Copiar archivo de entorno
if [ ! -f ".env" ]; then
  echo "📝 Creando archivo .env..."
  cp .env.example .env
  echo "⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales de PostgreSQL"
else
  echo "✅ Archivo .env ya existe"
fi

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
pnpm prisma:generate

echo ""
echo "✅ Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Edita el archivo api/.env con tus credenciales de PostgreSQL"
echo "  2. Asegúrate de tener PostgreSQL corriendo"
echo "  3. Ejecuta: cd api && pnpm prisma:migrate"
echo "  4. (Opcional) Ejecuta: pnpm prisma:seed para datos de prueba"
echo "  5. Inicia el servidor: pnpm dev"
echo ""
