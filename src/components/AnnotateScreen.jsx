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

  // 이미지 높이를 동적으로 조절하기 위한 상태
  const [imgHeight, setImgHeight] = useState(380);

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // ① 이미지가 바뀔 때마다 image_up_timestamp 설정
  //    (이미 처리된 이미지라면 중복 설정하지 않음)
  // ─────────────────────────────────────────────────────────────────────────────
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
            return { ...anno, image_up_timestamp: now };
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

  // ─────────────────────────────────────────────────────────────────────────────
  // ② 이미지 로딩 후 실제 높이를 가져와서 텍스트에어리어의 높이를 동기화
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (imgRef.current) {
      setImgHeight(imgRef.current.naturalHeight);
    }
  }, [currentIndex]);

  // 마우스 드래그 시작
  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setIsDrawing(true);
    setStartPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // 드래그 중 박스 영역 설정
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

  // 드래그 끝 (박스 그리기 완료)
  const handleMouseUp = () => {
    if (!isDrawing || !tempBox || !containerRef.current) return;
    setIsDrawing(false);

    const currentImgSrc = images[currentIndex];
    const now = Date.now(); // box_drawn_timestamp

    const newBox = {
      x: tempBox.left,
      y: tempBox.top,
      w: tempBox.width,
      h: tempBox.height,
    };

    setAnnotationData((prev) => {
      const exist = prev.find((anno) => anno.imgSrc === currentImgSrc);
      if (exist) {
        // 기존 데이터가 있으면 해당 이미지에 박스 및 box_drawn_timestamp 추가
        return prev.map((anno) => {
          if (anno.imgSrc === currentImgSrc) {
            return {
              ...anno,
              boxes: [newBox], // 예시: 박스 한 개만 유지
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
            text: '',
            box_drawn_timestamp: now,
          },
        ];
      }
    });

    setTempBox(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ③ Next 버튼 눌렀을 때 next_button_timestamp 저장 + text 내용 반영
  // ─────────────────────────────────────────────────────────────────────────────
  const handleNextImage = () => {
    const currentImgSrc = images[currentIndex];
    const now = Date.now(); // next_button_timestamp

    // annotationData 업데이트
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
        // 혹시라도 이미지 데이터가 없었다면 새로 추가
        cloned.push({
          imgSrc: currentImgSrc,
          boxes: [],
          text: textInput,
          next_button_timestamp: now,
        });
      }
      return cloned;
    })();

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

  // 현재 이미지 & 이미 드로잉된 박스
  const currentImgSrc = images[currentIndex];
  const currentAnno = annotationData.find((anno) => anno.imgSrc === currentImgSrc);
  const existingBoxes = currentAnno?.boxes || [];

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ textAlign: 'left', color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        Brush the most prominent region in the chart
      </h2>


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
              pointerEvents: 'none',
            }}
            onLoad={(e) => setImgHeight(e.target.naturalHeight)}
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
            height: `${imgHeight * 0.9}px`, // 이미지 높이 대비 90%로 설정 (필요시 조정)
            fontSize: '14px',
            padding: '8px',
            resize: 'none',
          }}
          placeholder="Please provide a description of the region that you selected."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
      </div>

      <br />
      <button
        style={{
          marginBottom: '30px',
          padding: '12px 24px',
          fontSize: currentIndex === images.length - 1 ? '18px' : '16px',
          fontWeight: 'bold',
          backgroundColor: currentIndex === images.length - 1 ? '#28a745' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: existingBoxes.length !== 1 || textInput === '' ? 'not-allowed' : 'pointer',
          opacity: existingBoxes.length !== 1 || textInput === '' ? 0.5 : 1,
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
