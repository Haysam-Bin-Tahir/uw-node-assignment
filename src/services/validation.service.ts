interface ValidationError {
  message: string;
  details?: Record<string, string | null>;
}

export default class ValidationService {
  static validateEmail(email: string): ValidationError | null {
    if (!email) {
      return {
        message: "Missing required field",
        details: { email: "Email is required" }
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        message: "Invalid email format"
      };
    }

    return null;
  }

  static validatePassword(password: string): ValidationError | null {
    if (!password) {
      return {
        message: "Missing required field",
        details: { password: "Password is required" }
      };
    }

    if (password.length < 6) {
      return {
        message: "Password must be at least 6 characters long"
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        message: "Password must contain at least one uppercase letter"
      };
    }

    if (!/\d/.test(password)) {
      return {
        message: "Password must contain at least one number"
      };
    }

    return null;
  }

  static validateCredentials(email: string, password: string): ValidationError | null {
    const emailError = this.validateEmail(email);
    if (emailError) return emailError;

    const passwordError = this.validatePassword(password);
    if (passwordError) return passwordError;

    return null;
  }
} 