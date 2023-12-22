import { faker } from '@faker-js/faker'
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
  const wheelOffsets = buildWheelOffsets(sliceData)
  console.log(buildWheelGradient(sliceData),)
  return (
    <>
      <div className={styles["c-wheel"]}
        style={{
          background: buildWheelGradient(sliceData),
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


function buildWheelOffsets(sliceData: SliceData[]) {
  const totalSliceWeight = sliceData.reduce((acc, slice) => acc + slice.weight, 0)
  const sliceWeights = sliceData.map(slice => slice.weight / totalSliceWeight)
  const gradient = sliceWeights.map((weight, idx) => {
    const color = ["red", "green", "blue", "orange", "purple", "black"][idx % 6]
    const start = (sliceWeights.slice(0, idx).reduce((acc, weight) => acc + weight, 0))
    const end = (start + weight)
    const mid = (start + end) / 2
    return { color, start, mid, end }
  })
  return gradient
}

function buildWheelGradient(sliceData: SliceData[]) {
  const wheelOffsets = buildWheelOffsets(sliceData)
  const gradient = wheelOffsets.map(({ color, start, end }) =>
    `${color} ${(start * 100).toFixed(2)}% ${(end * 100).toFixed(2)}% `
  )
  return `conic-gradient(from 90deg,${gradient.join(', ')})`
}