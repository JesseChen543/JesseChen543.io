import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

/**
 * Validate email domain by checking MX records
 */
async function validateEmailDomain(email) {
  try {
    const domain = email.split('@')[1];
    if (!domain) {
      return { valid: false, message: 'Invalid email format' };
    }

    const mxRecords = await resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      return { valid: true, message: 'Email domain is valid' };
    } else {
      return { valid: false, message: `Email domain "${domain}" does not exist` };
    }
  } catch (error) {
    console.error('Error validating email domain:', error);
    return { valid: false, message: 'Email domain does not exist or cannot be verified' };
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ valid: false, message: 'Email is required' });
    }

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(200).json({ valid: false, message: 'Invalid email format' });
    }

    // Check domain MX records
    const result = await validateEmailDomain(email);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error in email validation:', error);
    return res.status(500).json({ valid: false, message: 'Error validating email' });
  }
}
