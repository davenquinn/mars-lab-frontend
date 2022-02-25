# Note: this doesn't build text with pandoc
FROM node:14 AS builder

# Install cesium-martini
COPY ./packages /frontend/packages

WORKDIR /frontend

COPY package.json .
RUN npm install --workspaces

COPY ./ ./

ARG PUBLIC_URL=""
ARG NODE_ENV=production
ARG API_BASE_URL=${PUBLIC_URL}/tiles

RUN node_modules/.bin/webpack

FROM nginx AS web

COPY --from=builder /frontend/dist /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
