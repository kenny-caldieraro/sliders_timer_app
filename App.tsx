import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import SevenSegmentDisplay from 'rn-seven-segment-display';

// Components
import {
  Button,
  Bargraph,
  Power,
  Rotate,
  Led,
  LedRound,
} from './src/components/index';

// styles
import styles from './src/assets/css/mainStyle';

// function
import decompteTempsEnSecondes from './src/common/functions/time';
import blink from './src/common/functions/blink';

const App = () => {
  const [tempsRestant, setTempsRestant] = React.useState(100000);
  const [bargraphValue, setBargraphValue] = React.useState(0);
  const [render, setRender] = React.useState(false);
  const [increment, setIncrement] = React.useState(true);

  React.useEffect(() => {
    if (decompteTempsEnSecondes(tempsRestant).state) {
      const intervalId = setInterval(() => {
        setTempsRestant(tempsRestant => tempsRestant - 1);
      }, 1000);

      // render speed of app
      setInterval(() => {
        setRender(render => !render);
      }, 100);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);

  const screenDaysHeight = 5;
  const screenDaysWidth = 10;
  const screenHeight = 7;
  const screenWidth = 20;
  const screenOnColor = 'red';
  const screenOffColor = 'rgba(80,0,0,1)';

  return (
    <View style={styles.mainContainer}>
      {/* header days */}
      <View style={styles.screenDaysContainer}>
        <Text style={styles.text}>DAYS</Text>
        <View style={styles.screenDays}>
          {decompteTempsEnSecondes(tempsRestant)
            .days.split('')
            .map((digit, i) => (
              <SevenSegmentDisplay
                key={i}
                value={digit}
                onColor={screenOnColor}
                offColor={screenOffColor}
                height={screenDaysHeight}
                width={screenDaysWidth}
              />
            ))}
        </View>
      </View>
      {/* power zone */}
      <View style={styles.powerContainer}>
        <Power value={5} maxValue={10} numLEDs={10} />
        {/* <Rotate size={100} onPress={() => console.log('rotate')} /> */}
      </View>
      {/* screens zone */}
      <View style={styles.screensContainer}>
        <View style={styles.mainDigits}>
          <Text style={styles.text}>HRS</Text>
          <View style={styles.digits}>
            {decompteTempsEnSecondes(tempsRestant)
              .hours.split('')
              .map((digit, i) => (
                <SevenSegmentDisplay
                  key={i}
                  value={digit}
                  onColor={screenOnColor}
                  offColor={screenOffColor}
                  height={screenHeight}
                  width={screenWidth}
                />
              ))}
          </View>
        </View>
        <View style={styles.collon}>
          <LedRound size={15} isOn={blink()[4]} />
          <LedRound size={15} isOn={blink()[4]} />
        </View>
        <View style={styles.mainDigits}>
          <Text style={styles.text}>MINS</Text>
          <View style={styles.digits}>
            {decompteTempsEnSecondes(tempsRestant)
              .minutes.split('')
              .map((digit, i) => (
                <SevenSegmentDisplay
                  key={i}
                  value={digit}
                  onColor={screenOnColor}
                  offColor={screenOffColor}
                  height={screenHeight}
                  width={screenWidth}
                />
              ))}
          </View>
        </View>
        <View style={styles.collon}>
          <LedRound size={15} isOn={blink()[4]} />
          <LedRound size={15} isOn={blink()[4]} />
        </View>
        <View style={styles.mainDigits}>
          <Text style={styles.text}>SECS</Text>
          <View style={styles.digits}>
            {decompteTempsEnSecondes(tempsRestant)
              .seconds.split('')
              .map((digit, i) => (
                <SevenSegmentDisplay
                  key={i}
                  value={digit}
                  onColor={screenOnColor}
                  offColor={screenOffColor}
                  height={screenHeight}
                  width={screenWidth}
                />
              ))}
          </View>
        </View>
      </View>
      {/* main */}
      <View style={styles.main}>
        <View style={styles.mainLeft}>
          <View style={styles.aside}>
            <Led size={30} isOn={blink()[1]} color="yellow" />
            <Led size={30} isOn={blink()[2]} color="red" />
            <Led size={30} isOn={blink()[3]} color="green" />
          </View>
          <View style={styles.aside}>
            <Text style={styles.text}>TAU</Text>
            <Text style={styles.text}>DELTA</Text>
            <Text style={styles.text}>ZETA</Text>
          </View>
        </View>
        <View style={styles.mainRight}>
          <Bargraph value={bargraphValue} maxValue={10} numLEDs={10} />
          <Bargraph
            value={bargraphValue}
            maxValue={10}
            numLEDs={10}
            rotate={true}
          />
        </View>
      </View>
      {/* buttons */}
      <View style={styles.mainButtons}>
        <View style={styles.colomunButtons}>
          <Button
            buttonName="1"
            big={true}
            onPress={() => {
              console.log('1');
            }}
          />
          <Button
            buttonName="4"
            big={true}
            onPress={() => {
              console.log('4');
            }}
          />
        </View>
        <View style={styles.rowButtons}>
          <Button
            buttonName="PWR"
            big={false}
            onPress={() => {
              console.log('PWR');
            }}
          />
          <Button
            buttonName="FCN"
            big={false}
            onPress={() => {
              console.log('FCN');
            }}
          />
          <Button
            buttonName="NAME MENU"
            big={false}
            onPress={() => {
              console.log('NAME MENU');
            }}
          />
          <Button
            buttonName="END"
            big={false}
            onPress={() => {
              console.log('END');
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default App;
