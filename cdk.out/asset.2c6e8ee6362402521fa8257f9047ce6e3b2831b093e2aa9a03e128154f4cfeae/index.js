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
  handler: () => handler,
  products: () => products
});
module.exports = __toCommonJS(productService_exports);
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
var handler = async (event) => {
  const productId = event.pathParameters?.id;
  if (productId) {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No product with ${productId} id` }),
        headers: {
          "Access-Control-Allow-Origin": "*"
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
      body: JSON.stringify(products),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      }
    };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler,
  products
});
