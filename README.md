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

`AUTH=password PORT=8000 go run api.go`

`AUTH` and `PORT` env vars must be passed.
