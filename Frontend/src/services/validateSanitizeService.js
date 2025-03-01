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

    // Allow periods in addition to word characters and whitespace
    sanitizedInput = sanitizedInput.replace(/[^\w\s\.]/g, '');

    // Remove suspicious keywords
    const suspiciousKeywords = ['UNION', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'OR', 'AND', 'EXECUTE', 'SYSTEM', 'EXIT', '|', ';', '&&', '||'];
    suspiciousKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      sanitizedInput = sanitizedInput.replace(regex, '');
    });

    if (sanitizedInput.length > 30) {
      return { error: 'Input exceeds 30 characters', sanitized: sanitizedInput.substring(0, 30) };
    }

    return { error: null, sanitized: sanitizedInput };
  },

  sanitizeAndValidateNotes: (input) => {
      const MAX_LENGTH = 500;

      if (typeof input !== 'string') {
          return { error: null, sanitized: input };
      }

      // Remove script and style tags (handles multiline cases)
      let sanitizedInput = input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
      sanitizedInput = sanitizedInput.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');

      // Allow standard punctuation while removing harmful characters
      sanitizedInput = sanitizedInput.replace(/[^a-zA-Z0-9\s.,'!?;:()"-]/g, '');

      // Remove SQL keywords case-insensitively and globally
      const suspiciousKeywords = ['UNION', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 
                                  'OR', 'AND', 'EXECUTE', 'SYSTEM', 'EXIT', '|', '&&', '||'];
      suspiciousKeywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi'); 
          sanitizedInput = sanitizedInput.replace(regex, '');
      });

      if (sanitizedInput.length > MAX_LENGTH) {
          return { error: `Input exceeds ${MAX_LENGTH} characters`, sanitized: sanitizedInput.substring(0, MAX_LENGTH) };
      }

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
    const allowedStatuses = ['Applied', 'Interviewing', 'Offered', 'Accepted', 'Rejected', 'Not Interested', 'NotInterested', 'Ghosted'];
    if (!allowedStatuses.includes(status)) {
      return { error: "Invalid status", sanitized: null };
    }

    return { error: null, sanitized: status };
  }
};

export default ValidateSanitize;