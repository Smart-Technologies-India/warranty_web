import {
  InferInput,
  boolean,
  minValue,
  number,
  object,
  string,
  pipe,
  nullish,
  literal,
  union,
  maxLength,
} from "valibot";

const UpdateTicketSchema = object({
  status: union([
    literal("OPEN"),
    literal("IN_PROGRESS"), 
    literal("CLOSED"),
  ], "Please select a valid status"),
  diagnostic_notes: nullish(
    pipe(
      string(),
      maxLength(500, "Diagnostic notes cannot exceed 500 characters")
    )
  ),
  resolution_notes: nullish(
    pipe(
      string(),
      maxLength(1000, "Resolution notes cannot exceed 1000 characters")
    )
  ),
  assigned_to_id: nullish(
    pipe(
      number(),
      minValue(1, "Please select a valid assignee")
    )
  ),
  level: nullish(
    pipe(
      number(),
      minValue(1, "Level must be at least 1")
    )
  ),
  approval_required: boolean(),
  approval_notes: nullish(
    pipe(
      string(),
      maxLength(500, "Approval notes cannot exceed 500 characters")
    )
  ),
});

type UpdateTicketForm = InferInput<typeof UpdateTicketSchema>;
export { UpdateTicketSchema, type UpdateTicketForm };