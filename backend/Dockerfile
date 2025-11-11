FROM node:24-trixie

WORKDIR /app

# Proxy/SSL opcionales para builds detrás de proxy
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ARG INSECURE_SSL=false
ENV HTTP_PROXY=$HTTP_PROXY \
	HTTPS_PROXY=$HTTPS_PROXY \
	NO_PROXY=$NO_PROXY

# Copiar archivos de dependencias
COPY package*.json ./

# Configurar npm (reintentos/registro/proxy) e instalar dependencias
RUN npm config set fund false \
 && npm config set audit false \
 && npm config set progress false \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set registry https://registry.npmjs.org \
 && if [ -n "$HTTP_PROXY" ]; then npm config set proxy "$HTTP_PROXY"; fi \
 && if [ -n "$HTTPS_PROXY" ]; then npm config set https-proxy "$HTTPS_PROXY"; fi \
 && if [ "$INSECURE_SSL" = "true" ]; then npm config set strict-ssl false; fi \
 && npm install --production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "start"]
