const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const cloudwatch = new AWS.CloudWatchLogs();
const { AUTH_SECRET } = process.env;
const TABLE_NAME = 'EmployeeTable'; // Use EmployeeTable for storing user details

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
    logToCloudWatch('Token verification failed', err);
    return null;
  }
};

// Utility to log messages to CloudWatch
const logToCloudWatch = (message, error) => {
  const params = {
    logGroupName: '/aws/lambda/federation-app',
    logStreamName: 'auth',
    logEvents: [
      {
        message: `${message}: ${error ? error.message : ''}`,
        timestamp: new Date().getTime(),
      },
    ],
  };
  cloudwatch.putLogEvents(params, (err, data) => {
    if (err) console.error('CloudWatch log error:', err);
  });
};

module.exports.login = async (event) => {
  const { email, password } = JSON.parse(event.body);

  // Fetch user from DynamoDB
  const params = {
    TableName: TABLE_NAME,
    Key: { PK: `USER#${email}`, SK: `#METADATA#${email}` },
  };

  try {
    const user = await dynamoDB.get(params).promise();

    if (!user.Item || !bcrypt.compareSync(password, user.Item.password)) {
      logToCloudWatch('Invalid email or password');
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid email or password' }),
      };
    }

    // Generate token
    const token = generateToken({ id: user.Item.PK, type: user.Item.type });

    logToCloudWatch('User logged in successfully');
    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } catch (err) {
    console.error('Login error:', err);
    logToCloudWatch('Login error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

module.exports.register = async (event) => {
  const { name, email, password, type } = JSON.parse(event.body);

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);
  logToCloudWatch(` Request to register user with email: ${email}`);
  // Add user to DynamoDB
  const params = {
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${email}`,
      SK: `#METADATA#${email}`,
      name,
      email,
      password: hashedPassword, // Store hashed password
      type, // admin or user
      createdAt: new Date().toISOString(),
    },
  };

  try {
    await dynamoDB.put(params).promise();
    logToCloudWatch('User registered successfully');
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User registered successfully' }),
    };
  } catch (err) {
    console.error('Register error:', err);
    logToCloudWatch('Register error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

module.exports.validate = async (event) => {
  const token = event.headers.Authorization;

  if (!token) {
    logToCloudWatch('No token provided');
    return {
      isAuthorized: false,
    };
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    logToCloudWatch('Invalid token');
    return {
      isAuthorized: false,
    };
  }

  logToCloudWatch('Token validated successfully');
  return {
    isAuthorized: true,
  };
};

module.exports.validateToken = async (event) => {
  const token = event.authorizationToken;

  // Replace this with your actual token validation logic
  if (token === 'valid-token') {
    logToCloudWatch('Token validated successfully');
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
    };
  } else {
    logToCloudWatch('Invalid token');
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: event.methodArn,
          },
        ],
      },
    };
  }
};
