import React, { useState, useRef } from 'react';

function TutorialScreen({ images, onTutorialFinish }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [tempBox, setTempBox] = useState(null);

    // 박스, 텍스트 (튜토리얼용 로컬 상태)
    const [boxes, setBoxes] = useState([]);
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
        setTempBox({
            left: Math.min(startPoint.x, x),
            top: Math.min(startPoint.y, y),
            width: Math.abs(x - startPoint.x),
            height: Math.abs(y - startPoint.y),
        });
    };

    const handleMouseUp = () => {
        if (!isDrawing || !tempBox) return;
        setIsDrawing(false);

        // 튜토리얼에선 박스 1개만 유지
        setBoxes([tempBox]);
        setTempBox(null);
    };

    const handleNext = () => {
        // 현재 이미지에 대한 설명이 끝났으므로 초기화
        setBoxes([]);
        setTextInput('');

        if (currentIndex === images.length - 1) {
            // 마지막 이미지 처리
            onTutorialFinish();
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    // images 배열에서 현재 인덱스의 이미지 src
    const currentImgSrc = images[currentIndex];

    return (
        <div style={{ textAlign: 'center' }}>
            <h2 style={{ textAlign: 'left', color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
                Training Session
            </h2>
            <h2>Brush the most prominent region in the chart</h2>

            <div style={{ display: 'inline-flex', gap: '20px', justifyContent: 'center' }}>
                {/* 이미지 영역 */}
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
                        alt={`tutorial-img-${currentIndex}`}
                        style={{ maxWidth: '600px', height: '400px', userSelect: 'none', pointerEvents: 'none' }}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                    />

                    {/* 이미 그린 박스 표시 */}
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

                    {/* 드래그 중 임시 박스 */}
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
                    placeholder="Describe the region you've selected..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                />
            </div>

            <br />
            <button onClick={handleNext} disabled={boxes.length !== 1 || textInput === ''}>
                {currentIndex === images.length - 1 ? 'Finish Tutorial and Start Main' : 'Next'}
            </button>
        </div>
    );
}

export default TutorialScreen;
