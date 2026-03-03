# ---------- STAGE 1: Build ----------
FROM node:20-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y lockfile primero (mejor cache)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la app
RUN npm run build


# ---------- STAGE 2: Production ----------
FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario desde builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.ts ./vite.config.ts

ENV NODE_ENV=production

EXPOSE 3005

CMD ["npm", "run", "preview"]