const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.putItem = async (tableName, item) => {
  const params = {
    TableName: tableName,
    Item: item,
  };
  return dynamoDB.put(params).promise();
};

module.exports.getItem = async (tableName, key) => {
  const params = {
    TableName: tableName,
    Key: key,
  };
  return dynamoDB.get(params).promise();
};

module.exports.queryItems = async (tableName, keyConditionExpression, expressionAttributeValues) => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };
  return dynamoDB.query(params).promise();
};

module.exports.updateItem = async (tableName, key, updateExpression, expressionAttributeValues) => {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'UPDATED_NEW',
  };
  return dynamoDB.update(params).promise();
};

module.exports.deleteItem = async (tableName, key) => {
  const params = {
    TableName: tableName,
    Key: key,
  };
  return dynamoDB.delete(params).promise();
};
