import styles from './slice.module.scss';
interface SliceProps {
  text: string;
  rotation: number;
}
export const Slice = ({ text, rotation }: SliceProps) => {
  return (
    <div className={styles["c-slice"]} style={{
      transform: `translateY(-50%) rotate(${rotation}deg) `,
    }}>
      <div className={styles["text"]}>{text}</div>
    </div>
  )
}