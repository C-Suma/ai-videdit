import { fetchFile } from '@ffmpeg/util';
const { createFFmpeg } = require('@ffmpeg/ffmpeg/dist/umd/ffmpeg.js'); // Use UMD build

export const extractFrames = async (videoUrl, outputCanvas, signal) => {
    const ffmpeg = createFFmpeg({ log: true });

    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
    }

    if (signal.aborted) return;

    const videoName = 'input.mp4';
    ffmpeg.FS('writeFile', videoName, await fetchFile(videoUrl, { signal }));

    if (signal.aborted) return;

    await ffmpeg.run(
        '-i',
        videoName,
        '-vf',
        'fps=1',
        'frame-%04d.jpg',
        { signal }
    );

    if (signal.aborted) return;

    const frameData = ffmpeg.FS('readFile', 'frame-0001.jpg');
    const frameBlob = new Blob([frameData.buffer], { type: 'image/jpeg' });
    const frameUrl = URL.createObjectURL(frameBlob);

    const img = new Image();
    img.onload = () => {
        outputCanvas.width = img.width;
        outputCanvas.height = img.height;
        outputCanvas.getContext('2d').drawImage(img, 0, 0);
        URL.revokeObjectURL(frameUrl);
    };
    img.src = frameUrl;

    ffmpeg.FS('unlink', videoName);
    for (let i = 1; i < 2; i++) {
        ffmpeg.FS('unlink', `frame-000${i}.jpg`);
    }
};