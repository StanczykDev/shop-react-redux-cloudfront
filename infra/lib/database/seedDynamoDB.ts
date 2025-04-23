import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { products  } from '../productService/productService';

const client = new DynamoDBClient({ region: 'eu-north-1' });

const seed = async () => {
  const formattedProducts = products.map(product => ({
    id: { S: product.id },
    title: { S: product.title },
    description: { S: product.description },
    price: { N: product.price.toString() },
  }))

  const stock = formattedProducts.map((product, index) => ({
    product_id: product.id,
    count: { N: Math.round(Number(product.price.N) / (index + 1)).toString() }
  }))

  for (const item of formattedProducts) {
    await client.send(new PutItemCommand({ TableName: 'products', Item: item }));
  }

  for (const item of stock) {
    await client.send(new PutItemCommand({ TableName: 'stock', Item: item }));
  }

  console.log('DynamoDB seeded successfully!');
};

seed().catch(console.error);