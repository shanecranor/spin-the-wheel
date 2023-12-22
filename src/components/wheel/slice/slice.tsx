import styles from './slice.module.scss';
interface SliceProps {
  id: number;
  text: string;
  arcLength: number;
  rotation: number;
}
export const Slice = ({ id, text, arcLength, rotation }: SliceProps) => {
  return (
    <div className={styles["c-slice"]} style={{
      transform: `rotate(${rotation}deg)`,
    }}>
      {text} {arcLength} {id}
    </div>
  )
}