import ytdl from "ytdl-core";
import { YoutubeTranscript } from "youtube-transcript";

export const parseYouTubeId = (value: string) => {
  try {
    const url = new URL(value);
    const host = url.hostname.replace("www.", "");
    if (host.includes("youtu.be")) {
      return url.pathname.replace("/", "");
    }
    if (url.pathname.startsWith("/shorts/")) {
      const parts = url.pathname.split("/");
      return parts[2] || null;
    }
    const id = url.searchParams.get("v");
    if (id) return id;
  } catch (error) {
    // not a valid URL
  }
  const directId = value.match(/^[a-zA-Z0-9_-]{11}$/)?.[0];
  return directId ?? null;
};

export const getTranscriptWithFallback = async (youtubeId: string) => {
  const entries = await YoutubeTranscript.fetchTranscript(youtubeId);
  return entries.map((entry) => entry.text).join(" ");
};

export const fetchVideoMetadata = async (youtubeId: string) => {
  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${youtubeId}`);
    const thumb = info.videoDetails.thumbnails?.[0]?.url;
    return {
      title: info.videoDetails.title,
      thumbnailUrl: thumb ?? null,
    };
  } catch (error) {
    return { title: null as string | null, thumbnailUrl: null as string | null };
  }
};

