import { fetchFile } from '@ffmpeg/util';

export const extractFrames = async (videoUrl, outputCanvas, signal) => {
    // eslint-disable-next-line no-undef
    const ffmpeg = FFmpeg.createFFmpeg({ log: true }); // Disable no-undef for this line

    console.log('FFmpeg loading...');
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
        console.log('FFmpeg loaded.');
    }

    if (signal.aborted) return;

    const videoName = 'input.mp4';
    ffmpeg.FS('writeFile', videoName, await fetchFile(videoUrl, { signal }));
    console.log('Video file written.');

    if (signal.aborted) return;

    await ffmpeg.run(
        '-i',
        videoName,
        '-vf',
        'fps=1',
        'frame-%04d.jpg',
        { signal }
    );
    console.log('Frame extracted.');

    if (signal.aborted) return;

    const frameData = ffmpeg.FS('readFile', 'frame-0001.jpg');
    const frameBlob = new Blob([frameData.buffer], { type: 'image/jpeg' });
    const frameUrl = URL.createObjectURL(frameBlob);
    console.log('Frame URL created:', frameUrl);

    const img = new Image();
    img.onload = () => {
        try {
            outputCanvas.width = img.width;
            outputCanvas.height = img.height;
            outputCanvas.getContext('2d').drawImage(img, 0, 0);
            URL.revokeObjectURL(frameUrl);
            console.log('Frame drawn on canvas.');
        } catch (error) {
            console.error('Error drawing frame on canvas:', error);
        }
    };
    img.src = frameUrl;

    ffmpeg.FS('unlink', videoName);
    for (let i = 1; i < 2; i++) {
        ffmpeg.FS('unlink', `frame-000${i}.jpg`);
    }
};