import * as React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { LineChart, ChartPoint, BarChart, StackedBarChart } from '../../src';
import {
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import {
  generateRandomChartData,
  generateRandomStackedChartData,
} from './helpers';

export default function App() {
  const [points, setPoints] = React.useState<ChartPoint[]>(
    generateRandomChartData(20)
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        style={[styles.container]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.buttonWrapper}>
          <Button
            title="upd chart"
            onPress={() => setPoints(generateRandomChartData(30))}
          />
        </View>
        <StackedBarChart
          datasets={generateRandomStackedChartData(14)}
          fontFile={require('../assets/fonts/Roboto-Regular.ttf')}
        />
        <View style={{ height: 10, width: '100%' }}></View>
        <BarChart
          data={points}
          fontFile={require('../assets/fonts/Roboto-Regular.ttf')}
        />
        <View style={{ height: 10, width: '100%' }}></View>
        <LineChart
          fontFile={require('../assets/fonts/Roboto-Regular.ttf')}
          data={points}
          // chartColor="red"
          // onTouchStart={() => {}}
          // onTouchEnd={() => {}}
          // fontSize={12}
          // yAxisMax={20}
          // paddingVertical={30}
          // paddingHorizontal={30}
          // startDate={new Date()} // optional prop if not provided will be calculated from data
          // endDate={dayjs().add(10, 'days')} // optional prop if not provided will be calculated from data
          // tooltip={{
          //   width: 60,
          // }}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
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
    marginBottom: 15,
  },
});
