import styles from "./ReadyBanner.module.css";

interface ReadyBannerProps {
  visible: boolean;
}

export function ReadyBanner({ visible }: ReadyBannerProps) {
  if (!visible) return null;
  return <div className={styles.banner}>All votes are in!</div>;
}
