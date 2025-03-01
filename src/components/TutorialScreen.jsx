import React, { useState, useRef, useEffect } from 'react';

function TutorialScreen({ images, onTutorialFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [tempBox, setTempBox] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [imgHeight, setImgHeight] = useState(380); // 기본 높이 설정

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [imgSize, setImgSize] = useState({ width: 'auto', height: 'auto' });

  // 이미지가 바뀔 때마다 naturalHeight 업데이트
  useEffect(() => {
    if (imgRef.current) {
      setImgSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
      // setImgHeight(imgRef.current.naturalHeight);
    }
  }, [currentIndex]);

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setIsDrawing(true);
    setStartPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTempBox({
      left: Math.min(startPoint.x, e.clientX - rect.left),
      top: Math.min(startPoint.y, e.clientY - rect.top),
      width: Math.abs(e.clientX - rect.left - startPoint.x),
      height: Math.abs(e.clientY - rect.top - startPoint.y),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !tempBox) return;
    setIsDrawing(false);
    // 박스는 1개만 유지
    setBoxes([tempBox]);
    setTempBox(null);
  };

  const handleNext = () => {
    setBoxes([]);
    setTextInput('');

    if (currentIndex === images.length - 1) {
      onTutorialFinish();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column', // 세로로 나열
        alignItems: 'center',    // 가운데 정렬
        textAlign: 'center',
        marginTop: '30px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
        color: '#555',
        height: 'auto',
        justifyContent: 'center',
      }}
    >
      {/* 상단 텍스트 영역 (이미지 바로 위) */}
      <div
        style={{
          textAlign: 'left',
          marginBottom: '10px',
          maxWidth: '600px', // 필요에 따라 조절
          width: '100%',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {/* <p style={{ margin: 0, fontWeight: 'bold' }}>Training Session</p> */}
        <p style={{ margin: 0, fontWeight: 'bold' }}>Training Session: Brush the most prominent region in the chart</p>
      </div>

      {/* 이미지 영역 */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          cursor: 'crosshair',
          marginBottom: '20px',
          // maxWidth: '600px', // 필요에 따라 조절
          // width: '100%',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <img
          ref={imgRef}
          src={images[currentIndex]}
          alt={`tutorial-img-${currentIndex}`}
          style={{
            width: imgSize.width,
            height: imgSize.height,
            userSelect: 'none',
            pointerEvents: 'none',
            border: "1px solid black", borderRadius: "8px"
          }}
          onLoad={(e) => setImgSize({
            width: e.target.naturalWidth,
            height: e.target.naturalHeight,
          })}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* 확정된 박스 */}
        {boxes.map((box, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              border: '2px solid red',
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
            }}
          />
        ))}

        {/* 드래그 중 나타나는 임시 박스 */}
        {isDrawing && tempBox && (
          <div
            style={{
              position: 'absolute',
              border: '2px dashed blue',
              left: tempBox.left,
              top: tempBox.top,
              width: tempBox.width,
              height: tempBox.height,
            }}
          />
        )}
      </div>

      {/* 텍스트 입력 영역 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          // maxWidth: '600px', // 필요에 따라 조절
          // width: '100%',
          textAlign: 'left',
          marginBottom: '20px',
        }}
      >
        <label
          htmlFor="description"
          style={{
            marginBottom: '6px',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          What characteristic(s) of this region made you select it as the most prominent?
        </label>
        <textarea
          id="description"
          style={{
            width: imgSize.width, // 이미지 너비에 맞춤
            // height: `${imgHeight * 0.3}px`, // 이미지 높이를 참고하여 세로 길이 설정
            height: '100px', // 이미지 높이를 참고하여 세로 길이 설정
            fontSize: '14px',
            padding: '8px',
            resize: 'none',
            boxSizing: 'border-box', // 패딩 포함 크기 계산
          }}
          //   placeholder="Please provide a description of the region that you selected."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
      </div>

      {/* Next / Finish 버튼 */}
      <button
        style={{
          marginBottom: '30px',
          padding: '12px 24px',
          fontSize: currentIndex === images.length - 1 ? '18px' : '16px', // 마지막 버튼 크기 증가
          fontWeight: 'bold',
          backgroundColor:
            currentIndex === images.length - 1 ? '#28a745' : '#6c757d', // Finish: 초록색, Next: 회색
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: boxes.length !== 1 || textInput === '' ? 'not-allowed' : 'pointer',
          opacity: boxes.length !== 1 || textInput === '' ? 0.5 : 1, // 비활성화 시 흐리게 표시
          transition: 'background-color 0.3s ease, transform 0.2s ease',
        }}
        onClick={handleNext}
        disabled={boxes.length !== 1 || textInput === ''}
        onMouseEnter={(e) => {
          if (currentIndex === images.length - 1) {
            e.target.style.backgroundColor = '#218838'; // Finish 버튼: 진한 초록색
          } else {
            e.target.style.backgroundColor = '#5a6268'; // Next 버튼: 진한 회색
          }
        }}
        onMouseLeave={(e) => {
          if (currentIndex === images.length - 1) {
            e.target.style.backgroundColor = '#28a745'; // Finish 버튼: 원래 초록색
          } else {
            e.target.style.backgroundColor = '#6c757d'; // Next 버튼: 원래 회색
          }
        }}
      >
        {currentIndex === images.length - 1
          ? 'Finish Tutorial & Start Survey'
          : 'Next'}
      </button>
    </div>
  );
}

export default TutorialScreen;
