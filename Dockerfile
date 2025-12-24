# syntax=docker/dockerfile:1
ARG NODE_VERSION=24.12.0

# =====================
# Base
# =====================
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

# =====================
# Dépendances (DEV + PROD)
# =====================
FROM base AS deps
COPY package*.json ./
RUN npm ci

# =====================
# Build
# =====================
FROM deps AS build
COPY . .
RUN npm run build

# =====================
# Production
# =====================
FROM node:${NODE_VERSION}-alpine AS final
WORKDIR /usr/src/app

ENV NODE_ENV=production

# ✅ Créer le dossier requis et donner les droits
RUN mkdir -p /usr/src/app/.sandbox \
    && chown -R node:node /usr/src/app
    
USER node

# Copier uniquement le nécessaire
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY package.json ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
