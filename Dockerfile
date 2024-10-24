# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.8.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="SvelteKit"

# SvelteKit app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=8.15.4
RUN npm install -g pnpm@$PNPM_VERSION


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY . .

RUN mkdir -p /data

# Build application
RUN DATABASE_URL=":memory:" pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app/build /app/build
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app
COPY --from=build /app/drizzle.config.ts /app
COPY --from=build /app/drizzle /app/drizzle
COPY --from=build /app/deploy.sh /app

RUN mkdir -p /app/data

# Fix permissions on the copied database
RUN chmod +x /app/deploy.sh

# Create volume after setting up permissions
VOLUME /app/data

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
ENV DATABASE_URL=":memory:"
CMD ["/app/deploy.sh"]
