"use client";

import dynamic from "next/dynamic";
import styles from "./spatial-preview.module.css";

const Stage = dynamic(() => import("../spatial-stage"), {
  ssr: false,
  loading: () => (
    <div className={styles.loading} role="status">
      <span>SPATIAL PRESENCE</span>
      <p>Opening the listening room.</p>
    </div>
  ),
});

export default function SpatialPreview({
  speaking = false,
  active = true,
  onClose,
}: {
  speaking?: boolean;
  active?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className={styles.wrapper}>
      <Stage
        speaking={speaking}
        active={active}
        onClose={onClose}
        variant="fan"
      />
    </div>
  );
}
