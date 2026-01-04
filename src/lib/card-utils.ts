// Utility functions for card validation and masking

export function isValidMaskedCard(input: string): boolean {
  // Remove spaces and dashes
  const cleaned = input.replace(/[\s-]/g, "");
  
  // Check if it contains asterisks (masked)
  const hasMask = cleaned.includes("*") || cleaned.includes("X") || cleaned.includes("x");
  
  // If no masking, check if it's a full 16-digit card (reject)
  if (!hasMask && /^\d{16}$/.test(cleaned)) {
    return false; // Reject full card numbers
  }
  
  // Accept formats like: 4242********1234, 4242-****-****-1234, etc.
  // Must have first 4 digits visible
  const firstFour = cleaned.substring(0, 4);
  if (!/^\d{4}$/.test(firstFour)) {
    return false;
  }
  
  // Must be masked in the middle
  if (!hasMask) {
    return false;
  }
  
  return true;
}

export function extractBIN(maskedCard: string): string {
  // Extract first 4 digits (BIN for our mock)
  const cleaned = maskedCard.replace(/[\s-]/g, "");
  return cleaned.substring(0, 4);
}

export function formatCardInput(value: string): string {
  // Format as: XXXX-****-****-XXXX
  const cleaned = value.replace(/[^\d*xX-\s]/g, "").toUpperCase();
  
  // Add dashes every 4 characters
  const parts = cleaned.replace(/[\s-]/g, "").match(/.{1,4}/g);
  return parts ? parts.join("-") : cleaned;
}

export function sanitizeCardDisplay(input: string): string {
  // Never display the raw input back - always mask
  const cleaned = input.replace(/[\s-]/g, "");
  if (cleaned.length >= 4) {
    return `${cleaned.substring(0, 4)}-****-****-****`;
  }
  return "****-****-****-****";
}
