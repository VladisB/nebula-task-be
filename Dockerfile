# 1. Build stage
FROM node:22.13.0-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Production stage
FROM node:22.13.0-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
