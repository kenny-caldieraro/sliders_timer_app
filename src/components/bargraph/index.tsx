import React from 'react';
import {View, StyleSheet} from 'react-native';

interface LEDBarGraphProps {
  value: number;
  maxValue: number;
  numLEDs: number;
  ledColor?: string;
  ledOffColor?: string;
  backgroundColor?: string;
  ledWidth?: number;
  ledHeight?: number;
  spacing?: number;
  rotate?: boolean;
  state?: boolean;
}

const LEDBarGraph: React.FC<LEDBarGraphProps> = ({
  value,
  maxValue,
  numLEDs,
  ledColor = 'rgba(0, 255, 0, 1)',
  ledOffColor = 'rgba(0, 30, 0, 1)',
  backgroundColor = 'black',
  ledWidth = 40,
  ledHeight = 13,
  spacing = 2,
  rotate = false,
  state = false,
}) => {
  const numEmptyLEDs = numLEDs - Math.floor((value / maxValue) * numLEDs);

  return (
    <View
      style={[
        styles.container,
        {
          width: ledWidth + spacing,
          backgroundColor,
          transform: rotate ? [{rotate: '180deg'}] : [],
        },
      ]}>
      {Array.from({length: numLEDs}, (_, index) => {
        let isFilled;
        if ((index === 0 || index === 9) && state) {
          isFilled = true;
        } else {
          isFilled = index >= numEmptyLEDs;
        }
        const ledStyle = {
          width: ledWidth,
          height: ledHeight,
          backgroundColor: isFilled ? ledColor : ledOffColor,
          marginVertical: spacing / 2,
        };
        return <View style={[styles.led, ledStyle]} key={index} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    borderRadius: 5,
  },
  led: {
    borderRadius: 2,
  },
});

export default LEDBarGraph;
