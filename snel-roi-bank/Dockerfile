FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
COPY snel-roi-bank/package.json snel-roi-bank/package-lock.json /app/
RUN npm ci
COPY snel-roi-bank /app
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY snel-roi-bank/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
