# playwright's image that contains browsers and OS dependencies for running
# note: use specifically the version matching the npm package version, as playwright recommends https://playwright.dev/docs/docker#image-tags
FROM mcr.microsoft.com/playwright:v1.56.1-noble

WORKDIR /app

# note: this assumes we're running from e2e directory
COPY package.json package-lock.json .npmrc .nvmrc ./

RUN npm ci
