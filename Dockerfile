# ----------------------------
# 构建
# ----------------------------
FROM node:20.15.0-alpine3.19 AS build

WORKDIR /app

COPY package*.json .
RUN npm install --force

COPY . .
RUN npm run build

# ----------------------------
# 部署
# ----------------------------
FROM nginx:1.26.1-alpine3.19

# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/conf.d
COPY --from=build /app/dist/ws /usr/share/nginx/html

EXPOSE 80
