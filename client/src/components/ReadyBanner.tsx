interface ReadyBannerProps {
  visible: boolean;
}

export function ReadyBanner({ visible }: ReadyBannerProps) {
  if (!visible) return null;
  return <div className="ready-banner">All votes are in!</div>;
}
