import React from 'react';
import {View, ViewStyle, StyleSheet} from 'react-native';

interface LEDBarGraphProps {
  value: number;
  maxValue: number;
  numLEDs: number;
  ledColor?: string;
  backgroundColor?: string;
  ledSize?: number;
  spacing?: number;
}

const LEDBarGraph: React.FC<LEDBarGraphProps> = ({
  value,
  maxValue,
  numLEDs,
  ledColor = 'rgba(0, 255, 0, 1)',
  backgroundColor = 'rgba(0, 30, 0, 1)',
  ledSize = 15,
  spacing = -5,
}) => {
  const barFillPercentage = (value / maxValue) * 100;
  const numEmptyLEDs = numLEDs - Math.floor((value / maxValue) * numLEDs);
  const angleIncrement = 270 / (numLEDs - 1); // Angle entre chaque LED
  const arcRadius = (ledSize + spacing) * (numLEDs - 1); // Rayon de l'arc de cercle

  return (
    <View
      style={[
        styles.container,
        {
          width: arcRadius + ledSize,
          height: arcRadius + ledSize,
        },
      ]}>
      {Array.from({length: numLEDs}, (_, index) => {
        const isFilled = index >= numEmptyLEDs;
        const rotationAngle = index * angleIncrement - 135; // Angle de rotation pour chaque LED
        const ledStyle = {
          width: ledSize,
          height: ledSize,
          borderRadius: ledSize / 2,
          backgroundColor: isFilled ? ledColor : backgroundColor,
          position: 'absolute',
          top: arcRadius * Math.sin((rotationAngle * Math.PI) / 180), // Calcul de la position top en fonction de l'angle
          left: arcRadius * Math.cos((rotationAngle * Math.PI) / 180), // Calcul de la position left en fonction de l'angle
        };
        return <View style={[styles.led, ledStyle]} key={index} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{rotate: '270deg'}],
  },
  led: {},
});

export default LEDBarGraph;
