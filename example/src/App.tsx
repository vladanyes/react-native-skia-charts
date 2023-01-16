import * as React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { SkiaLineChart, ChartPoint } from 'react-native-skia-charts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import dayjs from 'dayjs';
import { generateRandomChartData } from './helpers';

export default function App() {
  const [points, setPoints] = React.useState<ChartPoint[]>(
    generateRandomChartData(20)
  );
  // todo remove dayjs dependency
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.container, { maxHeight: 350 }]}>
        <View style={styles.buttonWrapper}>
          <Button
            title="upd chart"
            onPress={() => setPoints(generateRandomChartData(30))}
          />
        </View>
        <LineChart
          onTouchStart={() => {}}
          onTouchEnd={() => {}}
          fontSize={12}
          data={points}
          yAxisMax={20}
          paddingVertical={30}
          paddingHorizontal={30}
          // startDate={new Date()} // optional prop if not provided will be calculated from data
          // endDate={dayjs().add(10, 'days')} // optional prop if not provided will be calculated from data
          tooltip={{
            width: 60,
          }}
        />
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
  buttonWrapper: {
    width: 100,
    height: 40,
    backgroundColor: 'lightblue',
    borderRadius: 10,
    marginTop: 50,
    marginLeft: 50,
  },
});
