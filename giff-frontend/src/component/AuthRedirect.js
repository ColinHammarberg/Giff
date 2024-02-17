import React, { useEffect } from 'react';
import queryString from 'query-string';

const AuthRedirect = () => {
  useEffect(() => {
    const { dest } = queryString.parse(window.location.search);
    if (dest) {
      window.location.href = dest;
    } else {
      // Handle the case where 'dest' is not provided
      console.error('Destination URL not provided.');
    }
  }, []);

  return (
    <div>
      Redirecting to authentication provider...
    </div>
  );
};

export default AuthRedirect;
