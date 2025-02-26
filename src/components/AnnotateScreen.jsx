import React, { useState, useRef, useEffect } from 'react';

function AnnotateScreen({
  images,
  onFinish,
  annotationData,
  setAnnotationData,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [tempBox, setTempBox] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [imgHeight, setImgHeight] = useState(380); // 기본 높이 설정

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current) {
      setImgHeight(imgRef.current.naturalHeight);
    }
  }, [currentIndex]); // 이미지 변경 시 높이 업데이트

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
    if (!isDrawing || !tempBox || !containerRef.current) return;
    setIsDrawing(false);

    const currentImgSrc = images[currentIndex];
    const newBox = {
      x: tempBox.left,
      y: tempBox.top,
      w: tempBox.width,
      h: tempBox.height,
    };

    setAnnotationData((prev) => {
      const exist = prev.find((anno) => anno.imgSrc === currentImgSrc);
      if (exist) {
        return prev.map((anno) =>
          anno.imgSrc === currentImgSrc ? { ...anno, boxes: [newBox] } : anno
        );
      } else {
        return [...prev, { imgSrc: currentImgSrc, boxes: [newBox] }];
      }
    });

    setTempBox(null);
  };

  const handleNextImage = () => {
    setTextInput('');

    if (currentIndex === images.length - 1) {
      onFinish(annotationData);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const currentImgSrc = images[currentIndex];
  const currentAnno = annotationData.find((anno) => anno.imgSrc === currentImgSrc);
  const existingBoxes = currentAnno?.boxes || [];

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ textAlign: 'left', color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        Main Session
      </h2>
      <h2>Brush the most prominent region in the chart</h2>

      <div style={{ display: 'inline-flex', gap: '20px', justifyContent: 'center', alignItems: 'start' }}>
        {/* 이미지 + 박스 영역 */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            display: 'inline-block',
            cursor: 'crosshair',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img
            ref={imgRef}
            src={currentImgSrc}
            alt={`img-${currentIndex}`}
            style={{
              width: 'auto',
              height: 'auto',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            onLoad={(e) => setImgHeight(e.target.naturalHeight)} // 이미지 로드 후 높이 설정
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />

          {/* 이미 그린 박스 표시 */}
          {existingBoxes.map((box, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                border: '2px solid red',
                left: box.x,
                top: box.y,
                width: box.w,
                height: box.h,
              }}
            />
          ))}

          {/* 드래그 중 임시 박스 표시 */}
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

        {/* 텍스트 입력 영역 (이미지 높이에 맞추기) */}
        <textarea
          style={{
            width: '250px',
            height: `${imgHeight * 0.9}px`, // 이미지 높이와 동일하게 설정
            fontSize: '14px',
            padding: '8px',
            resize: 'none'
          }}
          placeholder="Please provide a description of the region that you selected."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
      </div>

      <br />
      {/* <button
        style={{
          marginBottom: '30px',
        }}
        onClick={handleNextImage}
        disabled={existingBoxes.length !== 1 || textInput === ''}
      >
        {currentIndex === images.length - 1 ? 'Finish' : 'Next'}
      </button> */}
      <button
        style={{
          marginBottom: '30px',
          padding: '12px 24px',
          fontSize: currentIndex === images.length - 1 ? '18px' : '16px', // Finish 버튼 크기 증가
          fontWeight: 'bold',
          backgroundColor: currentIndex === images.length - 1 ? '#28a745' : '#6c757d', // Finish: 초록색, Next: 회색
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: existingBoxes.length !== 1 || textInput === '' ? 'not-allowed' : 'pointer',
          opacity: existingBoxes.length !== 1 || textInput === '' ? 0.5 : 1, // 비활성화 시 흐리게 표시
          transition: 'background-color 0.3s ease, transform 0.2s ease',
        }}
        onClick={handleNextImage}
        disabled={existingBoxes.length !== 1 || textInput === ''}
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
        {currentIndex === images.length - 1 ? 'Finish' : 'Next'}
      </button>




    </div>
  );
}

export default AnnotateScreen;
