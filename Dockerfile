FROM node:22.18.0-bullseye

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
