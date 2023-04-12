import React from 'react';
import {View, ViewStyle, StyleSheet} from 'react-native';

import {Rotate} from '../index';
interface LEDBarGraphProps {
  value: boolean;
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
  const [potentiometerValue, setPotentiometerValue] = React.useState(5);

  React.useEffect(() => {
    if (value) {
      setPotentiometerValue(5);
    } else {
      setPotentiometerValue(0);
    }
  }, [value]);

  const barFillPercentage = (potentiometerValue / maxValue) * 100;
  const numEmptyLEDs =
    numLEDs - Math.floor((potentiometerValue / maxValue) * numLEDs);
  const angleIncrement = 270 / (numLEDs - 1);
  const arcRadius = (ledSize + spacing) * (numLEDs - 1);

  // callback potentiometer
  const handlePotentiometerValueChange = (value: any) => {
    setPotentiometerValue(value);
  };

  return (
    <View
      style={{
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
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
      {/* <View style={{}}> */}
      <Rotate onValueChange={handlePotentiometerValueChange} />
      {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    transform: [{rotate: '270deg'}, {translateY: 50}, {translateX: 40}],
    position: 'absolute',
  },
  led: {},
});

export default LEDBarGraph;
