import React from 'react';
import {View, Text} from 'react-native';
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
import {
  genererValeursBooleennes,
  countingDownConverter,
} from './src/common/functions/index';

// data

const App = () => {
  const [isActive, setIsActive] = React.useState(false);
  const [, setCounter] = React.useState(0);
  const [loopIntervalId, setLoopIntervalId] = React.useState(0);
  const [tempsRestant, setTempsRestant] = React.useState(0);
  const [potentiometerValue, setPotentiometerValue] = React.useState(5);
  const [setupMode, setSetupMode] = React.useState(false);
  const [setupValue, setSetupValue] = React.useState(0);
  const [countdownIntervalId, setCountdownIntervalId] = React.useState(0);
  const [countingDown, setCountingDown] = React.useState(false);
  const [mode, setMode] = React.useState('init');

  React.useEffect(() => {
    startLoop();
    return () => {
      stopLoop();
    };
  }, []);

  // master void loop
  const startLoop = () => {
    setCounter(0);
    const intervalId = setInterval(() => {
      setCounter(counter => counter + 1);
    }, 20);
    setLoopIntervalId(intervalId);
  };

  const stopLoop = () => {
    clearInterval(loopIntervalId);
  };

  // power toggle
  const powerToggle = () => {
    setIsActive(!isActive);
  };

  React.useEffect(() => {
    if (isActive) {
      countDown();
    }
  }, [isActive]);

  // countdown
  const countDown = () => {
    if (isActive) {
      if (tempsRestant > 0) {
        if (!setupMode) {
          setCountingDown(true);
          const intervalId = setInterval(() => {
            setTempsRestant(tempsRestant => tempsRestant - 1);
          }, 1000);
          setCountdownIntervalId(intervalId);
        } else {
          return () => {
            setTempsRestant(0);
            clearInterval(countdownIntervalId);
            setCountingDown(false);
          };
        }
        // init mode
      } else if (mode === 'init') {
        let count = 0;
        const intervalId = setInterval(() => {
          setTempsRestant(tempsRestant => tempsRestant + 1);
          count++;
          if (count > 5) {
            setMode('countdown');
            setTempsRestant(0);
            clearInterval(intervalId);
          }
        }, 300);
        setCountdownIntervalId(intervalId);
      }
    }
  };

  // set timer
  const setTime = (mode: string) => {
    if (setupMode) {
      if (mode === 'add') {
        switch (setupValue) {
          case 0:
            setTempsRestant(tempsRestant => tempsRestant + 1);
            break;
          case 1:
            setTempsRestant(tempsRestant => tempsRestant + 60);
            break;
          case 2:
            setTempsRestant(tempsRestant => tempsRestant + 3600);
            break;
          case 3:
            setTempsRestant(tempsRestant => tempsRestant + 86400);
            break;
        }
      } else if (mode === 'remove') {
        switch (setupValue) {
          case 0:
            if (tempsRestant > 0) {
              setTempsRestant(tempsRestant => tempsRestant - 1);
              break;
            }
          case 1:
            if (tempsRestant > 60) {
              setTempsRestant(tempsRestant => tempsRestant - 60);
              break;
            }
          case 2:
            if (tempsRestant > 3600) {
              setTempsRestant(tempsRestant => tempsRestant - 3600);
              break;
            }
          case 3:
            if (tempsRestant > 86400) {
              setTempsRestant(tempsRestant => tempsRestant - 86400);
              break;
            }
        }
      }
    }
  };

  // callback potentiometer
  const handlePotentiometerValueChange = (value: any) => {
    setPotentiometerValue(value);
  };

  // select digit and genererValeursBooleennes it if countdown is off
  const selectDigit = () => {
    if (isActive && !countingDown) {
      setSetupMode(true);
      if (setupMode && setupValue <= 3) {
        switch (setupValue) {
          case 0:
            setSetupValue(1);
            break;
          case 1:
            setSetupValue(2);
            break;
          case 2:
            setSetupValue(3);
            break;
          case 3:
            setSetupValue(0);
            setSetupMode(false);
            break;
        }
      }
    }
  };

  // end of countdown
  if (tempsRestant <= 0) {
    if (countingDown) {
      setCountingDown(false);
      clearInterval(countdownIntervalId);
      setTempsRestant(0);
    }
  }

  // styles
  const screenDaysHeight = 5;
  const screenDaysWidth = 10;
  const screenHeight = 7;
  const screenWidth = 20;
  const screenOnColor = 'red';
  const screenOffColor = 'rgba(80,0,0,1)';

  return (
    <View style={styles.mainContainer}>
      {/* <View
        style={{
          backgroundColor: 'white',
          height: 10,
          width: '100%',
        }}
      /> */}
      {/* header days */}
      <View style={styles.screenDaysContainer}>
        <Text style={styles.text}>DAYS</Text>
        <View style={styles.screenDays}>
          {countingDownConverter(tempsRestant, mode)
            .days.split('')
            .map((digit, i) => (
              <SevenSegmentDisplay
                key={i}
                value={isActive ? digit : ''}
                onColor={
                  setupMode && setupValue === 3 && genererValeursBooleennes()[4]
                    ? screenOffColor
                    : screenOnColor
                }
                offColor={screenOffColor}
                height={screenDaysHeight}
                width={screenDaysWidth}
              />
            ))}
        </View>
      </View>
      {/* power zone */}
      <View style={styles.powerContainer}>
        <Power
          value={isActive ? potentiometerValue : 0}
          maxValue={10}
          numLEDs={10}
        />
        <Rotate onValueChange={handlePotentiometerValueChange} />
      </View>
      {/* screens zone */}
      <View style={styles.screensContainer}>
        <View style={styles.mainDigits}>
          <Text style={styles.text}>HRS</Text>
          <View style={styles.digits}>
            {countingDownConverter(tempsRestant, mode)
              .hours.split('')
              .map((digit, i) => (
                <SevenSegmentDisplay
                  key={i}
                  value={isActive ? digit : ' '}
                  onColor={
                    setupMode &&
                    setupValue === 2 &&
                    genererValeursBooleennes()[4]
                      ? screenOffColor
                      : screenOnColor
                  }
                  offColor={screenOffColor}
                  height={screenHeight}
                  width={screenWidth}
                />
              ))}
          </View>
        </View>
        <View style={styles.collon}>
          <LedRound
            size={15}
            isOn={countingDown && genererValeursBooleennes()[4]}
          />
          <LedRound
            size={15}
            isOn={countingDown && genererValeursBooleennes()[4]}
          />
        </View>
        <View style={styles.mainDigits}>
          <Text style={styles.text}>MINS</Text>
          <View style={styles.digits}>
            {countingDownConverter(tempsRestant, mode)
              .minutes.split('')
              .map((digit, i) => (
                <SevenSegmentDisplay
                  key={i}
                  value={isActive ? digit : ' '}
                  onColor={
                    setupMode &&
                    setupValue === 1 &&
                    genererValeursBooleennes()[4]
                      ? screenOffColor
                      : screenOnColor
                  }
                  offColor={screenOffColor}
                  height={screenHeight}
                  width={screenWidth}
                />
              ))}
          </View>
        </View>
        <View style={styles.collon}>
          <LedRound
            size={15}
            isOn={countingDown && genererValeursBooleennes()[4]}
          />
          <LedRound
            size={15}
            isOn={countingDown && genererValeursBooleennes()[4]}
          />
        </View>
        <View style={styles.mainDigits}>
          <Text style={styles.text}>SECS</Text>
          <View style={styles.digits}>
            {countingDownConverter(tempsRestant, mode)
              .seconds.split('')
              .map((digit, i) => (
                <SevenSegmentDisplay
                  key={i}
                  value={isActive ? digit : ' '}
                  onColor={
                    setupMode &&
                    setupValue === 0 &&
                    genererValeursBooleennes()[4]
                      ? screenOffColor
                      : screenOnColor
                  }
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
            <Led
              size={30}
              isOn={isActive && countingDown && genererValeursBooleennes()[1]}
              color="yellow"
            />
            <Led
              size={30}
              isOn={isActive && countingDown && genererValeursBooleennes()[2]}
              color="red"
            />
            <Led
              size={30}
              isOn={isActive && countingDown && genererValeursBooleennes()[3]}
              color="green"
            />
          </View>
          <View style={styles.aside}>
            <Text style={styles.text}>TAU</Text>
            <Text style={styles.text}>DELTA</Text>
            <Text style={styles.text}>ZETA</Text>
          </View>
        </View>
        <View style={styles.mainRight}>
          <Bargraph
            value={isActive && countingDown && genererValeursBooleennes()[5]}
            maxValue={10}
            numLEDs={10}
            state={isActive}
          />
          <Bargraph
            value={isActive && countingDown && genererValeursBooleennes()[5]}
            maxValue={10}
            numLEDs={10}
            rotate={true}
            state={isActive}
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
              setTime('add');
            }}
          />
          <Button
            buttonName="4"
            big={true}
            onPress={() => {
              setTime('remove');
            }}
          />
        </View>
        <View style={styles.rowButtons}>
          <Button
            buttonName="PWR"
            big={false}
            onPress={() => {
              powerToggle();
            }}
          />
          <Button
            buttonName="FCN"
            big={false}
            onPress={() => {
              selectDigit();
            }}
          />
          <Button buttonName="NAME MENU" big={false} onPress={() => {}} />
          <Button
            buttonName="END"
            big={false}
            onPress={() => {
              countDown();
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default App;
