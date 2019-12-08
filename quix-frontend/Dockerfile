FROM node:10-buster as build

COPY ./ ./
WORKDIR /client
RUN npm install
WORKDIR /shared
RUN npm install
WORKDIR /service
RUN npm install
RUN npm run build
WORKDIR /shared
RUN npm prune --prodcution
WORKDIR /service
RUN npm prune --production

FROM node:10-buster-slim
COPY --from=build /shared /shared
COPY --from=build /service /service
WORKDIR /service
RUN rm -f .env || true
RUN npm install -g pm2

EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

