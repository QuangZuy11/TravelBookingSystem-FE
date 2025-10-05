import React from 'react';

export const ErrorAlert = ({ message }) => {
  return (
    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
      {message}
    </div>
  );
};

export default ErrorAlert;