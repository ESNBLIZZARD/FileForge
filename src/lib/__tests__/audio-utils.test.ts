import { describe, it, expect, vi, beforeEach } from "vitest";
import { convertMp3ToWav } from "../audio-utils";

// Mock @ffmpeg/ffmpeg
vi.mock("@ffmpeg/ffmpeg", () => {
    class FFmpeg {
        load = vi.fn().mockResolvedValue(undefined);
        on = vi.fn();
        writeFile = vi.fn().mockResolvedValue(undefined);
        exec = vi.fn().mockResolvedValue(0);
        readFile = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
        deleteFile = vi.fn().mockResolvedValue(undefined);
    }
    return { FFmpeg };
});

// Mock @ffmpeg/util
vi.mock("@ffmpeg/util", () => ({
    fetchFile: vi.fn().mockResolvedValue(new Uint8Array([])),
    toBlobURL: vi.fn().mockResolvedValue("mock-url"),
}));

describe("audio-utils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should convert mp3 to wav successfully", async () => {
        const mockFile = new File(["test"], "test.mp3", { type: "audio/mpeg" });
        const onProgress = vi.fn();

        const result = await convertMp3ToWav(mockFile, onProgress);

        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe("audio/wav");
    });
});
