import { SliceData } from "./types"

export function buildWheelOffsets(sliceData: SliceData[]) {
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

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", x, y,
    "Z"
  ].join(" ");
}

export function buildWheelSVG(sliceData: SliceData[]) {
  const wheelOffsets = buildWheelOffsets(sliceData);
  const centerX = 100; // Adjust as needed
  const centerY = 100; // Adjust as needed
  const radius = 100; // Adjust as needed

  const paths = wheelOffsets.map(({ color, start, end }) => {
    const pathD = describeArc(centerX, centerY, radius, start * 360, end * 360);
    return `<path d="${pathD}" fill="${color}" />`;
  });

  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g transform="rotate(90, 100, 100)">${paths.join('')}</g></svg>`;
}

export function buildWheelGradient(sliceData: SliceData[]) {
  const wheelOffsets = buildWheelOffsets(sliceData)
  const gradient = wheelOffsets.map(({ color, start, end }) =>
    `${color} ${(start * 100).toFixed(2)}% ${(end * 100).toFixed(2)}% `
  )
  return `conic-gradient(from 90deg,${gradient.join(', ')})`
}