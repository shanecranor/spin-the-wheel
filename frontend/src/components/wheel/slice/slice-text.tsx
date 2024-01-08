import React from "react";
import styles from "./slice.module.scss";
interface SliceProps {
  children: React.ReactNode;
  rotation: number;
}
export const SliceText = ({ children, rotation }: SliceProps) => {
  return (
    <div
      className={styles["c-slice"]}
      style={{
        transform: `translateY(-50%) rotate(${rotation}deg) `,
      }}
    >
      <div className={styles["text"]}>{children}</div>
    </div>
  );
};
