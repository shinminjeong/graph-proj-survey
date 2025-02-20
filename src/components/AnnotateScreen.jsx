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
  const [tempBox, setTempBox] = useState(null); // 드래그 중 임시 박스

  // 텍스트 입력
  const [textInput, setTextInput] = useState('');

  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const left = Math.min(startPoint.x, x);
    const top = Math.min(startPoint.y, y);
    const width = Math.abs(x - startPoint.x);
    const height = Math.abs(y - startPoint.y);

    setTempBox({ left, top, width, height });
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

    // 기존 annotationData 복사 후 업데이트
    setAnnotationData((prev) => {
      const exist = prev.find((anno) => anno.imgSrc === currentImgSrc);
      if (exist) {
        return prev.map((anno) =>
          anno.imgSrc === currentImgSrc
            ? { ...anno, boxes: [newBox] } // 박스를 하나만 유지하는 예시
            : anno
        );
      } else {
        // 없으면 새로 생성
        return [
          ...prev,
          {
            imgSrc: currentImgSrc,
            boxes: [newBox],
            // text는 handleNextImage에서 추가
          },
        ];
      }
    });

    setTempBox(null);
  };

  const handleNextImage = () => {
    const currentImgSrc = images[currentIndex];

    const newAnnotationData = (() => {
      const cloned = [...annotationData];
      const index = cloned.findIndex((anno) => anno.imgSrc === currentImgSrc);

      if (index !== -1) {
        cloned[index] = {
          ...cloned[index],
          text: textInput,
        };
      } else {
        cloned.push({
          imgSrc: currentImgSrc,
          boxes: [],
          text: textInput,
        });
      }

      return cloned;
    })();


    setAnnotationData(newAnnotationData);
    setTextInput('');

    // 마지막 이미지인지
    if (currentIndex === images.length - 1) {
      onFinish(newAnnotationData);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const currentImgSrc = images[currentIndex];
  const currentAnno = annotationData.find((anno) => anno.imgSrc === currentImgSrc);
  const existingBoxes = currentAnno?.boxes || [];

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>
        Brush the most prominent region in the chart ({currentIndex + 1} / {images.length})
      </h2>

      <div style={{ display: 'inline-flex', gap: '20px', justifyContent: 'center' }}>
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
          {/* <img
            src={currentImgSrc}
            alt={`img-${currentIndex}`}
            style={{ maxWidth: '600px', maxHeight: '400px' }}
          /> */}
          <img
            src={currentImgSrc}
            alt={`img-${currentIndex}`}
            style={{ maxWidth: '600px', height: '400px', userSelect: 'none', pointerEvents: 'none' }}
            onContextMenu={(e) => e.preventDefault()} // 우클릭 방지
            onDragStart={(e) => e.preventDefault()} // 드래그 방지
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

        {/* 텍스트 입력 영역 */}
        <textarea
          style={{ width: '250px', height: '380px', fontSize: '14px', padding: '8px', resize: 'none' }}
          placeholder="Enter your additional comments here..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
      </div>

      <br />
      <button onClick={handleNextImage} disabled={(existingBoxes.length !== 1)}>
        {currentIndex === images.length - 1 ? 'Finish' : 'Next'}
      </button>
      {/* <button onClick={handleNextImage} disabled={(existingBoxes.length !== 1 || textInput === '')}>
        {currentIndex === images.length - 1 ? 'Finish' : 'Next'}
      </button> */}
    </div>
  );
}

export default AnnotateScreen;
