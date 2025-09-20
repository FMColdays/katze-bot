# Usa Node 20 en Debian slim
FROM node:20-bullseye-slim

# Instala ffmpeg para la música
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Carpeta de trabajo
WORKDIR /app

# Instala dependencias con caché de capas
COPY package*.json ./
RUN npm ci --omit=dev

# Copia el código
COPY . .

# Modo producción
ENV NODE_ENV=production
# (Opcional) Si quieres forzar ffmpeg del sistema:
# ENV FFMPEG_PATH=/usr/bin/ffmpeg

# Arranca el bot (sin --watch en producción)
CMD ["node", "src/index.js"]
