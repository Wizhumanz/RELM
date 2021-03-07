# RELM - Real Estate Listings Manager

Website to manage property listings. 

## Local Dev

`npm run dev`

NOTE: `npm  start` + `npm run dev` scripts in `package.json` modified to use host 0.0.0.0 and port 62103.

## Docker

`docker build -t app-img .`

`docker run --name app-name -p 62103:62103 app-img`

Using LTS Node Alpine image for final stage of build.
