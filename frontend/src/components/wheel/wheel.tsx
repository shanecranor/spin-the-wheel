// import { faker } from '@faker-js/faker'
import { EntryProps } from "@shared/types";
import { SliceText } from "./slice/slice-text";
import { buildWheelOffsets, buildWheelSVG } from "./wheel-svg-generator";
import styles from "./wheel.module.scss";
import { observer } from "@legendapp/state/react";
import { Text, Tooltip } from "@mantine/core";
interface WheelProps {
  wheelEntries: EntryProps[];
  rotation: number;
}
export const Wheel = observer(({ wheelEntries, rotation }: WheelProps) => {
  const wheelOffsets = buildWheelOffsets(wheelEntries);
  const svgMarkup = buildWheelSVG(wheelEntries);
  const base64SVG = btoa(svgMarkup);
  const backgroundImage = `url('data:image/svg+xml;base64,${base64SVG}')`;
  const largestFontSize = 27;
  const smallestFontSize = 16;
  if (wheelEntries.length === 0)
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
          {wheelEntries.map((slice, idx) => {
            const rotation = wheelOffsets[idx].mid * 360;
            const j = largestFontSize - smallestFontSize;
            const fontSize =
              Math.min(
                45,
                j * (j / (slice.text.length + j)) + smallestFontSize
              ) + "px";
            return (
              <SliceText key={slice.id} rotation={rotation}>
                <Tooltip label={slice.text} color="dark">
                  <Text style={{ fontSize }} lineClamp={1}>
                    {slice.text}
                  </Text>
                </Tooltip>
              </SliceText>
            );
          })}
        </div>
      </div>
    </>
  );
});
