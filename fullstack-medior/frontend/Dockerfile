FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host makes Vite listen on 0.0.0.0 so the dev server is reachable from the host.
CMD ["npm", "run", "dev", "--", "--host"]
