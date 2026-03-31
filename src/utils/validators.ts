export function validatePort(port: number | string): string | null {
  const num = typeof port === 'string' ? parseInt(port, 10) : port;
  if (isNaN(num) || num < 1 || num > 65535) {
    return 'Port must be between 1 and 65535';
  }
  return null;
}

export function validateHostname(host: string): string | null {
  if (!host || !host.trim()) {
    return 'Hostname is required';
  }
  const trimmed = host.trim();
  // Allow IP addresses and hostnames
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const hostnamePattern =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  if (!ipPattern.test(trimmed) && !hostnamePattern.test(trimmed)) {
    return 'Enter a valid IP address or hostname';
  }
  return null;
}

export function validateSSHKey(key: string): string | null {
  if (!key || !key.trim()) {
    return 'SSH key is required';
  }
  const trimmed = key.trim();
  if (
    !trimmed.includes('BEGIN') ||
    !trimmed.includes('PRIVATE KEY') ||
    !trimmed.includes('END')
  ) {
    return 'Must be a valid PEM-formatted private key';
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email.trim())) {
    return 'Enter a valid email address';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}
