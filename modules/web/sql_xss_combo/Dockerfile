FROM node:18-alpine

WORKDIR /app

RUN npm install express sqlite3

COPY app.js .

EXPOSE 3000

CMD ["node", "app.js"]

