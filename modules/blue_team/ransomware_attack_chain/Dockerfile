FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY app.js .
COPY logs/ ./logs/
COPY files/ ./files/
COPY tmp/ ./tmp/

EXPOSE 3000

CMD ["node", "app.js"]
