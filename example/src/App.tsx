import * as React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { LineChart, BarChart, StackedBarChart } from '../../src';
import {
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import { generateRandomStackedChartData } from './helpers';

export default function App() {
  const [_, setKey] = React.useState<number>(Math.random());

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        style={[styles.container]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.buttonWrapper}>
          <Button title="upd chart" onPress={() => setKey(Math.random())} />
        </View>
        <StackedBarChart
          datasets={generateRandomStackedChartData(13)}
          fontFile={require('../assets/fonts/Roboto-Regular.ttf')}
        />
        <View style={{ height: 10, width: '100%' }}></View>
        <BarChart
          datasets={generateRandomStackedChartData(10)}
          fontFile={require('../assets/fonts/Roboto-Regular.ttf')}
        />
        <View style={{ height: 10, width: '100%' }}></View>
        <LineChart
          fontFile={require('../assets/fonts/Roboto-Regular.ttf')}
          datasets={generateRandomStackedChartData(13)}
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
