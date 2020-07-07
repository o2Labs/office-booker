type ErrorMessage = {
  message: string;
  error: string;
  reference: string;
};

export const formatError = (error: Error): string => {
  // Convert from JSON to object
  try {
    const errorMessage: ErrorMessage = JSON.parse(error.message);
    const { message, reference } = errorMessage;

    return `${message} (Ref: ${reference})`;
  } catch (e) {
    // Not JSON, just return the raw message
    return error.message;
  }
};
