# Usar Node.js Alpine como base
FROM node:alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY . .

# Instalar http-server globalmente
RUN npm install -g http-server

# Exponer el puerto 8080
EXPOSE 8080

# Comando para servir los archivos estáticos
CMD ["http-server", ".", "-p", "8080", "-a", "0.0.0.0", "--cors"]