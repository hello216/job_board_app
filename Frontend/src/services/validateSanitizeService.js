const ValidateSanitize = {
  sanitizeAndValidateEmail: (email) => {
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return { error: "Invalid email format", sanitized: null };
    }

    return { error: null, sanitized: email.replace(/[<>]/g, '') };
  },

  validatePassword: (password) => {
    if (password.length < 12) {
      return { error: "Password should be at least 12 characters long", sanitized: password };
    }
    if (password.length > 128) {
      return { error: "Password cannot be longer than 128 characters", sanitized: password };
    }

    return { error: null, sanitized: password };
  },

  sanitizeAndValidateString: (input) => {
    if (typeof input !== 'string') {
      return { error: null, sanitized: input };
    }

    let sanitizedInput = input.replace(/<script>.*?<\/script>/gmi, '');
    sanitizedInput = sanitizedInput.replace(/<style>.*?<\/style>/gmi, '');
    sanitizedInput = sanitizedInput.replace(/[^\w\s]/g, ''); // Remove any non-word and non-whitespace characters

    // Remove suspicious keywords
    const suspiciousKeywords = ['UNION', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'OR', 'AND', 'EXECUTE', 'SYSTEM', 'EXIT', '|', ';', '&&', '||'];
    suspiciousKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      sanitizedInput = sanitizedInput.replace(regex, '');
    });

    return { error: null, sanitized: sanitizedInput };
  },

  sanitizeAndValidateUrl: (url) => {
    try {
      const parsedUrl = new URL(url);
      if (!parsedUrl.protocol || !parsedUrl.host) {
        throw new Error('Invalid URL');
      }
    } catch (error) {
      return { error: "Invalid URL", sanitized: url.replace(/[^\w:\/\.\-\?\&\=\%]/g, '') };
    }

    return { error: null, sanitized: url.replace(/[^\w:\/\.\-\?\&\=\%]/g, '') };
  },

  sanitizeAndValidateStatus: (status) => {
    const allowedStatuses = ['Applied', 'Interviewing', 'Offered', 'Accepted', 'Rejected', 'Not Interested', 'Ghosted'];
    if (!allowedStatuses.includes(status)) {
      return { error: "Invalid status", sanitized: null };
    }

    return { error: null, sanitized: status };
  }
};

export default ValidateSanitize;