import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as path from "path";
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';


export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucketName = this.node.tryGetContext('bucketName');
    const distributionName = this.node.tryGetContext('distributionName');

    const siteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName,
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
    });

    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      comment: distributionName,
      defaultBehavior: {
        origin: new origins.S3StaticWebsiteOrigin(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });  

    const getProductsListLambda = new NodejsFunction(this, "GetProductsListLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "getHandler",
      entry: path.join(__dirname, "productService/productService.ts")
    });

    getProductsListLambda.addEnvironment('PRODUCTS_TABLE', 'products');
    getProductsListLambda.addEnvironment('STOCK_TABLE', 'stock');

    getProductsListLambda.addToRolePolicy(new PolicyStatement({
      actions: [  
        'dynamodb:GetItem',
        'dynamodb:Scan',
        'dynamodb:Query',
        'dynamodb:PutItem',
      ],
      resources: [
        'arn:aws:dynamodb:eu-north-1:845992680781:table/products',
        'arn:aws:dynamodb:eu-north-1:845992680781:table/stock',
      ],
    }));

    const createProductLambda = new NodejsFunction(this, 'CreateProductLambda', {
      handler: 'createHandler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCTS_TABLE: 'products',
      },
      entry: path.join(__dirname, "productService/productService.ts")
    });

    createProductLambda.addToRolePolicy(new PolicyStatement({
      actions: [  
        'dynamodb:GetItem',
        'dynamodb:Scan',
        'dynamodb:Query',
        'dynamodb:PutItem',
      ],
      resources: [
        'arn:aws:dynamodb:eu-north-1:845992680781:table/products',
        'arn:aws:dynamodb:eu-north-1:845992680781:table/stock',
      ],
    }));

    const api = new apigateway.RestApi(this, "ProductServiceApi", {
      restApiName: "Product Service",
    });

    const products = api.root.addResource("products", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST'],
        allowHeaders: ["*"],
      },
    });

    const productById = products.addResource("{id}", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "OPTIONS"],
        allowHeaders: ["*"],
      },
    });

    products.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsListLambda, {
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Access-Control-Allow-Headers": "'*'",
            },
          },
        ],
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Headers": true,
            },
          },
        ],
      }
    );
    
    productById.addMethod("GET", new apigateway.LambdaIntegration(getProductsListLambda, {
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Headers": "'*'",
          },
        },
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
    }), {
      requestParameters: {
        "method.request.path.id": true,
      },
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
          },
        },
        {
          statusCode: "404",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
          },
        },
      ],
    });

    products.addMethod('POST', new apigateway.LambdaIntegration(createProductLambda, {
      integrationResponses: [
        {
          statusCode: "201",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Headers": "'*'",
            "method.response.header.Access-Control-Allow-Methods": "'POST,OPTIONS'",
          },
        },
        {
          statusCode: "500",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Headers": "'*'",
            "method.response.header.Access-Control-Allow-Methods": "'POST,OPTIONS'",
          },
        },
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
    }), {
      methodResponses: [
        {
          statusCode: "201",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
          },
        },
        {
          statusCode: "500",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
          },
        },
      ],
    });

    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      queueName: 'catalogItemsQueue',
    });

    const catalogBatchProcessLambda = new NodejsFunction(this, 'CatalogBatchProcessLambda', {
      handler: 'catalogBatchProcessHandler',
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, 'productService/productService.ts'),
      environment: {
        PRODUCTS_TABLE: 'products',
      },
    });
    
    catalogBatchProcessLambda.addToRolePolicy(new PolicyStatement({
      actions: ['dynamodb:PutItem'],
      resources: [
        'arn:aws:dynamodb:eu-north-1:845992680781:table/products',
      ],
    }));

    catalogBatchProcessLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );
    
    new cdk.CfnOutput(this, 'BucketName', {
      value: siteBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: distribution.distributionDomainName,
    });

    new cdk.CfnOutput(this, 'ProductsApiEndpoint', {
      value: `${api.url}products`,
    });
    
  }
}
