# react-native-skia-charts

**High-performance charts for react-native** 🚀  
[![npm version](https://img.shields.io/npm/v/react-native-skia-charts.svg?style=flat)](https://www.npmjs.com/package/react-native-skia-charts)

### This library is under development and is not ready for production use. Yet.

# Example

<img src="src/assets/line-chart-example.png" width="300" />

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
/>
```

## Configuration props

### `startDate`

Optional prop. If not provided, `startDate` will be calculated from `data` prop.

### `endDate`

Optional prop. If not provided, `endDate` will be calculated from `data` prop.

## Chart types

- Line chart (draft state)
- Tooltip (draft state)
- Stacked Bar chart (todo)
- Multiple lines chart (todo)
- Bar chart (todo)
- Donut chart (todo)

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

### Contact me

ryabinin.dev@gmail.com

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
