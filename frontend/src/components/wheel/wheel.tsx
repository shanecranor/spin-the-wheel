// import { faker } from '@faker-js/faker'
import { EntryProps } from "@shared/types";
import { SliceText } from "./slice/slice-text";
import { SPIN_DURATION } from "./wheel-spin";
import { buildWheelOffsets, buildWheelSVG } from "./wheel-svg-generator";
import styles from "./wheel.module.scss";
import { observer } from "@legendapp/state/react";
import { Text, Tooltip } from "@mantine/core";
interface WheelProps {
  wheelEntries: EntryProps[];
  rotation: number;
  emptyState?: React.ReactNode;
  compact?: boolean;
  spinDuration?: number;
}
export const Wheel = observer(
  ({
    wheelEntries,
    rotation,
    emptyState,
    compact = false,
    spinDuration = SPIN_DURATION,
  }: WheelProps) => {
    const wheelOffsets = buildWheelOffsets(wheelEntries);
    const svgMarkup = buildWheelSVG(wheelEntries);
    const base64SVG = btoa(svgMarkup);
    const backgroundImage = `url('data:image/svg+xml;base64,${base64SVG}')`;
    if (wheelEntries.length === 0)
      return (
        <div className={styles["c-wheel"]}>
          {emptyState || <Text size="xl">Add some items to the wheel!</Text>}
        </div>
      );
    return (
      <>
        <div
          className={`${styles["c-wheel"]} ${compact ? styles.compact : ""}`}
          style={{
            background: backgroundImage,
            transform: `rotate(${rotation * -1}deg)`,
            transition:
              spinDuration === 0
                ? "none"
                : `transform ${spinDuration}ms cubic-bezier(.08,.49,0,1)`,
          }}
        >
          <div className={styles["slices-container"]}>
            {wheelEntries.map((slice, idx) => {
              const rotation = wheelOffsets[idx].mid * 360;
              const fontSize = getSliceFontSize(
                slice.text,
                wheelEntries.length,
                compact,
              );
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
  },
);

function getSliceFontSize(
  text: string,
  entryCount: number,
  compact: boolean,
): string {
  if (compact) {
    if (entryCount > 16) return "11px";
    if (text.length > 12) return "12px";
    return "14px";
  }

  const largestFontSize = 27;
  const smallestFontSize = 16;
  const fontSizeRange = largestFontSize - smallestFontSize;
  const fontSize = Math.min(
    45,
    fontSizeRange * (fontSizeRange / (text.length + fontSizeRange)) +
      smallestFontSize,
  );
  const viewportScale = Math.min((window.innerWidth / 1920) * 3, 1);
  return `${fontSize * viewportScale}px`;
}
