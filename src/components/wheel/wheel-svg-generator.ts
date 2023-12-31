import { SliceData } from "./types";
export const WHEEL_COLORS = [
  "#746EE0",
  "#7FC9F3",
  "#81E27F",
  "#EB55AA",
  "#F2982C",
  "#FADD81",
];
export function buildWheelOffsets(sliceData: SliceData[]) {
  const totalSliceWeight = sliceData.reduce(
    (acc, slice) => acc + slice.weight,
    0
  );
  const sliceWeights = sliceData.map(
    (slice) => slice.weight / totalSliceWeight
  );
  const gradient = sliceWeights.map((weight, idx) => {
    const color = WHEEL_COLORS[idx % 6];
    const start = sliceWeights
      .slice(0, idx)
      .reduce((acc, weight) => acc + weight, 0);
    const end = start + weight;
    const mid = (start + end) / 2;
    return { color, start, mid, end };
  });
  return gradient;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    x,
    y,
    "Z",
  ].join(" ");
}

export function buildWheelSVG(sliceData: SliceData[]) {
  const wheelOffsets = buildWheelOffsets(sliceData);
  const centerX = 100;
  const centerY = 100;
  const radius = 96; //100 = full circle, set to 96 to allow for the outer circle stroke
  // Adjust overlap of the slices can create cool patterns if combined with opacity
  // Originally designed to fix aliasing issues (replaced with stroke)
  const overlap = 0;
  //opacity of each slice, good for debugging
  const opacity = 1.0;

  // fixes aliasing issues
  // any larger than 0.2 and things get asymmetrical and weird
  const sliceStrokeWidth = 0.2;
  // Enable simple paths to overlay the non-stroked paths and remove the aliasing issues
  const overlaySimplePaths = true;
  const enableSeperatorLines = false;

  const lineThickness = 0.5; // Adjust thickness of the line

  const outerCircleStrokeWidth = 4; // Thickness of the outer circle stroke
  const outerCircleRadius = radius + outerCircleStrokeWidth / 2; // Radius of the outer circle

  const paths = wheelOffsets.map(({ color, start, end }) => {
    const pathD = describeArc(
      centerX,
      centerY,
      radius,
      start * 360 - overlap,
      end * 360 + overlap
    );
    return `<path d="${pathD}" opacity="${opacity}" fill="${color}" stroke="${color}" stroke-width="${sliceStrokeWidth}" />`;
  });
  const simplePaths = wheelOffsets.map(({ color, start, end }) => {
    const pathD = describeArc(centerX, centerY, radius, start * 360, end * 360);
    return `<path d="${pathD}" opacity="${opacity}" fill="${color}" />`;
  });
  const lines = wheelOffsets.map(({ end }) => {
    const lineD = describeArc(centerX, centerY, radius, end * 360, end * 360);
    return `<path d="${lineD}" stroke="white" stroke-width="${lineThickness}" />`;
  });
  const outerCircle = `<circle cx="${centerX}" cy="${centerY}" r="${outerCircleRadius}" stroke="white" stroke-width="${outerCircleStrokeWidth}" fill="white" />`;
  if (paths.length === 0) {
    return "";
  }
  //if paths is 1 then just render a circle
  if (paths.length === 1) {
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    ${outerCircle}
    <circle cx="100" cy="100" r="100" fill="${paths[0].split('"')[3]}"/>
    </svg>`;
  }

  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            ${outerCircle}
            <g transform="rotate(90, 100, 100)">
              ${paths.join("")}
              ${overlaySimplePaths ? simplePaths.join("") : ""}
              ${enableSeperatorLines ? lines.join("") : ""}
            </g>
         
          </svg>`;
}

export function buildWheelGradient(sliceData: SliceData[]) {
  const wheelOffsets = buildWheelOffsets(sliceData);
  const gradient = wheelOffsets.map(
    ({ color, start, end }) =>
      `${color} ${(start * 100).toFixed(2)}% ${(end * 100).toFixed(2)}% `
  );
  return `conic-gradient(from 90deg,${gradient.join(", ")})`;
}
