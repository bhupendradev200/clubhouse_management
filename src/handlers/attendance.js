const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const cloudwatch = new AWS.CloudWatchLogs();

// Utility to log messages to CloudWatch
const logToCloudWatch = (message, error) => {
    const params = {
        logGroupName: '/aws/lambda/federation-app',
        logStreamName: 'attendance',
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

module.exports.create = async (event) => {
    const requestBody = JSON.parse(event.body);
    const { residentId, serviceId, date, timestamp, inTime, outTiming, employeeId } = requestBody;

    // Validate required fields
    if (!residentId || !serviceId || !date || !inTime || !outTiming) {
        logToCloudWatch('Missing required fields');
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing required fields' }),
        };
    }
    const attendanceId = `#${serviceId}#${residentId}#${date}`;

    const params = {
        TableName: 'Attendance',
        Item: {
            PK: `ATTENDANCE#${attendanceId}`,
            SK: `#METADATA#${attendanceId}`,
            residentId,
            serviceId,
            date,
            timestamp,
            inTime,
            outTiming,
            employeeId,
            createdAt: new Date().toISOString(),
        },
    };

    try {
        await dynamoDb.put(params).promise();
        logToCloudWatch('Attendance created successfully');
        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Attendance created successfully!' }),
        };
    } catch (error) {
        logToCloudWatch('Failed to create attendance', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create attendance', error: error.message }),
        };
    }
};
