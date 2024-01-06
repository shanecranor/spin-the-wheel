import { MantineColorsTuple, createTheme } from "@mantine/core";

const red: MantineColorsTuple = [
  "#ffeaea",
  "#fed4d4",
  "#f5a5a6",
  "#ee7575",
  "#e84c4c",
  "#e53232",
  "#e52323",
  "#cc1617",
  "#b60f14",
  "#a0000e",
];
const dark: MantineColorsTuple = [
  "#dedede",
  "#b2b2b2",
  "#909090",
  "#6f6f6f",
  "#5d5d5d",
  "#494949",
  "#373737",
  "#282828",
  "#191919",
  "#121212",
];
const green: MantineColorsTuple = [
  "#ecfbe8",
  "#def3d9",
  "#bfe3b5",
  "#9cd48e",
  "#80c76e",
  "#6dbf58",
  "#63bb4c",
  "#51a43d",
  "#469234",
  "#387e27",
];
const pink: MantineColorsTuple = [
  "#ffe8f7",
  "#ffd1e7",
  "#faa1cc",
  "#f66eae",
  "#F357A1",
  "#AD3E72",
  "#f0167f",
  "#d6036c",
  "#bf0060",
  "#a90053",
];
export const theme = createTheme({
  primaryColor: "pink",
  primaryShade: 4,
  white: "#fff",
  colors: {
    red,
    green,
    dark,
    pink,
  },
});
