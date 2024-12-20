// Create Federation
module.exports.create = async (event) => {
    const { name, location, address, pincode, paid, plan } = JSON.parse(event.body);

    // Your logic to insert Federation data into DynamoDB
    const params = {
        TableName: 'Federations',
        Item: {
            id: `#{name}#${location}#{pincode}`, // Generate a unique ID for the federation
            name,
            location,
            address,
            pincode,
            paid,
            plan,
            createdAt: new Date().toISOString(),
        },
    };
    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Federation created successfully!' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create federation', error: error.message }),
        };
    }
};

// Update Federation
module.exports.update = async (event) => {
    const { id } = event.pathParameters;
    const { name, location, address, pincode, paid, plan } = JSON.parse(event.body);

    // Your logic to update Federation data in DynamoDB
    const params = {
        TableName: 'Federations',
        Key: { id },
        UpdateExpression: 'set #name = :name, #location = :location, #address = :address, #pincode = :pincode, #paid = :paid, #plan = :plan, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
            '#name': 'name',
            '#location': 'location',
            '#address': 'address',
            '#pincode': 'pincode',
            '#paid': 'paid',
            '#plan': 'plan',
        },
        ExpressionAttributeValues: {
            ':name': name,
            ':location': location,
            ':address': address,
            ':pincode': pincode,
            ':paid': paid,
            ':plan': plan,
            ':updatedAt': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
    };

    try {
        const result = await dynamoDb.update(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Federation updated successfully!', data: result.Attributes }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to update federation', error: error.message }),
        };
    }
};

// Fetch Federation
module.exports.fetch = async (event) => {
    const { id } = event.pathParameters;

    const params = {
        TableName: 'Federations',
        Key: { id },
    };

    try {
        const result = await dynamoDb.get(params).promise();
        if (result.Item) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Federation fetched successfully!', data: result.Item }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Federation not found' }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to fetch federation', error: error.message }),
        };
    }
};
