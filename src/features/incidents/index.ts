/**
 * Incidents Feature Public API
 *
 * Re-exports everything that should be accessible from outside this feature.
 */

// API hooks
export {
  useIncidents,
  useIncidentsSuspense,
  useIncident,
  useIncidentStats,
} from "./api/queries";

export {
  useCreateIncident,
  useUpdateIncident,
  useDeleteIncident,
  useResolveIncident,
  useAddIncidentUpdate,
  useEditIncidentUpdate,
  useDeleteIncidentUpdate,
} from "./api/mutations";

// Query keys (for manual cache operations)
export { incidentKeys } from "./api/keys";

// API types
export type {
  CreateIncidentUpdateInput,
  EditIncidentUpdateInput,
} from "./api/incident-api";
