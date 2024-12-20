module.exports.create = async (event) => {
    const { buildingId, roomNumber, name, surname, adult, gender, image } = JSON.parse(event.body);
  
    // Logic to upload image to S3
    const imageUrl = await uploadImageToS3(image);
  
    // Logic to create resident entry in DynamoDB
  
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Resident created successfully!', imageUrl }),
    };
  };
  
  // Helper function to upload image to S3
  const uploadImageToS3 = async (image) => {
    // S3 upload logic here
  };
  