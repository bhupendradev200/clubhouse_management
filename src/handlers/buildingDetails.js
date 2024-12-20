module.exports.create = async (event) => {
    const { federationId, buildingName, wing, buildingNumber, totalResidents } = JSON.parse(event.body);
  
    // Your logic to create building details
  
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Building details created successfully!' }),
    };
  };
  