/**
 * Status Pages Feature Public API
 *
 * Re-exports everything that should be accessible from outside this feature.
 */

// API hooks
export {
  useStatusPages,
  useStatusPagesSuspense,
  useStatusPage,
  useStatusPageBySlug,
} from "./api/queries";

export {
  useCreateStatusPage,
  useUpdateStatusPage,
  useDeleteStatusPage,
  useGenerateSlug,
} from "./api/mutations";

// Query keys (for manual cache operations)
export { statusPageKeys } from "./api/keys";
