import React from 'react';

function StartScreen({ onStart }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome ...</h1>
      <button onClick={onStart}>Start</button>
    </div>
  );
}

export default StartScreen;
