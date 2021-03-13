
FROM node:lts-alpine3.13

WORKDIR /usr/src/app

COPY / ./

RUN npm install

RUN npm install --save-dev node-sass

RUN npm run build

EXPOSE 3000

CMD [ "node", "__sapper__/build" ]
