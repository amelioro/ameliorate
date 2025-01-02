#!/usr/bin/env bash
set -e

# Start the e2e container and run the passed-in command in it.

# --rm: remove container when it's stopped so that it's always cleaned up (starting from image seems very fast anyway)

# -it: so that container can be easily stopped with ctrl+c

# --mount: reflect e2e directory changes from host to container for e.g. if changing tests,
# and vice-versa for e.g. if updating screenshots.
# Note: this assumes we're running from e2e directory.

# --ipc=host: apparently this is recommended to prevent Chrome from running out of memory https://playwright.dev/docs/docker#run-the-image

# --network=host: allow container to share host's localhost - no need to map ports, and container can access e.g. localhost:3000 for hitting the locally-served app.
# Since we're just using this script for local development, and we're in control of the container's code, the security impact should be acceptable.
# Note: this requires docker desktop version 4.29+ and enabling "Enable host networking" in the Features in Development settings.

# sh -c: seems like this is the easiest way to run a command that's passed in as an argument e.g. $1 = "npm run test"

docker run --name e2e-tests --rm -it \
  --mount type=bind,source=$(pwd),target=/app \
  --ipc=host \
  --network=host \
  e2e-tests \
  sh -c "$1" \
