#!/bin/bash

set -e  # Si algo falla, el script se detiene

echo "========================================="
echo "🚀 INICIANDO DEPLOY - $(date)"
echo "========================================="

echo ""
echo "📥 1. Haciendo git fetch..."
git fetch origin
echo "✅ git fetch completado"

echo ""
echo "🔄 2. Reseteando a origin/main..."
git reset --hard origin/main
echo "✅ Código actualizado a origin/main"

echo ""
echo "📦 3. Instalando dependencias (npm install --force)..."
npm install --force
echo "✅ Dependencias instaladas"

echo ""
echo "🏗️ 4. Ejecutando build..."
npm run build
echo "✅ Build completado"

echo ""
echo "♻️ 5. Reiniciando proceso PM2 (matudb)..."
pm2 restart matudb
echo "✅ PM2 reiniciado"

echo ""
echo "========================================="
echo "🎉 DEPLOY FINALIZADO - $(date)"
echo "========================================="
