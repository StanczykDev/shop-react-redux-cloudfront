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
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    console.log("Wrong auth header");
    throw new Error("Unauthorized");
  }
  const base64Credentials = authHeader.split(" ")[1];
  const decoded = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [username, password] = decoded.split(":");
  const envPassword = process.env.StanczykDev;
  if (!username || !password) {
    console.log(base64Credentials);
    console.log(decoded);
    console.log("No credentials");
    throw new Error("Unauthorized");
  }
  console.log(base64Credentials);
  console.log(decoded);
  console.log(envPassword);
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
      context: {
        username
      }
    };
  } else {
    return {
      principalId: username,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: event.methodArn
          }
        ]
      },
      context: {
        username
      }
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  authHandler
});
