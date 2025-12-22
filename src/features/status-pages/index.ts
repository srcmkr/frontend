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

// Action hooks (for components to call mutations directly)
export { useStatusPageActions } from "./hooks/use-status-page-actions";

// Query keys (for manual cache operations)
export { statusPageKeys } from "./api/keys";
