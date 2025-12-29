# SecureAuth Gateway - Backend Dockerfile
# Production-ready Express + TypeScript + MongoDB backend

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files (including lock file for npm ci)
COPY server/package.json server/package-lock.json ./

# Install ALL dependencies first (including tsconfig-paths for runtime)
RUN npm ci && npm cache clean --force

# Copy configuration files
COPY server/tsconfig.json server/nodemon.json server/bootstrap.js ./

# Copy source code
COPY server/src ./src

# Build TypeScript to JavaScript and resolve path aliases
RUN npm run build

# Remove dev dependencies after build (paths already resolved by tsc-alias)
RUN npm prune --production

# Create logs directory
RUN mkdir -p logs

# Expose the application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the application directly (paths resolved at build time)
CMD ["node", "dist/app.js"]
