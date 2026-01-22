FROM node:18-alpine

WORKDIR /app

RUN npm install express

COPY app.js .
COPY system.log .

EXPOSE 3000

CMD ["node", "app.js"]
