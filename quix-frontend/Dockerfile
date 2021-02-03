FROM node:14-buster as build

RUN useradd -ms /bin/bash builduser
USER builduser
COPY --chown=builduser ./ /app
WORKDIR /app
RUN npm install
WORKDIR /app/service
RUN npm run build
WORKDIR /app/shared
RUN npm prune --prodcution
WORKDIR /app/service
RUN npm prune --production

FROM node:14-buster-slim
RUN useradd -ms /bin/bash appuser
COPY --from=build --chown=appuser /app/shared /shared
COPY --from=build --chown=appuser /app/service /service
WORKDIR /shared
RUN npm link
WORKDIR /service
RUN npm link @wix/quix-shared

USER appuser
WORKDIR /service
RUN rm -f .env || true
USER root
RUN npm install -g pm2
RUN mkdir /logs
RUN chown appuser /logs
USER appuser

EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

