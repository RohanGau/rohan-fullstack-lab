/**
 * SECURITY: Sanitize MongoDB query filters to prevent NoSQL injection
 *
 * Blocks dangerous MongoDB operators that could be injected via query params:
 * - $where: Arbitrary JavaScript execution
 * - $regex: ReDoS attacks
 * - $expr: Expression injection
 * - $jsonSchema: Schema manipulation
 * - Other operators that could leak data or cause DoS
 *
 * @param filter - Raw filter object from client
 * @param allowedFields - Explicit list of allowed field names
 * @returns Sanitized filter object safe for MongoDB queries
 */
export function sanitizeMongoFilter(
  filter: Record<string, any> | null | undefined,
  allowedFields: string[]
): Record<string, any> {
  if (!filter || typeof filter !== 'object') {
    return {};
  }

  const sanitized: Record<string, any> = {};

  // List of dangerous MongoDB operators to block
  const blockedOperators = [
    '$where',
    '$expr',
    '$jsonSchema',
    '$regex', // Block regex to prevent ReDoS
    '$function',
    '$accumulator',
    '$text', // Could be abused for performance attacks
  ];

  for (const [key, value] of Object.entries(filter)) {
    // Block any MongoDB operators at root level
    if (key.startsWith('$')) {
      continue;
    }

    // Only allow explicitly whitelisted fields
    if (!allowedFields.includes(key)) {
      continue;
    }

    // If value is an object, check for dangerous operators
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const innerSanitized: Record<string, any> = {};
      let hasValidOperator = false;

      for (const [innerKey, innerValue] of Object.entries(value)) {
        // Block dangerous operators in nested objects
        if (blockedOperators.includes(innerKey)) {
          continue;
        }

        // Allow safe comparison operators only
        const safeOperators = [
          '$eq',
          '$ne',
          '$gt',
          '$gte',
          '$lt',
          '$lte',
          '$in',
          '$nin',
          '$exists',
        ];
        if (innerKey.startsWith('$') && !safeOperators.includes(innerKey)) {
          continue;
        }

        innerSanitized[innerKey] = innerValue;
        hasValidOperator = true;
      }

      if (hasValidOperator) {
        sanitized[key] = innerSanitized;
      }
    } else {
      // Simple value, allow it
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize sort field names
 */
export function sanitizeSortField(sortField: string, allowedFields: string[]): string | null {
  if (!sortField || typeof sortField !== 'string') {
    return null;
  }

  // Remove any MongoDB operators or special characters
  const cleaned = sortField.replace(/^\$/, '').replace(/[^a-zA-Z0-9_]/g, '');

  if (allowedFields.includes(cleaned)) {
    return cleaned;
  }

  return null;
}
