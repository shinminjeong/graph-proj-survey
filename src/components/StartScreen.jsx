import React from 'react';

function StartScreen({ onStart }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Drawing Bounding Box in Graph</h1>
      <p style={{ margin: '20px 0', fontSize: '16px', color: '#555' }}>
        - Draw a Bounding Box around the area catches your attention by mouse dragging<br />
        - You should draw a Box to move for the next graph image<br />
        - If you drew the box incorrectly, you can redraw it to overwrite the previous one
      </p>
      
      <button onClick={onStart}>Start</button>
    </div>
  );
}

export default StartScreen;
