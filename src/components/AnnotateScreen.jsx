import React, { useState, useRef } from 'react';

function AnnotateScreen({
  images,
  onFinish,
  annotationData,
  setAnnotationData,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 드래그 상태
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [tempBox, setTempBox] = useState(null); // 드래그 중 임시 박스

  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentPoint({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPoint({ x, y });

    const left = Math.min(startPoint.x, x);
    const top = Math.min(startPoint.y, y);
    const width = Math.abs(x - startPoint.x);
    const height = Math.abs(y - startPoint.y);

    setTempBox({ left, top, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !tempBox) return;
    setIsDrawing(false);

    const currentImgSrc = images[currentIndex];
    const newBox = {
      x: tempBox.left,
      y: tempBox.top,
      w: tempBox.width,
      h: tempBox.height,
    };

    // annotationData에서 해당 이미지의 boxes를 업데이트
    setAnnotationData((prev) => {
      // 현재 이미지에 대한 기존 데이터
      const exist = prev.find((anno) => anno.imgSrc === currentImgSrc);

      console.log('current index : ', currentIndex);
      console.log('annotationData', annotationData);
      console.log('annotationData length', annotationData.length);

      if (exist) {
        return prev.map((anno) => {
          if (anno.imgSrc === currentImgSrc) {
            return {
              ...anno,
              // boxes: [...anno.boxes, newBox],
              boxes: [newBox],
            };
          }
          return anno;
        });
      } else {
        // 없으면 새로 생성
        return [
          ...prev,
          {
            imgSrc: currentImgSrc,
            boxes: [newBox],
          },
        ];
      }
    });

    setTempBox(null);
  };

  // "다음" 버튼
  const handleNextImage = () => {
    console.log('current index : ', currentIndex);
    console.log('annotationData', annotationData);
    console.log('annotationData length', annotationData.length);


    if (currentIndex === images.length - 1) {
      // 마지막 이미지라면 onFinish() 호출
      onFinish();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const currentImgSrc = images[currentIndex];
  const currentAnno = annotationData.find((anno) => anno.imgSrc === currentImgSrc);
  const existingBoxes = currentAnno ? currentAnno.boxes : [];

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>
        Image {currentIndex + 1} / {images.length}
      </h2>

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
          src={currentImgSrc}
          alt={`img-${currentIndex}`}
          style={{ maxWidth: '600px', maxHeight: '400px' }}
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

      <br />
      <button onClick={handleNextImage} disabled={1 !== existingBoxes.length}>
        {currentIndex === images.length - 1 ? '완료' : '다음'}
      </button>
    </div>
  );
}

export default AnnotateScreen;
