# Using Docker so there's an easy way to start the auth server with the other components,
# with a convenient way of stopping/getting logs from the backgrounded process(es).
# Bg/file logging isn't quite as convenient as docker with the container management UIs.
FROM node:22-alpine
WORKDIR /app
COPY package*.json tsconfig.json index.ts ./
RUN npm ci
CMD ["npx", "tsx", "index.ts"]
EXPOSE 9000
