import * as React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { SkiaTestChart, SkiaLineChart } from 'react-native-skia-charts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import dayjs from 'dayjs';
import { generateRandomChartData } from './helpers';

export default function App() {
  const [result, setResult] = React.useState(true);
  // todo remove dayjs dependency
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <View
          style={{
            width: 100,
            height: 40,
            backgroundColor: 'red',
            borderRadius: 10,
            marginTop: 50,
            marginLeft: 50,
          }}
        >
          <Button
            title="upd chart"
            disabled={false}
            onPress={() => setResult((prevState) => !prevState)}
          />
        </View>
        {result ? (
          <SkiaTestChart />
        ) : (
          <SkiaLineChart
            data={generateRandomChartData(20)}
            yAxisMax={20}
            startDate={new Date()}
            endDate={dayjs().add(20, 'days')}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
