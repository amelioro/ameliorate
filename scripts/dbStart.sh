#!/usr/bin/env bash
set -e

# start container if it exists, otherwise create and run
docker start pgsql 2>/dev/null || \
  docker run --name pgsql -d \
  -p 33100:5432 \
  --mount source=ameliorate_data,target=/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=Demo99 -e POSTGRES_DB=ameliorate postgres:15.3
