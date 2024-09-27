# notes-lambda

This is a simple music competition website intended to run on AWS S3, API Gateway, Lambda, and DynamoDB.

The `client` folder has the source code that gets bundled and delivered to S3

The `lambda` folder has the source code that gets zipped up and runs in Lambda

## scripts

- `bin/s3-sync` - syncs the local `dist` folder with the S3 bucket. Make sure to run `npm run build` from the client folder first.
- `bin/lambda-update` - updates the AWS lambda function with the code in the lambda folder.

From the client folder:

- `npm start` - starts a local server that bundles the js and css and serves the html
- `npm run build` - bundles all the files and puts them in the `dist` folder for production
