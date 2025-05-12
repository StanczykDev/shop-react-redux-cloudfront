export const authHandler = async (event) => {
    console.log("Received event:", JSON.stringify(event));

    const authHeader = event.headers?.Authorization || event.headers?.authorization;

    if (!authHeader) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized: Missing Authorization header' }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Content-Type": "application/json",
      }
        };
    }

    if (!authHeader.startsWith('Basic ')) {
        return {
            statusCode: 403,
            body: JSON.stringify({ message: 'Forbidden: Invalid authorization format' }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Content-Type": "application/json",
            }
        };
    }

    const base64Credentials = authHeader.split(' ')[1];
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = decoded.split(':');

    const envPassword = process.env.StanczykDev;

    if (!username || !password || !envPassword) {
        return {
            statusCode: 403,
            body: JSON.stringify({ message: 'Forbidden: Missing or invalid credentials' }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Content-Type": "application/json",
            }
        };
    }

    if (username === 'StanczykDev' && password === envPassword) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Authorized' }),
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
                "Content-Type": "application/json",
            }
        };
    } else {
        return {
            statusCode: 403,
            body: JSON.stringify({ message: 'Forbidden: Invalid username or password' }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Content-Type": "application/json",
            }
        };
    }
};
