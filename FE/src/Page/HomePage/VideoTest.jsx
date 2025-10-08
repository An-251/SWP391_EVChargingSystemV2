import videoSrc from "../../assets/video.mp4";

export default function VideoTest() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video
        src={videoSrc}
        muted
        loop
        autoPlay
        controls
        width="100%"
        height="100%"
        className="absolute top-0 left-0"
      />
    </div>
  );
}
