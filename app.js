const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { sequelize } = require('./models');

const app = express();

app.use(bodyParser.json());

// Enable CORS for all origins
app.use(cors());

// Your routes and other middleware
const booksRouter = require('./routes/books');
const membersRouter = require('./routes/members');

app.use('/api/books', booksRouter);
app.use('/api/members', membersRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);
//   await sequelize.sync();
});
