import { APIGatewayProxyHandler } from "aws-lambda";

export const products = [
    {
      id: "1",
      title: "Product One",
      description: "Description for product one",
      price: 29.99,
    },
    {
      id: "2",
      title: "Product Two",
      description: "Description for product two",
      price: 49.99,
    },
  ];

export const handler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(products),
    headers: {
      "Content-Type": "application/json",
    },
  };
};

  