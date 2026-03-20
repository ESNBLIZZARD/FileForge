import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

/**
 * Loads and initializes the FFmpeg instance if it hasn't been already.
 */
export async function loadFFmpeg() {
    if (ffmpeg) return ffmpeg;

    ffmpeg = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    return ffmpeg;
}

/**
 * Converts an MP3 file to WAV format using FFmpeg.wasm.
 * 
 * @param file The input MP3 file as a File object.
 * @param onProgress Optional callback for conversion progress (0-100).
 * @returns A Promise that resolves to a Blob containing the WAV data.
 */
export async function convertMp3ToWav(
    file: File,
    onProgress?: (progress: number) => void
): Promise<Blob> {
    const ffmpeg = await loadFFmpeg();

    if (onProgress) {
        ffmpeg.on("progress", ({ progress }) => {
            onProgress(Math.round(progress * 100));
        });
    }

    const inputName = "input.mp3";
    const outputName = "output.wav";

    // Write the file to FFmpeg's virtual file system
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Execute the conversion command
    // -i: input file
    // -acodec pcm_s16le: use 16-bit PCM encoding (standard for WAV)
    // -ar 44100: set sample rate to 44.1kHz (CD quality)
    // -ac 2: set to 2 audio channels (stereo)
    await ffmpeg.exec(["-i", inputName, "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2", outputName]);

    // Read the result from the virtual file system
    const data = await ffmpeg.readFile(outputName);
    
    // Clean up virtual files
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    // Convert Uint8Array to a Blob. 
    // We use a copy of the buffer to ensure compatibility if it's a SharedArrayBuffer
    const resultData = new Uint8Array(data as Uint8Array);
    return new Blob([resultData.buffer], { type: "audio/wav" });
}
