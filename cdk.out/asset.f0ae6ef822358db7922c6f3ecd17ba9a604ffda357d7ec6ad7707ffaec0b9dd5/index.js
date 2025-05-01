"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// infra/lib/productService/productService.ts
var productService_exports = {};
__export(productService_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(productService_exports);
var import_client_dynamodb2 = require("@aws-sdk/client-dynamodb");
var import_util_dynamodb = require("@aws-sdk/util-dynamodb");

// infra/lib/database/seedDynamoDB.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var products = [
  {
    id: "1",
    title: "Product One",
    description: "Description for product one",
    price: 29.99
  },
  {
    id: "2",
    title: "Product Two",
    description: "Description for product two",
    price: 49.99
  },
  {
    id: "3",
    title: "Product Three",
    description: "Description for product three",
    price: 39.99
  },
  {
    id: "4",
    title: "Product Four",
    description: "Description for product four",
    price: 59.99
  },
  {
    id: "5",
    title: "Product Five",
    description: "Description for product five",
    price: 69.99
  },
  {
    id: "6",
    title: "Product Six",
    description: "Description for product six",
    price: 79.99
  },
  {
    id: "7",
    title: "Product Seven",
    description: "Description for product seven",
    price: 89.99
  },
  {
    id: "8",
    title: "Product Eight",
    description: "Description for product eight",
    price: 99.99
  },
  {
    id: "9",
    title: "Product Nine",
    description: "Description for product nine",
    price: 109.99
  }
];
var client = new import_client_dynamodb.DynamoDBClient({ region: "eu-north-1" });
var seed = async () => {
  const formattedProducts = products.map((product) => ({
    id: { S: product.id },
    title: { S: product.title },
    description: { S: product.description },
    price: { N: product.price.toString() }
  }));
  const stock = formattedProducts.map((product, index) => ({
    product_id: product.id,
    count: { N: Math.round(Number(product.price.N) / (index + 1)).toString() }
  }));
  for (const item of formattedProducts) {
    await client.send(new import_client_dynamodb.PutItemCommand({ TableName: "products", Item: item }));
  }
  for (const item of stock) {
    await client.send(new import_client_dynamodb.PutItemCommand({ TableName: "stock", Item: item }));
  }
  console.log("DynamoDB seeded successfully!");
};
seed().catch(console.error);

// infra/lib/productService/productService.ts
var handler = async (event) => {
  const productId = event.pathParameters?.id;
  const productData = await client.send(new import_client_dynamodb2.ScanCommand({ TableName: "products" }));
  const stockData = await client.send(new import_client_dynamodb2.ScanCommand({ TableName: "stock" }));
  const products2 = productData.Items?.map((data) => (0, import_util_dynamodb.unmarshall)(data)) || [];
  const stock = stockData.Items?.map((data) => (0, import_util_dynamodb.unmarshall)(data)) || [];
  const stockMap = new Map(stock.map((s) => [s.product_id, s.count]));
  const result = products2.map((product) => ({
    ...product,
    count: stockMap.get(product.id) ?? 0
  }));
  if (productId) {
    const product = result.find((p) => p.id === productId);
    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No product with ${productId} id` }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Content-Type": "application/json"
        }
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(product),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      }
    };
  } else
    return {
      statusCode: 200,
      body: JSON.stringify(products2),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      }
    };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
