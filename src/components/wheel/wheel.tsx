import { Slice } from './slice/slice';
import styles from './wheel.module.scss';
interface WheelProps {
  sliceData: SliceData[]
}
interface SliceData {
  id: number;
  text: string;
  weight: number;
  // color: string;
}
export const Wheel = ({ sliceData }: WheelProps) => {
  return (
    <div className={styles["c-wheel"]}>
      <div className={styles["slices-container"]}>
        {sliceData.map((slice, idx) => (
          <Slice id={slice.id} text={slice.text} rotation={idx / sliceData.length * 360} arcLength={360 / sliceData.length} />
        ))}
      </div>
    </div >
  )
}