FROM node:18-alpine

WORKDIR /app

RUN npm install express archiver

COPY app.js .
COPY readme.txt .
COPY .hidden_config .

EXPOSE 3000

CMD ["node", "app.js"]
