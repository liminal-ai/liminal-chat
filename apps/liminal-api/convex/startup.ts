import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { validateEnvironment, logEnvironmentStatus } from "./lib/env";

/**
 * Internal mutation to validate environment configuration at startup
 * This should be called when the Convex deployment starts
 */
export const validateStartup = internalMutation({
  args: v.object({}),
  handler: async (_ctx, _args) => {
    console.log("🚀 Liminal Chat - Validating environment configuration...");
    
    // Log current environment status
    logEnvironmentStatus();
    
    // Validate all required environment variables
    const validation = validateEnvironment();
    
    if (!validation.valid) {
      console.error("\n❌ Environment validation failed!");
      console.error("Missing required environment variables:");
      validation.errors.forEach(error => {
        console.error(`  - ${error}`);
      });
      console.error("\nPlease set these variables using:");
      console.error("npx convex env set VARIABLE_NAME \"value\"");
      
      throw new Error(`Environment validation failed: ${validation.errors.length} missing variables`);
    }
    
    console.log("\n✅ Environment validation passed!");
    console.log("All required environment variables are configured.");
    
    return {
      status: "validated",
      timestamp: Date.now(),
      errors: validation.errors
    };
  },
});

/**
 * Internal mutation to check environment health
 * Returns validation status without exposing sensitive information
 */
export const checkEnvironmentHealth = internalMutation({
  args: v.object({}),
  handler: async (_ctx, _args) => {
    const validation = validateEnvironment();
    
    return {
      healthy: validation.valid,
      missingVariables: validation.errors.length,
      timestamp: Date.now(),
      // Don't expose the actual variable names in production
      details: process.env.NODE_ENV === "development" 
        ? validation.errors 
        : undefined
    };
  },
});