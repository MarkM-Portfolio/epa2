FROM node:14-alpine

ARG APP_DIR=/home/node/epa
RUN apk add -U tzdata
RUN cp /usr/share/zoneinfo/Asia/Manila /etc/localtime

WORKDIR ${APP_DIR}

RUN mkdir -p ${APP_DIR}/app/node_modules &&\ 
    mkdir -p ${APP_DIR}/server/node_modules &&\
    mkdir -p ${APP_DIR}/server/assets

COPY ./app/package*.json ${APP_DIR}/app

COPY ./server/package*.json ${APP_DIR}/server

RUN cd ${APP_DIR}/app; \
    npm install; \
    npm ci && npm cache clean --force; \
    cd ${APP_DIR}/server; \
    npm ci && npm cache clean --force

COPY . ${APP_DIR}

RUN chown -R node:node ${APP_DIR} &&\
    apk add curl

USER node

EXPOSE 8080

WORKDIR ${APP_DIR}/server

CMD [ "npm", "run", "start" ]
# CMD [ "tail", "-f" ] # for debug