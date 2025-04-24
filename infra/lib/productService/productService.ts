import { APIGatewayProxyHandler } from "aws-lambda";
import { ScanCommand, PutItemCommand} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { client } from "../database/seedDynamoDB";
import { v4 as uuidv4 } from "uuid" 

export const getHandler: APIGatewayProxyHandler = async (event) => {
  const productId = event.pathParameters?.id;

  const productData = await client.send(new ScanCommand({ TableName: 'products' }));
  const stockData = await client.send(new ScanCommand({ TableName: 'stock' }));

  const products = productData.Items?.map((data) => unmarshall(data)) || [];
  const stock = stockData.Items?.map((data) => unmarshall(data)) || [];

  const stockMap = new Map(stock.map(s => [s.product_id, s.count]));

  const result = products.map((product) => ({
    ...product,
    count: stockMap.get(product.id) ?? 0,
  }));

  if (productId) {
    const product = result.find(p => (p as unknown as { id: string }).id === productId);
    
    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No product with ${productId} id`}),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Content-Type": "application/json",
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(product),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
    };

  } else return {
    statusCode: 200,
    body: JSON.stringify(products),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
  };
};

export const createHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const { title, description, price, count } = JSON.parse(event.body || '{}');

    if (!title || !description || !price || count == null) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    const id = uuidv4();

    await client.send(new PutItemCommand({
      TableName: process.env.PRODUCTS_TABLE,
      Item: {
        id: { S: id },
        title: { S: title },
        description: { S: description },
        price: { N: price.toString() },
      },
    }));

    await client.send(new PutItemCommand({
      TableName: 'stock',
      Item: {
        product_id: { S: id },
        count: { N: count.toString() },
      },
    }));

    return {
      statusCode: 201,
      body: JSON.stringify({ id, title, description, price, count }),
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to create product' }),
    };
  }
};


  