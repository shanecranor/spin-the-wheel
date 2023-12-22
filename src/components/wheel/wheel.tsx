// import { faker } from '@faker-js/faker'
import { Slice } from './slice/slice';
import { SliceData } from './types';
import { buildWheelOffsets, buildWheelSVG } from './wheel-svg-generator';
import styles from './wheel.module.scss';
interface WheelProps {
  sliceData: SliceData[]
}
export const Wheel = ({ sliceData }: WheelProps) => {
  const wheelOffsets = buildWheelOffsets(sliceData)
  const svgMarkup = buildWheelSVG(sliceData);
  const base64SVG = btoa(svgMarkup);
  const backgroundImage = `url('data:image/svg+xml;base64,${base64SVG}')`;

  return (
    <>
      <div className={styles["c-wheel"]}
        style={{
          background: backgroundImage,
        }}>
        <div className={styles["slices-container"]}>
          {sliceData.map((slice, idx) => {
            const rotation = wheelOffsets[idx].mid * 360
            console.log(idx, rotation)
            return (
              <Slice key={slice.id} text={slice.text} rotation={rotation} />
            )
          })}
        </div>
      </div ></>
  )
}




