/**
 * Validation middleware for user registration
 */
export function validateRegistration(req, res, next) {
  const { email, username, password } = req.body;

  const errors = [];

  // Email validation
  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  // Username validation
  if (!username || !username.trim()) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  } else if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

/**
 * Validation middleware for user login
 */
export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

/**
 * Validation middleware for Webull credentials
 */
export function validateWebullCredentials(req, res, next) {
  const { webullEmailOrPhone, webullPassword } = req.body;

  const errors = [];

  if (!webullEmailOrPhone || !webullEmailOrPhone.trim()) {
    errors.push('Webull email or phone is required');
  }

  if (!webullPassword) {
    errors.push('Webull password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}
