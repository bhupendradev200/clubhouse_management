const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.uploadImage = async (bucketName, key, image) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: Buffer.from(image, 'base64'),
    ContentType: 'image/jpeg', // Adjust for your image type
    ACL: 'public-read',
  };

  return s3.upload(params).promise();
};
