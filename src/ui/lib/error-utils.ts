/**
 * Error Utility Functions
 * 
 * Provides user-friendly error messages without exposing internal database
 * structure, table names, or sensitive technical details to end users.
 * 
 * Security: Database errors may contain schema information, column names,
 * and constraint details that could aid attackers. This utility maps 
 * technical errors to safe, user-friendly messages.
 */

interface PostgresError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

/**
 * Maps database/API errors to user-friendly messages.
 * Technical details are logged server-side only.
 * 
 * @param error - The error object from Supabase or other sources
 * @param context - Optional context for more specific error messages
 * @returns A safe, user-friendly error message
 */
export function getUserFriendlyError(
  error: unknown,
  context?: 'auth' | 'submit' | 'update' | 'delete' | 'fetch' | 'config'
): string {
  // Log the full error for debugging (only visible in dev console/server logs)
  console.error('[Error]:', error);

  // Handle null/undefined
  if (!error) {
    return getDefaultMessage(context);
  }

  const err = error as PostgresError & Error;
  const message = err.message?.toLowerCase() || '';
  const code = err.code || '';

  // PostgreSQL error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
  
  // Authentication errors - can be more specific as these are user-facing
  if (context === 'auth') {
    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (message.includes('already registered')) {
      return 'This email is already registered. Please sign in instead.';
    }
    if (message.includes('email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    if (message.includes('password')) {
      return 'Password does not meet requirements. Please use a stronger password.';
    }
    if (message.includes('rate limit') || code === '429') {
      return 'Too many attempts. Please wait a moment and try again.';
    }
  }

  // Constraint violation errors
  if (code === '23505') {
    // Unique violation - don't reveal which field
    return 'A record with this information already exists.';
  }
  if (code === '23503') {
    // Foreign key violation
    return 'This action cannot be completed due to related records.';
  }
  if (code === '23514') {
    // Check constraint violation
    if (context === 'config') {
      return 'The value entered is outside the allowed range. Please check your input.';
    }
    return 'The value entered is not valid. Please check your input.';
  }
  if (code === '23502') {
    // Not null violation
    return 'Required information is missing. Please fill in all required fields.';
  }

  // RLS policy denials
  if (message.includes('rls') || message.includes('policy') || message.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }

  // Row not found
  if (message.includes('no rows') || message.includes('not found')) {
    return 'The requested item could not be found.';
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Validation errors from our triggers
  if (message.includes('invalid sla value')) {
    return 'SLA hours must be between 1 and 8760 (1 year).';
  }
  if (message.includes('missing required sla key')) {
    return 'All severity levels must have an SLA duration configured.';
  }

  // Return context-appropriate default message
  return getDefaultMessage(context);
}

/**
 * Returns a default error message based on context
 */
function getDefaultMessage(context?: string): string {
  switch (context) {
    case 'auth':
      return 'Authentication failed. Please try again.';
    case 'submit':
      return 'Unable to submit. Please try again.';
    case 'update':
      return 'Unable to save changes. Please try again.';
    case 'delete':
      return 'Unable to delete. Please try again.';
    case 'fetch':
      return 'Unable to load data. Please refresh the page.';
    case 'config':
      return 'Unable to save configuration. Please check your values and try again.';
    default:
      return 'An error occurred. Please try again.';
  }
}

/**
 * Type guard to check if an error has a message property
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}
