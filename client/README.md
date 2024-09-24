# notes-lambda

A website that uses AWS S3, API Gateway, Lambda, and DynamoDB.
S3 is used for static hosting with S3 for html, css, and js files.
API Gateway routes calls to Lambda, which makes calls to DynamoDB.

## Scripts

For the S3 imitating client, navigate into the client folder:

- `npm i` - install node module dependencies
- `npm start` - start a development server on port 1234
- `npm run build` - combine and minify files for production and place them in the dist folder
- `npm test` - run unit tests

For deployment to AWS, from the root folder:

- `bin/s3-sync` - upload the files to the AWS S3 bucket
- `bin/lambda-update` - update the AWS Lambda

From the API Gateway / lambda imitator:

- `npm start` - start a development server that mimics API Gateway
- `npm test` - run unit tests
