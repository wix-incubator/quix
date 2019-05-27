FROM keymetrics/pm2:10-alpine	

COPY ./ ./
WORKDIR /client
RUN npm install
WORKDIR /shared
RUN npm install
WORKDIR /service
RUN npm install && npm run build && (rm -f .env || true) && mkdir -p /logs

EXPOSE 3000
ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js"]

