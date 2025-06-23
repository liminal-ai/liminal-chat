# Convex Deployment Setup Instructions

Since the Convex CLI requires interactive input for creating a new deployment, please follow these manual steps:

## Step 1: Start the Convex Dev Server

Run the following command in your terminal:

```bash
pnpm dev
```

## Step 2: Create a New Project

When prompted by the Convex CLI:

1. **"What would you like to configure?"**
   - Select: `a new project`

2. **"Project name:"**
   - Enter: `liminal-api` (or your preferred name)

3. The CLI will then:
   - Create a new Convex project
   - Generate a deployment URL
   - Save the configuration to `convex.json`
   - Update your `.env.local` with `CONVEX_DEPLOYMENT`

## Step 3: Verify the Setup

After the setup completes, you should see:
- A new `convex.json` file in the project root
- The `CONVEX_DEPLOYMENT` URL added to `.env.local`
- The dev server running with hot reloading enabled

## Step 4: Access the Dashboard

Once the dev server is running, you can open the Convex dashboard:

```bash
pnpm dev:dashboard
```

## What Happens Next

The Convex dev server will:
- Watch for changes in the `convex/` directory
- Automatically regenerate types
- Push updates to your development deployment
- Provide real-time logs in the terminal

## Deployment URL Format

Your deployment URL will look like:
```
https://[adjective]-[animal]-[number].convex.cloud
```

For example: `https://gentle-panda-123.convex.cloud`

This URL is unique to your project and is used for all API calls.