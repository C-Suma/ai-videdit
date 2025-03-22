import React, { useRef, useEffect } from 'react';
import { extractFrames } from './frameExtractor';
import './App.css';

function App() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const abortController = new AbortController();

        extractFrames(
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            canvasRef.current,
            abortController.signal
        );

        return () => {
            abortController.abort();
        };
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <canvas ref={canvasRef} />
            </header>
        </div>
    );
}

export default App;