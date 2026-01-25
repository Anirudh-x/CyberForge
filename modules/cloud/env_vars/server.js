const express = require('express');
const router = require('./app');

const app = express();
const PORT = process.env.PORT || 3000;

// Mount the router at root for standalone deployment
app.use('/', router);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Environment Variables Lab running on port ${PORT}`);
});
