FROM chainguard/bun:latest AS build
WORKDIR /app
COPY bun.lockb package.json ./
RUN bun install
COPY . .
RUN bun build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]