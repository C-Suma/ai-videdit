import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import ReactAudioPlayer from 'react-audio-player';
import WaveSurfer from 'wavesurfer.js';
import { extractFrames } from './frameExtractor';
import './App.css';

function App() {
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const abortController = new AbortController();

        wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: 'violet',
            progressColor: 'purple',
            height: 100,
        });
        wavesurfer.current.load('/SoundHelix-Song-1.mp3');

        if (canvasRef.current) {
            canvasRef.current.width = 640;
            canvasRef.current.height = 480;
            extractFrames(
                'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                canvasRef.current,
                abortController.signal
            );
        }

        return () => {
            if (wavesurfer.current) {
                try {
                    wavesurfer.current.destroy();
                } catch (error) {
                    console.error('Error destroying wavesurfer:', error);
                }
            }
            if (abortController) {
                abortController.abort();
            }
        };
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <div style={{ marginBottom: '20px' }}>
                    <ReactPlayer
                        url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                        controls={true}
                    />
                </div>
                <div>
                    <ReactAudioPlayer
                        src="http://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                        controls
                    />
                </div>
                <div ref={waveformRef} style={{ marginTop: '20px' }} />
                <canvas ref={canvasRef} style={{ marginTop: '20px' }} />
            </header>
        </div>
    );
}

export default App;