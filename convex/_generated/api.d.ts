/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as authInternal from "../authInternal.js";
import type * as authNode from "../authNode.js";
import type * as config from "../config.js";
import type * as crons from "../crons.js";
import type * as inspections from "../inspections.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_config from "../lib/config.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_inspections from "../lib/inspections.js";
import type * as lib_mo from "../lib/mo.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_rules from "../lib/rules.js";
import type * as lib_sessions from "../lib/sessions.js";
import type * as lib_totals from "../lib/totals.js";
import type * as lib_users from "../lib/users.js";
import type * as lib_validators from "../lib/validators.js";
import type * as maintenance from "../maintenance.js";
import type * as mo from "../mo.js";
import type * as problems from "../problems.js";
import type * as seed from "../seed.js";
import type * as stats from "../stats.js";
import type * as users from "../users.js";
import type * as usersInternal from "../usersInternal.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  audit: typeof audit;
  auth: typeof auth;
  authInternal: typeof authInternal;
  authNode: typeof authNode;
  config: typeof config;
  crons: typeof crons;
  inspections: typeof inspections;
  "lib/audit": typeof lib_audit;
  "lib/auth": typeof lib_auth;
  "lib/config": typeof lib_config;
  "lib/errors": typeof lib_errors;
  "lib/inspections": typeof lib_inspections;
  "lib/mo": typeof lib_mo;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/rules": typeof lib_rules;
  "lib/sessions": typeof lib_sessions;
  "lib/totals": typeof lib_totals;
  "lib/users": typeof lib_users;
  "lib/validators": typeof lib_validators;
  maintenance: typeof maintenance;
  mo: typeof mo;
  problems: typeof problems;
  seed: typeof seed;
  stats: typeof stats;
  users: typeof users;
  usersInternal: typeof usersInternal;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
