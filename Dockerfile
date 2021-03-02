
FROM node:lts-alpine3.13

WORKDIR /usr/src/app

COPY rollup.config.js ./
COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY ./public ./public

RUN npm run-script build

EXPOSE 62103

ENV HOST=0.0.0.0
ENV PORT=62103

CMD [ "npm", "start" ]
