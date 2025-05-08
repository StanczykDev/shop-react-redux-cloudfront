import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

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
  {
    id: "3",
    title: "Product Three",
    description: "Description for product three",
    price: 39.99,
  },
  {
    id: "4",
    title: "Product Four",
    description: "Description for product four",
    price: 59.99,
  },
  {
    id: "5",
    title: "Product Five",
    description: "Description for product five",
    price: 69.99,
  },
  {
    id: "6",
    title: "Product Six",
    description: "Description for product six",
    price: 79.99,
  },
  {
    id: "7",
    title: "Product Seven",
    description: "Description for product seven",
    price: 89.99,
  },
  {
    id: "8",
    title: "Product Eight",
    description: "Description for product eight",
    price: 99.99,
  },
  {
    id: "9",
    title: "Product Nine",
    description: "Description for product nine",
    price: 109.99,
  },
];

export const client = new DynamoDBClient({ region: 'eu-north-1' });

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