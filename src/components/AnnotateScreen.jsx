import React, { useState, useRef, useEffect } from 'react';

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

  
  useEffect(() => {
    if (!images || !images[currentIndex]) return;

    const currentImgSrc = images[currentIndex];
    const now = Date.now(); 

    setAnnotationData((prev) => {
      const exist = prev.find((anno) => anno.imgSrc === currentImgSrc);

      // 이미 이 이미지에 대한 정보가 있고, image_up_timestamp가 없다면 추가
      if (exist && !exist.image_up_timestamp) {
        return prev.map((anno) => {
          if (anno.imgSrc === currentImgSrc) {
            return {
              ...anno,
              image_up_timestamp: now,
            };
          }
          return anno;
        });
      } 
      // 아직 등록된 정보가 없다면 새로 push
      else if (!exist) {
        return [
          ...prev,
          {
            imgSrc: currentImgSrc,
            boxes: [],
            text: '',
            image_up_timestamp: now,
          },
        ];
      }

      // 이미 exist가 있고, image_up_timestamp도 있다면 그대로
      return prev;
    });
  }, [currentIndex, images, setAnnotationData]);

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
    const now = Date.now();

    setAnnotationData((prev) => {
      const exist = prev.find((anno) => anno.imgSrc === currentImgSrc);
      if (exist) {
        // 기존 데이터가 있으면 덮어쓰기(박스 1개만 유지 예시)
        return prev.map((anno) => {
          if (anno.imgSrc === currentImgSrc) {
            return {
              ...anno,
              boxes: [newBox],
              box_drawn_timestamp: now,
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
            box_drawn_timestamp: now,
          },
        ];
      }
    });

    setTempBox(null);
  };

  const handleNextImage = () => {
    const currentImgSrc = images[currentIndex];
    const now = Date.now(); // next_button_timestamp


    const newAnnotationData = (() => {
      const cloned = [...annotationData];
      const index = cloned.findIndex((anno) => anno.imgSrc === currentImgSrc);

      if (index !== -1) {
        cloned[index] = {
          ...cloned[index],
          text: textInput,
          next_button_timestamp: now,
        };
      } else {
        cloned.push({
          imgSrc: currentImgSrc,
          boxes: [],
          text: textInput,
          next_button_timestamp: now,
        });
      }
      return cloned;
    })();

    // 최신값으로 갱신
    setAnnotationData(newAnnotationData);
    setTextInput('');

    // 마지막 이미지인지 체크
    if (currentIndex === images.length - 1) {
      // 마지막이면 onFinish에 최신 데이터 넘겨주기
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
      <h2 style={{ textAlign: 'left', color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
                Main Session
            </h2>
      <h2>
        Brush the most prominent region in the chart
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
          <img
            src={currentImgSrc}
            alt={`img-${currentIndex}`}
            style={{ maxWidth: '600px', height: '400px', userSelect: 'none', pointerEvents: 'none' }}
            onContextMenu={(e) => e.preventDefault()} // 우클릭 방지
            onDragStart={(e) => e.preventDefault()}   // 드래그 방지
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
          placeholder="Please provide a description of the region that you selected..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
      </div>

      <br />
      <button onClick={handleNextImage} disabled={existingBoxes.length !== 1 || textInput === ''}>
        {currentIndex === images.length - 1 ? 'Finish' : 'Next'}
      </button>
    </div>
  );
}

export default AnnotateScreen;
