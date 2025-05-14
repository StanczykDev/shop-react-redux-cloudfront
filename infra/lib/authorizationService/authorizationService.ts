export const authHandler = async (event) => {
    console.log("Received event:", JSON.stringify(event));

    const authHeader = event?.Authorization || event?.authorization || event?.authorizationToken;

    if (!authHeader) {
        console.log('No auth header')
        return null;
    }

    if (!authHeader.startsWith('Basic ')) {
        console.log('Wrong auth header')
        return null;
    }

    const base64Credentials = authHeader.split(' ')[1];
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = decoded.split(':');

    const envPassword = process.env.StanczykDev;

    if (!username || !password || !envPassword) {
        return null
    }

    if (username === 'StanczykDev' && password === envPassword) {
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
        return null
    }
};
