export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-5
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push("At least 8 characters required");
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push("At least one uppercase letter (A-Z)");
  }

  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push("At least one lowercase letter (a-z)");
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push("At least one number (0-9)");
  }

  if (/[@$!%*?&]/.test(password)) {
    score++;
  } else {
    feedback.push("At least one special character (@$!%*?&)");
  }

  return {
    isValid: score === 5,
    score,
    feedback,
  };
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (username.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" };
  }
  if (username.length > 20) {
    return { isValid: false, error: "Username must be less than 20 characters" };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: "Username can only contain letters, numbers, and underscores" };
  }
  return { isValid: true };
}
