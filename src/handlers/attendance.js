module.exports.create = async (event) => {
    const { residentId, serviceId, date, inTime, outTime } = JSON.parse(event.body);
  
    // Logic to store attendance in DynamoDB
  
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Attendance created successfully!' }),
    };
  };
  