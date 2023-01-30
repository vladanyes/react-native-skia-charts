# react-native-skia-charts

**High-performance charts for react-native** 🚀  
[![npm version](https://img.shields.io/npm/v/react-native-skia-charts.svg?style=flat)](https://www.npmjs.com/package/react-native-skia-charts)

### This library is under development and is not ready for production use. Yet.

# Example

<div>
  <img src="img/line-chart.gif" width="300" />
  <img src="img/bar-chart.gif" width="300" />
</div>

Clone the repo and run one of the following commands to run the example app:

```js
npm run example:ios
```

or

```js
npm run example:android
```

## Installation

<pre>
npm install <a href="https://github.com/d3/d3-scale">d3-scale</a>
npm install <a href="https://github.com/d3/d3-shape">d3-shape</a>
npm install <a href="https://github.com/iamkun/dayjs">dayjs</a>
npm install <a href="https://github.com/software-mansion/react-native-reanimated">react-native-reanimated</a>
npm install <a href="https://github.com/software-mansion/react-native-gesture-handler">react-native-gesture-handler</a>
npm install <a href="https://github.com/Shopify/react-native-skia">@shopify/react-native-skia</a>
npm install react-native-skia-charts
</pre>

## Usage

```jsx
import { LineChart, ChartPoint } from 'react-native-skia-charts';
// ...
<LineChart
  data={[{ date: '2021-01-01', value: 1 }, { date: '2021-01-02', value: 2 }, ... ]}
  fontFile={require("../assets/fonts/Roboto-Regular.ttf")}
/>
```

## Configuration props

### `data` (required)

The data to be displayed in the chart. The data should be an array of objects with a `date` and `value` properties.

### `fontFile` (required)

A font file to be used in the chart. Example: `require("../assets/fonts/Roboto-Regular.ttf")`

### `startDate`

If not provided, `startDate` will be calculated from `data` prop.

### `endDate`

If not provided, `endDate` will be calculated from `data` prop.

### `onTouchStart`

### `onTouchEnd`

### `fontSize`

### `chartColor`

### `yAxisMax`

### `tension`

### `labelsColor`

### `paddingVertical`

### `paddingHorizontal`

### `tooltip`

## Chart types

- Line chart (draft state)
- Tooltip (draft state)
- Bar chart (draft state)
- Stacked Bar chart (todo)
- Multiple lines chart (todo)
- Donut chart (todo)

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

### Contact me

ryabinin.dev@gmail.com

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
