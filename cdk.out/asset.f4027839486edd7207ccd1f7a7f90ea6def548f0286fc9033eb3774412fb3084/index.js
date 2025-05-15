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

// infra/lib/authorizationService/authorizationService.ts
var authorizationService_exports = {};
__export(authorizationService_exports, {
  authHandler: () => authHandler
});
module.exports = __toCommonJS(authorizationService_exports);
var authHandler = async (event) => {
  console.log("Received event:", JSON.stringify(event));
  const authHeader = event?.Authorization || event?.authorization || event?.authorizationToken;
  if (!authHeader) {
    console.log("No auth header");
    return null;
  }
  if (!authHeader.startsWith("Basic ")) {
    console.log("Wrong auth header");
    return null;
  }
  const base64Credentials = authHeader.split(" ")[1];
  const decoded = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [username, password] = decoded.split(":");
  const envPassword = process.env.StanczykDev;
  if (!username || !password || !envPassword) {
    return null;
  }
  if (username === "StanczykDev" && password === envPassword) {
    return {
      principalId: username,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: event.methodArn
          }
        ]
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "application/json"
      },
      context: {
        username
      }
    };
  } else {
    return null;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  authHandler
});
