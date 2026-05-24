type Props = {
  url: string;
};

export function PlayerAvatar({ url }: Props) {
  return (
    <div className="player-avatar">
      <img src={url} />
    </div>
  );
}
