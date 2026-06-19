import { createTheme, type MantineColorsTuple } from "@mantine/core";

const brand: MantineColorsTuple = [
  "#fce9ea",
  "#f5bcc0",
  "#ec9aa1",
  "#e0727b",
  "#d24e58",
  "#a82832",
  "#781118",
  "#701016",
  "#560c11",
  "#2d0609",
]; // index 6 = #781118 (canonical maroon)

const navy: MantineColorsTuple = [
  "#eaf4fb",
  "#d4e8f6",
  "#bfdff3",
  "#95cbed",
  "#69b4e2",
  "#3f8fc0",
  "#1d6796",
  "#144a6b",
  "#0a2434",
  "#081e2b",
]; // index 8 = #0a2434 (base / default text)

const gold: MantineColorsTuple = [
  "#fbf6e3",
  "#f4e9b8",
  "#ecdb8c",
  "#e3cc60",
  "#d6b732",
  "#bda021",
  "#9c831b",
  "#7a6615",
  "#594a0f",
  "#382e09",
]; // index 4 = #d6b732 (nav accent)

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  colors: { brand, navy, gold },
  autoContrast: true,
  luminanceThreshold: 0.45,
  defaultRadius: "md",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  headings: { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" },
  black: "#0a2434",
});
