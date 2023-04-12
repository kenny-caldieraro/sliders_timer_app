import React from 'react';
import {View, StyleSheet} from 'react-native';

interface RectangularLedProps {
  size: number;
  isOn: boolean;
  color: 'red' | 'yellow' | 'green';
}

const RectangularLed: React.FC<RectangularLedProps> = ({size, isOn, color}) => {
  let ledColor;

  switch (color) {
    case 'red':
      ledColor = isOn ? 'rgba(255, 0, 0, 1)' : 'rgba(70, 0, 0, 1)';
      break;
    case 'yellow':
      ledColor = isOn ? 'rgba(255, 255, 0, 1)' : 'rgba(70, 70, 0, 1)';
      break;
    case 'green':
    default:
      ledColor = isOn ? 'rgba(0, 255, 0, 1)' : 'rgba(0, 70, 0, 1)';
      break;
  }

  return (
    <View
      style={[
        styles.container,
        {width: size, height: size / 2.3, backgroundColor: ledColor},
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
  },
});

export default RectangularLed;
