export const validateGenerationRequest = (body: any) => {
  const errors: string[] = [];

  const allowedTypes = [
    'resume',
    'cv',
    'letter',
    'presentation'
  ];

  // Prompt validation
  if (!body.prompt) {
    errors.push('Prompt is required');
  } else if (typeof body.prompt !== 'string') {
    errors.push('Prompt must be a string');
  } else if (body.prompt.trim().length < 5) {
    errors.push('Prompt is too short');
  } else if (body.prompt.length > 5000) {
    errors.push('Prompt exceeds maximum length');
  }

  // Type validation
  if (!body.type) {
    errors.push('Type is required');
  } else if (typeof body.type !== 'string') {
    errors.push('Type must be a string');
  } else if (!allowedTypes.includes(body.type)) {
    errors.push('Invalid template type');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};