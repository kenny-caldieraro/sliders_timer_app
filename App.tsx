import React from 'react';
import {View, Text, Animated, StatusBar} from 'react-native';
import SevenSegmentDisplay from 'rn-seven-segment-display';
import Sound from 'react-native-sound';

// sounds
const slide = require('./src/assets/sounds/slide.mp3');
const bip = require('./src/assets/sounds/bip.mp3');

const bipSound = new Sound(bip, error => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
});

const slideSound = new Sound(slide, error => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
});

// Components
import {Button, Bargraph, Power, Led, LedRound} from './src/components/index';

// styles
import styles from './src/assets/css/mainStyle';

// function
import {
  genererValeursBooleennes,
  countingDownConverter,
} from './src/common/functions/index';

const App = () => {
  const [isActive, setIsActive] = React.useState(false);
  const [, setCounter] = React.useState(0);
  const [loopIntervalId, setLoopIntervalId] = React.useState(0);
  const [tempsRestant, setTempsRestant] = React.useState(0);
  const [setupMode, setSetupMode] = React.useState(false);
  const [setupValue, setSetupValue] = React.useState(0);
  const [countdownIntervalId, setCountdownIntervalId] = React.useState(0);
  const [countingDown, setCountingDown] = React.useState(false);
  const [mode, setMode] = React.useState('init');
  const [randomMode, setRandomMode] = React.useState(false);

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
    if (!countingDown && tempsRestant > 0) {
      return;
    }
    setIsActive(!isActive);
    bipSound.play().setVolume(0.1);
  };

  React.useEffect(() => {
    if (isActive) {
      countDown();
    }
  }, [isActive]);

  // countdown
  const countDown = () => {
    bipSound.play().setVolume(0.1);
    if (isActive) {
      if (tempsRestant > 0) {
        if (!setupMode) {
          if (countingDown && tempsRestant > 0) {
            return;
          }
          startAnimation();
          slideSound.play((success: any) => {
            if (success) {
              setCountingDown(true);
              const intervalId = setInterval(() => {
                bipSound.play().setVolume(0.2);
                setTempsRestant(tempsRestant => tempsRestant - 1);
              }, 1000);
              setCountdownIntervalId(intervalId);
            }
          });
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
          if (count > 12) {
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
        bipSound.play().setVolume(0.1);
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
        bipSound.play().setVolume(0.1);
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

  // set setup mode
  const selectDigit = () => {
    bipSound.play().setVolume(0.1);
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

  // animation
  const [, setBackgroundColor] = React.useState('black');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const startAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      setBackgroundColor('white');
      setTimeout(() => {
        setBackgroundColor('black');
      }, 3000);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        delay: 2000,
        useNativeDriver: false,
      }).start();
    });
  };

  const backgroundColorStyle = {
    backgroundColor: fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['black', 'white'],
    }),
  };

  // function random
  const slideBeforeTime = () => {
    const soundDelay = slideSound.getDuration();
    if ((tempsRestant > 0 && countingDown) || random) {
      startAnimation();
      setCountingDown(false);
      clearInterval(countdownIntervalId);
      setTempsRestant(0);
      bipSound.stop();
      slideSound.play((success: any) => {
        if (success) {
          setMode('init');
          countDown();
          setIsActive(false);
          setIsActive(true);
        }
      });

      setTimeout(() => {
        random();
        setRandomMode(true);
      }, soundDelay * 1000 + 5000);
    }
  };

  const random = () => {
    setTempsRestant(Math.floor(Math.random() * 86400));
    setCountingDown(true);
    const intervalId = setInterval(() => {
      bipSound.play().setVolume(0.2);
      setTempsRestant(tempsRestant => tempsRestant - 1);
    }, 1000);
    setCountdownIntervalId(intervalId);
  };

  // end of countdown
  if (tempsRestant <= 0) {
    if (countingDown) {
      startAnimation();
      slideSound.play((success: any) => {
        if (success) {
          setMode('init');
          countDown();
          setIsActive(false);
          setIsActive(true);
        }
      });
      setCountingDown(false);
      clearInterval(countdownIntervalId);
      setTempsRestant(0);
      bipSound.stop();
    }
  }

  // test sound
  if (tempsRestant <= 15) {
    if (countingDown) {
      bipSound.play().setVolume(0.2);
    }
  }

  // styles
  const screenDaysHeight = 5;
  const screenDaysWidth = 12;
  const screenHeight = 7;
  const screenWidth = 18;
  const screenOnColor = 'red';
  const screenOffColor = 'rgba(60,0,0,1)';

  return (
    <View style={styles.mainContainer}>
      <StatusBar hidden={true} />
      <Animated.View
        style={[
          backgroundColorStyle,
          {
            height: 52,
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexDirection: 'row',
            position: 'absolute',
            top: -20,
          },
        ]}
      />
      <Animated.View
        style={[
          backgroundColorStyle,
          {
            width: 40,
            height: 40,
            position: 'absolute',
            top: 20,
            left: 0,
            borderBottomRightRadius: 20,
            zIndex: 1,
          },
        ]}
      />
      <Animated.View
        style={[
          backgroundColorStyle,
          {
            width: 40,
            height: 40,
            position: 'absolute',
            top: 20,
            right: 0,
            borderBottomLeftRadius: 20,
            zIndex: 1,
          },
        ]}
      />

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
        <Power value={isActive} maxValue={10} numLEDs={10} />
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
                  value={isActive ? digit : ''}
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
          <View style={{width: 10, height: 'auto'}}>
            {Array(9)
              .fill(0)
              .map((_, i) => (
                <Text key={i} style={{color: 'white', letterSpacing: -2}}>
                  --
                </Text>
              ))}
          </View>
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
          <Button
            buttonName="
          NAME 
          MENU
          "
            big={false}
            onPress={() => {}}
          />
          <Button
            buttonName="END"
            big={false}
            onPress={() => {
              countDown();
              !randomMode && countingDown && slideBeforeTime();
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default App;
