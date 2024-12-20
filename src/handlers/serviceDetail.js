const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = async (event) => {
    const { federationId, serviceName, inTime, outTime, closeWeekDate } = JSON.parse(event.body);

    // Validate required fields
    if (!federationId || !serviceName || !inTime || !outTime || !closeWeekDate) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing required fields' }),
        };
    }

    const params = {
        TableName: 'ServiceDetails',
        Item: {
            federationId,
            serviceName,
            inTime,
            outTime,
            closeWeekDate
        }
    };

    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Service details created successfully!' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create service details', error: error.message }),
        };
    }
};
