import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';

interface RotaryButtonProps {
  size: number;
  onPress: (angle: number) => void;
}

const RotaryButton: React.FC<RotaryButtonProps> = ({size, onPress}) => {
  const [angle, setAngle] = useState(0);
  const pan = useState(new Animated.Value(0))[0];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      const {dx, dy} = gestureState;
      const newAngle = Math.atan2(dy, dx) * (180 / Math.PI); // Convertir en degrés
      setAngle(newAngle);
      Animated.event([null, {dx: pan}], {useNativeDriver: false})(
        event,
        gestureState,
      );
    },
    onPanResponderRelease: (event, gestureState) => {
      onPress(angle);
      setAngle(0);
      Animated.spring(pan, {toValue: 0, useNativeDriver: false}).start();
    },
  });

  const rotateStyle = {
    transform: [
      {
        rotate: pan.interpolate({
          inputRange: [-180, 180],
          outputRange: ['-180deg', '180deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, {width: size, height: size}]}
        {...panResponder.panHandlers}>
        <Animated.View style={[styles.knob, rotateStyle]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  knob: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'gray',
  },
});

export default RotaryButton;
