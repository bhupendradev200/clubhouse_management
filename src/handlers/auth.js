const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { AUTH_SECRET, TABLE_NAME } = process.env;

// Utility to generate a JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '1h' });
};

// Utility to validate a JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, AUTH_SECRET);
  } catch (err) {
    console.error('Token verification failed:', err);
    return null;
  }
};

// Login Handler
module.exports.login = async (event) => {
  const { email, password } = JSON.parse(event.body);

  // Fetch user from DynamoDB
  const params = {
    TableName: TABLE_NAME,
    Key: { id: `user#${email}` },
  };

  try {
    const user = await dynamoDB.get(params).promise();

    if (!user.Item || user.Item.password !== password) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid email or password' }),
      };
    }

    // Generate token
    const token = generateToken({ id: user.Item.id, type: user.Item.type });

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } catch (err) {
    console.error('Login error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

// Register Handler
module.exports.register = async (event) => {
  const { name, email, password, type } = JSON.parse(event.body);

  // Add user to DynamoDB
  const params = {
    TableName: TABLE_NAME,
    Item: {
      id: `user#${email}`,
      name,
      email,
      password, // This should be hashed in a production environment!
      type, // admin or user
      createdAt: new Date().toISOString(),
    },
  };

  try {
    await dynamoDB.put(params).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User registered successfully' }),
    };
  } catch (err) {
    console.error('Register error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

// Token Validation for API Gateway Authorizer
module.exports.validate = async (event) => {
  const token = event.headers.Authorization;

  if (!token) {
    return {
      isAuthorized: false,
    };
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return {
      isAuthorized: false,
    };
  }

  return {
    isAuthorized: true,
  };
};
