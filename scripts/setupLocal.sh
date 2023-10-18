#!/usr/bin/env bash
set -e

npm install # install dependencies
npx husky install # activate commit hooks
cp .env.example .env # set up env variables

npm run db:start # start container running postgres
npm run db:setup # set up schema, seed data

npm run mock-auth:build # build image for mock-auth container
