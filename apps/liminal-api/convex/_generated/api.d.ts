/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as db_agents from "../db/agents.js";
import type * as db_cleanup from "../db/cleanup.js";
import type * as db_conversations from "../db/conversations.js";
import type * as db_messages from "../db/messages.js";
import type * as db_migrations from "../db/migrations.js";
import type * as edge_aiHttpHelpers from "../edge/aiHttpHelpers.js";
import type * as edge_aiModelBuilder from "../edge/aiModelBuilder.js";
import type * as edge_aiProviders from "../edge/aiProviders.js";
import type * as edge_aiService from "../edge/aiService.js";
import type * as http from "../http.js";
import type * as lib_env from "../lib/env.js";
import type * as lib_errors from "../lib/errors.js";
import type * as node_chat from "../node/chat.js";
import type * as node_startup from "../node/startup.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "db/agents": typeof db_agents;
  "db/cleanup": typeof db_cleanup;
  "db/conversations": typeof db_conversations;
  "db/messages": typeof db_messages;
  "db/migrations": typeof db_migrations;
  "edge/aiHttpHelpers": typeof edge_aiHttpHelpers;
  "edge/aiModelBuilder": typeof edge_aiModelBuilder;
  "edge/aiProviders": typeof edge_aiProviders;
  "edge/aiService": typeof edge_aiService;
  http: typeof http;
  "lib/env": typeof lib_env;
  "lib/errors": typeof lib_errors;
  "node/chat": typeof node_chat;
  "node/startup": typeof node_startup;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
