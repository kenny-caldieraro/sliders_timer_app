import React from 'react';
import {View, StyleSheet} from 'react-native';

interface RoundLedProps {
  size: number;
  isOn: boolean;
}

const RoundLed: React.FC<RoundLedProps> = ({size, isOn}) => {
  const ledColor = isOn ? 'rgba(255, 0, 0, 1)' : 'rgba(80, 0, 0, 1)';

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: ledColor,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RoundLed;
