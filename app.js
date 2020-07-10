// import "@babel/polyfill";
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();

const config = require('./config');

app.use(bodyParser.json());
app.use(cors());

const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: 'Issue Tracker API',
			version: '0.1.0',
			description: 'API for issue.trakr app',
			contact: {
				name: 'Jeremiah Akpera',
			},
			servers: ['http://localhost:3002/api/v1'],
			host: 'localhost:3002',
			basePath: '/api/v1',
		},
	},
	apis: ['./api/auth/auth.js'],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

const baseURL = config.baseURL;

// ROUTES
const authRoute = require('./api/auth/auth');
app.use(`${baseURL}/auth`, authRoute);

app.use((req, res, next) => {
	const error = new Error('Not found');
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500).send({
		error: {
			status: error.status || 500,
			message: error.message || 'Internal Server Error',
		},
	});
});

module.exports = app;
