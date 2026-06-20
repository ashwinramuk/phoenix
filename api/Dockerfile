# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# tsc does not copy .json data files; ship them alongside the compiled output
RUN npm run build && cp -r src/data dist/data

# --- Runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from the build stage
COPY --from=build /app/dist ./dist

# Run as the built-in non-root 'node' user (least privilege)
USER node

EXPOSE 4000
CMD ["node", "dist/server.js"]
