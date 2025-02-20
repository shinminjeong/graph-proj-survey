import './App.css';
import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import AnnotateScreen from './components/AnnotateScreen';
import EndScreen from './components/EndScreen';

function App() {
    const [screen, setScreen] = useState('start'); // 'start' -> 'annotate' -> 'end'
    const [annotationData, setAnnotationData] = useState([]);
    const [imagesToAnnotate, setImagesToAnnotate] = useState([]);
    const [isSending, setIsSending] = useState(false); // 전송 중 여부

    const [userId, setUserId] = useState('');

    const base = import.meta.env.BASE_URL;
    const images = import.meta.glob('/src/assets/images/*.{png,jpg,jpeg,svg}', {
        eager: true
    });

    // 2) 실제 빌드 후 사용할 수 있는 URL만 추출
    const wholeImages = Object.values(images).map((module) => module.default);

    const getRandomImages = (wholeImages, count = 5) => {
        const shuffled = [...wholeImages].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    useEffect(() => {
        if (wholeImages.length > 0) {
            setImagesToAnnotate(getRandomImages(wholeImages));
        }
    }, []);

    // 구글 Apps Script 웹 앱 URL (배포 후 발급받은 URL)
    const WEB_APP_URL =
        'https://script.google.com/macros/s/AKfycbyN50ItId7fBzUh9o3dmdePHUikxQOlT_qHZJiAKz14uUfpQnHCag0PGtInV65v8ODq/exec';

    // 사용자를 식별하고 싶다면 userId를 받을 수도 있음
    // const userId = '익명 사용자';

    const handleStart = () => {
        setScreen('annotate');
    };

    const handleFinish = async () => {
        // 전송 시작 시 isSending을 true로 바꿔서 로딩 표시
        setIsSending(true);

        const formBody = new URLSearchParams();
        formBody.append('userId', userId);
        console.log(JSON.stringify(annotationData));
        formBody.append('annotationData', JSON.stringify(annotationData));

        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                },
                body: formBody.toString(),
            });

            const result = await response.json();
            console.log('Google Script response:', result);

            // 성공적으로 수신했으면 전송 상태 해제 후 'end' 화면으로
            setIsSending(false);
            setScreen('end');
        } catch (err) {
            // 에러 발생 시
            console.error('Error sending data to Google Sheets:', err);
            alert('Failed to send data.');
            setIsSending(false);
        }
    };

    return (
        <div className='app-container'>
            {screen === 'start' && <StartScreen onStart={handleStart} userId={userId} setUserId={setUserId}/>}

            {screen === 'annotate' && (
                <>
                    {/* isSending이 true면 ProgressBar를 AnnotateScreen 위에 표시 */}
                    {isSending && (
                        <div style={{ textAlign: 'center', margin: '0 auto 20px' }}>
                            <p>Sending Data Now...</p>
                            <progress />
                        </div>
                    )}

                    {!isSending && (
                      <AnnotateScreen
                      images={imagesToAnnotate}
                      onFinish={handleFinish}
                      annotationData={annotationData}
                      setAnnotationData={setAnnotationData}
                      />
                    )}

                    
                </>
            )}

            {screen === 'end' && <EndScreen />}
        </div>
    );
}

export default App;
