FROM node:10

COPY ./ ./
WORKDIR /client
RUN npm install
WORKDIR /shared
RUN npm install
WORKDIR /service
RUN npm install
RUN npm run build && npm install -g pm2 && (rm -f .env || true)

EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

