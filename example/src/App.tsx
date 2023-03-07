import * as React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { LineChart, BarChart } from 'react-native-skia-charts';
import {
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import { generateRandomChartData } from './helpers';

export default function App() {
  const [data, setData] = React.useState(generateRandomChartData(13));
  const randomNumber = Math.floor(Math.random() * (15 - 10 + 1) + 10);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        style={[styles.container]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.buttonWrapper}>
          <Button
            title="upd chart"
            onPress={() => setData(generateRandomChartData(randomNumber))}
          />
        </View>
        <LineChart
          fontFile={require('../assets/fonts/Roboto-Regular.ttf')}
          datasets={[{ data, color: 'orange', label: 'line chart' }]}
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
        <View style={{ height: 30, width: '100%' }}></View>
        <BarChart
          datasets={[{ data, color: 'orange', label: 'bar chart' }]}
          fontFile={require('../assets/fonts/Roboto-Regular.ttf')}
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
    marginBottom: 55,
  },
});
