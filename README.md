# Multi-City Weather App

A simple weather application built with Next.js that displays current weather conditions for multiple cities: Ottawa, Bogota, and Buenos Aires.

## Demo

The live demo has been taken down to avoid AWS charges. Please refer to the [screenshots](#screenshots) section to see the application in action.

## Screenshots
![Weather App Demo](/screenshots/weather-app-demo.gif)
*GIF demonstration of the Weather App in action*

## Features

- Shows current temperature for selected cities (Ottawa, Bogota, Buenos Aires)
- Displays weather condition with appropriate icons (Sunny, Cloudy, etc.)
- Shows daily high and low temperatures
- Interactive city selector with instant updates
- Client-side caching for 10 minutes to improve performance
- Auto-refreshes weather data every 30 minutes
- Responsive design that works on mobile and desktop
- Error handling with retry mechanism
- Accessible UI with proper ARIA attributes

## Data Source

Weather data is fetched from the [Open-Meteo API](https://open-meteo.com/), a free and open-source weather API.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- AWS S3 (for static hosting)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- AWS CLI (for deployment)
- AWS account (free tier is sufficient)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/weather-app.git
cd weather-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment to AWS S3

This project was previously deployed as a static website on AWS S3. The deployment has since been removed to avoid potential charges, but the process is documented below for educational purposes.

### Step 1: Build the Application

The app is configured for static exports in Next.js. Run the following command to create a production build:

```bash
npm run build
```

This creates an `out` directory with all the static files needed for deployment.

### Step 2: Set Up an S3 Bucket using AWS CLI

Use the AWS CLI to create and configure an S3 bucket:

```bash
# Create the S3 bucket
aws s3api create-bucket \
  --bucket weather-app-demo-danielsantiago1230 \
  --region us-east-1

# Disable block public access settings
aws s3api put-public-access-block \
  --bucket weather-app-demo-danielsantiago1230 \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Configure static website hosting
aws s3 website s3://weather-app-demo-danielsantiago1230/ \
  --index-document index.html \
  --error-document index.html
```

### Step 3: Set Bucket Policy for Public Access

Create a bucket policy file to allow public read access:

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::weather-app-demo-danielsantiago1230/*"
    }
  ]
}
EOF

# Apply the bucket policy
aws s3api put-bucket-policy \
  --bucket weather-app-demo-danielsantiago1230 \
  --policy file://bucket-policy.json
```

### Step 4: Upload the Build Files

Use the sync command to upload local build files to the S3 bucket:

```bash
aws s3 sync out/ s3://weather-app-demo-danielsantiago1230/ --delete
```

The `--delete` flag removes any files in the bucket that don't exist in the local build directory, ensuring a clean deployment.

### Step 5: Access the Website

The website was accessible at:

```
http://weather-app-demo-danielsantiago1230.s3-website-us-east-1.amazonaws.com
```

![Weather App Screenshot](/screenshots/weather-app-screenshot.png)
*Screenshot of the Weather App showing the user interface and functionality*

### Step 6: Cleanup Resources (Important)

After demonstration and testing, all AWS resources were cleaned up to prevent any potential future charges:

```bash
# Delete all files in the bucket
aws s3 rm s3://weather-app-demo-danielsantiago1230/ --recursive

# Delete the bucket itself
aws s3api delete-bucket --bucket weather-app-demo-danielsantiago1230
```

This cleanup step is important if you're concerned about potential AWS charges after the free tier period expires.

## Project Configuration

The project uses the following configuration in `next.config.ts` for static exports:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  // Make sure the app works correctly when deployed to a subdirectory
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,
};

export default nextConfig;
```

## Deployment Notes and Learnings

- Using AWS CLI makes the deployment process more straightforward and scriptable
- The NextJS `output: 'export'` configuration is essential for static site generation
- Setting both index and error documents to `index.html` helps with client-side routing
- The deployment process takes just a few minutes once properly configured

### AWS Policy Version Note

The `"Version": "2012-10-17"` in the bucket policy is a specific AWS requirement that refers to the policy language version, not when your policy was created. This date represents the current version of the AWS IAM policy language and is required for all policy features to work correctly.

## License

This project is open source and available under the [MIT License](LICENSE).