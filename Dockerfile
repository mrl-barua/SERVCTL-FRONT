# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better Docker layer caching.
COPY package*.json ./
RUN npm ci

# Copy source and build.
COPY . .

# Build args injected at build time.
ARG VITE_API_URL=http://localhost:3000
ARG VITE_SERVCTL_MODE=local

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SERVCTL_MODE=${VITE_SERVCTL_MODE}

RUN npm run build

# Stage 2: Serve
FROM nginx:1.25-alpine AS runner

# Remove default nginx config.
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
