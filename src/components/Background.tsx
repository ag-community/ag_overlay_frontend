type Props = {
  url: string;
  color: string;
  opacity: number;
  blur: number;
};

export function Background({ url, color, opacity, blur }: Props) {
  if (!url) {
    return (
      <div className="background-media" style={{ backgroundColor: color }} />
    );
  }

  const isVideo = /\.(webm|mp4)(\?|$)/i.test(url);

  return (
    <div className="background-media">
      <div style={{ opacity: opacity / 100, filter: `blur(${blur}px)` }}>
        {isVideo ? (
          <video src={url} autoPlay loop muted playsInline />
        ) : (
          <img src={url} />
        )}
      </div>
    </div>
  );
}
