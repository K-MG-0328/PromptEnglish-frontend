FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --frozen-lockfile --loglevel=error

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
