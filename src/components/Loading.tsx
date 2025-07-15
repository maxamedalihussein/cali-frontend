import React from 'react';

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <img
        src="/dual-spinner.svg"
        alt="Loading..."
        className="w-20 h-20"
      />
    </div>
  );
};

export default Loading; 