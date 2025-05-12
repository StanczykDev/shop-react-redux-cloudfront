import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';

interface ImportServiceStackProps extends cdk.StackProps {
  catalogItemsQueue: sqs.IQueue;
} 

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ImportServiceStackProps) {
    super(scope, id, props);

    const importBucket = new s3.Bucket(this, 'ImportBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        }
      ]
    });

    const catalogItemsQueue = props.catalogItemsQueue;

    const importProductsFileLambda = new NodejsFunction(this, 'ImportProductsFileLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, 'importService/importService.ts'),
      handler: 'importFileHandler',
      environment: {
        BUCKET_NAME: importBucket.bucketName,
      },
    });

    importBucket.grantPut(importProductsFileLambda);

    const api = new apigateway.RestApi(this, 'ImportApi', {
      restApiName: 'Import Service',
    });
    
    const importResource = api.root.addResource('import', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'PUT', 'OPTIONS'],
        allowHeaders: ['*', 'Authorization'],
      },
    });

    const importFileParserLambda = new NodejsFunction(this, 'ImportFileParserLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, 'importService/importService.ts'),
      handler: 'parseFileHandler',
      environment: {
        SQS_URL: catalogItemsQueue.queueUrl,
      }
    });

    catalogItemsQueue.grantSendMessages(importFileParserLambda);
    
    importBucket.grantRead(importFileParserLambda);
    
    importFileParserLambda.addEventSource(new S3EventSource(importBucket, {
      events: [s3.EventType.OBJECT_CREATED],
      filters: [{ prefix: 'uploaded/' }],
    }));
    
    const basicAuthorizerLambda = new NodejsFunction(this, 'BasicAuthorizerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, 'authorizationService/authorizationService.ts'),
      handler: 'authHandler',
      environment: {
        StanczykDev: process.env.StanczykDev as string,
      }
    });

    const authorizer = new apigateway.TokenAuthorizer(this, 'ImportApiLambdaAuthorizer', {
      handler: basicAuthorizerLambda,
      identitySource: 'method.request.header.Authorization',
    });

    importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      requestParameters: {
        'method.request.querystring.name': true,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
          },
        },
        {
            statusCode: '401',
            responseParameters: {
                "method.response.header.Access-Control-Allow-Origin": true,
                "method.response.header.Access-Control-Allow-Headers": true,
            },
        },
        {
            statusCode: '403',
            responseParameters: {
                "method.response.header.Access-Control-Allow-Origin": true,
                "method.response.header.Access-Control-Allow-Headers": true,
            },
        }
      ],
    });

    new cdk.CfnOutput(this, 'ImportBucketName', {
      value: importBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'ImportAPI', {
      value: api.url,
    });
  }
}
