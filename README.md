# RELM - Real Estate Listings Manager

Website to manage property listings. 

## Branch Naming Conventions

To run Gitlab CI/CD pipelines, branch names must start with `frontend-` or `api-`. 

Pipeline always runs by default on push to `master`.

---

# Frontend (SvelteJS)

**Must** `cd frontend` from root for all commands below.

## Local Dev

`npm run dev`

NOTE: `npm  start` + `npm run dev` scripts in `package.json` modified to use host 0.0.0.0 and port 62103.

### Docker

`docker build -t app-img .`

`docker run --name app-name -p 62103:62103 app-img`

Using LTS Node Alpine image for final stage of build.

---

# Backend (Golang REST API)

**Must** `cd api` from root for all commands below.

## Local Dev

```
chmod +x run.sh
./run.sh
```

Inside `run.sh`:
```
export PORT=8000

# build/ directory ignored by git
go build -o build/api .

build/api
```

`PORT` env var must be passed for local dev. This env var is passed by default when deployed to Cloud Run.

### [GCP Datastore testing](https://cloud.google.com/datastore/docs/reference/libraries#client-libraries-install-go):

1. Must authenticate: `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/auth/my-key.json"` in current shell session.

OR local testing with emulator:

1. Install local emulator: `gcloud components install cloud-datastore-emulator`.
2. [Run local emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator): `gcloud beta emulators datastore start`.
3. Set env vars so that local app connects to emulated DB instead of prod: `$(gcloud beta emulators datastore env-init)`.

### Docker

```
cd api
docker build -t <img-name> .
docker run -e AUTH=password -e PORT=8000 --name <container-name> -p 8000:8000 <img-name>
```
