// import { faker } from '@faker-js/faker'
import { Slice } from "./slice/slice";
import { SliceData } from "./types";
import { buildWheelOffsets, buildWheelSVG } from "./wheel-svg-generator";
import styles from "./wheel.module.scss";
import { observer } from "@legendapp/state/react";
import { Text, Tooltip } from "@mantine/core";
interface WheelProps {
  sliceData: SliceData[];
  rotation: number;
}
export const Wheel = observer(({ sliceData, rotation }: WheelProps) => {
  const wheelOffsets = buildWheelOffsets(sliceData);
  const svgMarkup = buildWheelSVG(sliceData);
  const base64SVG = btoa(svgMarkup);
  const backgroundImage = `url('data:image/svg+xml;base64,${base64SVG}')`;
  const largestFontSize = 1100 / (sliceData.length + 20) + 5;
  const smallestFontSize = 16;
  if (sliceData.length === 0)
    return (
      <div className={styles["c-wheel"]}>
        <Text size="xl">Add some items to the wheel!</Text>
      </div>
    );
  return (
    <>
      <div
        className={styles["c-wheel"]}
        style={{
          background: backgroundImage,
          transform: `rotate(${rotation * -1}deg)`,
          transition: "transform 10s cubic-bezier(.08,.49,0,1)",
        }}
      >
        <div className={styles["slices-container"]}>
          {sliceData.map((slice, idx) => {
            const rotation = wheelOffsets[idx].mid * 360;
            const j = largestFontSize - smallestFontSize;
            const fontSize =
              Math.min(
                45,
                j * (j / (slice.text.length + j)) + smallestFontSize
              ) + "px";
            return (
              <Slice key={slice.id} rotation={rotation}>
                <Tooltip label={slice.text} color="dark">
                  <Text style={{ fontSize }} lineClamp={1}>
                    {slice.text}
                  </Text>
                </Tooltip>
              </Slice>
            );
          })}
        </div>
      </div>
    </>
  );
});
