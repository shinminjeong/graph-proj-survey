import './App.css';
import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import AnnotateScreen from './components/AnnotateScreen';
import EndScreen from './components/EndScreen';

function App() {
  const [screen, setScreen] = useState('start'); // 'start' -> 'annotate' -> 'end'
  const [annotationData, setAnnotationData] = useState([]);
  const [imagesToAnnotate, setImagesToAnnotate] = useState([]);
  
  const base = import.meta.env.BASE_URL;

  // 이미지 가져오기 (import.meta.glob())
  const images = import.meta.glob('/src/assets/images/*.{png,jpg,jpeg,svg}', { eager: true });

  const wholeImages = Object.keys(images).map((path) => {
    const fileName = path.split('/').pop();
    return `${import.meta.env.BASE_URL}assets/images/${fileName}`;
  });

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
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyN50ItId7fBzUh9o3dmdePHUikxQOlT_qHZJiAKz14uUfpQnHCag0PGtInV65v8ODq/exec';

  // 사용자를 식별하고 싶다면 userId를 받을 수도 있음
  const userId = '익명 사용자'; 

  const handleStart = () => {
    setScreen('annotate');
  };

  
  const handleFinish = async () => {
    const formBody = new URLSearchParams();
    formBody.append('userId', userId);
    console.log(JSON.stringify(annotationData));
    formBody.append('annotationData', JSON.stringify(annotationData));

    // 1) 사용자 바운딩 박스 데이터(annotationData)를 구글 스크립트로 전송
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

      // 2) 성공하면 'end' 화면으로 이동
      setScreen('end');
    } catch (err) {
      console.error('Error sending data to Google Sheets:', err);
      // 실패했을 때 처리 (예: alert)
      alert('데이터 전송에 실패했습니다.');
    }
  };

  return (
    <div className='app-container'>
      {screen === 'start' && <StartScreen onStart={handleStart} />}
      {screen === 'annotate' && (
        <AnnotateScreen
          images={imagesToAnnotate}
          onFinish={handleFinish}
          annotationData={annotationData}
          setAnnotationData={setAnnotationData}
        />
      )}
      {screen === 'end' && <EndScreen />}
    </div>
  );
}

export default App;
