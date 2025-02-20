import { Slider, Typography } from "@mui/material";
import Image from "next/image";

const marks = [
  // { value: 0, label: "Least" },
  // { value: 20, label: "Low" },
  // { value: 25, label: "Low" },
  // { value: 30, label: "Low" },
  // { value: 40, label: "Medium" },
  // { value: 45, label: "Medium" },
  // { value: 50, label: "Medium" },
  // { value: 75, label: "High" },
  // { value: 100, label: "Highest" },
  { value: 0, text: "Lowest" },
  { value: 20, text: "Low" },
  { value: 25, text: "Low" },
  { value: 30, text: "Low" },
  { value: 45, text: "Medium" },
  { value: 50, text: "Medium" },
  { value: 55, text: "Medium" },
  { value: 75, text: "High" },
  { value: 100, text: "Highest" },
  // { value: 0 },
  // { value: 25, label: "Lower complexity" },
  // { value: 35 },
  // { value: 50 },
  // { value: 75, label: "Higher complexity" },
  // { value: 100 },
  // { value: 0 },
  // { value: 25 },
  // { value: 35 },
  // { value: 50 },
  // { value: 75 },
  // { value: 100 },
];

export const ExamplesSection = () => {
  return (
    <div className="flex flex-col text-center">
      <Typography variant="h4">What kinds of problems?</Typography>
      <Typography variant="body1">
        {/* Ameliorate can help with basically any problem that's hard to figure out how to deal with
        it, due to there being so many things to think about. */}
        {/* Ameliorate can help with any problem involving a situation you want to improve, but that has
        so many details that it's hard to think through. Move the slider below to see a few
        examples! */}
        {/* Ameliorate can help with any problem involving a situation you want to improve, but that has
        so many details that it's hard to think through. */}
      </Typography>

      {/* <Typography variant="h4">Problems by complexity</Typography> */}
      {/* <Typography className="pt-0">Problems by complexity</Typography> */}
      <Typography className="pt-2">Examples by complexity</Typography>
      {/* <Typography className="pt-2">Complexity</Typography> */}
      {/* <div className="mx-12"> */}
      <Slider
        aria-label="Examples slider"
        defaultValue={45}
        marks={marks}
        track={false}
        step={null}
        valueLabelFormat={(value) => marks.find((mark) => mark.value === value)?.text}
        valueLabelDisplay="auto"
        // className="w-4/5"
        className="[&_>_.MuiSlider-mark]:h-2"
      />
      {/* </div> */}

      <Typography variant="h5" className="pt-2 text-primary-main underline">
        {/* <Typography variant="h5" className="pt-2"> */}
        Cars going too fast in neighborhood
      </Typography>
      <Typography>
        Problems with a low-medium complexity are the sweet spot for Ameliorate. Easily discuss a
        few causes and effects, affecting a few people, where a few options can be considered.
      </Typography>
      <Image
        key="https://github.com/user-attachments/assets/dc8dfc20-1894-4392-8d58-31bb9396f566"
        src="https://github.com/user-attachments/assets/dc8dfc20-1894-4392-8d58-31bb9396f566"
        alt="cars-going-too-fast diagram"
        width={1586}
        height={1376}
        unoptimized
        className="rounded-xl border shadow"
      />
    </div>
  );
};
