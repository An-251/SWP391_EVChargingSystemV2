import React from 'react';

const EmployeeTest = () => {
  console.log('✅ EmployeeTest component rendering');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: 'green' }}>✅ Employee Test Page Works!</h1>
      <p>If you see this, React routing and component rendering are working.</p>
      <div style={{ background: '#f0f0f0', padding: '10px', marginTop: '20px' }}>
        <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
        <p><strong>Status:</strong> Component loaded successfully</p>
      </div>
    </div>
  );
};

export default EmployeeTest;
