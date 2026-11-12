export function asHexColor(color: string): string {
  return color.startsWith("#") ? color : `#${color}`;
}

export function diffInDays(date1: Date | string, date2: Date | string): number {
  const diffTime = Math.abs(
    new Date(date2).getTime() - new Date(date1).getTime(),
  );
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function scaleValue(
  value: number,
  minVal: number,
  maxVal: number,
  A: number,
  B: number,
): number {
  // scale the value
  const scaledValue = ((value - minVal) / (maxVal - minVal)) * (B - A) + A;

  return scaledValue;
}

export function chunckArray(arr: unknown[], size: number) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size),
  );
}

export function getMinMaxFromNumberArr(arr: number[], type: "min" | "max") {
  const splitArr = chunckArray(arr, 50000);
  const reducedArr: number[] = [];
  splitArr.forEach((valuesChunk) => {
    const getMinMax =
      type === "max"
        ? Math.max(...valuesChunk.map(Number))
        : Math.min(...valuesChunk.map(Number));
    reducedArr.push(getMinMax);
  });

  return type === "max"
    ? Math.max(...reducedArr.map(Number))
    : Math.min(...reducedArr.map(Number));
}
