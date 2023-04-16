import React, {useState, useRef} from 'react';
import {View, PanResponder, StyleSheet} from 'react-native';

const Potentiometer = ({onValueChange}: any) => {
  const [value, setValue] = useState(5);
  const knobRef = useRef(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      // Calculer la nouvelle valeur en fonction de l'angle de rotation
      const {moveX, moveY} = gestureState;
      const knob: any = knobRef.current;
      knob.measure(
        (
          x: any,
          y: any,
          width: number,
          height: number,
          pageX: number,
          pageY: number,
        ) => {
          const centerX = pageX + width / 2;
          const centerY = pageY + height / 2;
          const angle =
            Math.atan2(moveY - centerY, moveX - centerX) * (180 / Math.PI) + 75;
          const invertedAngle = angle; // Inversion du sens de rotation
          const newValue = Math.floor(invertedAngle / 20);
          // Limiter la valeur entre 0 et 10
          const clampedValue = Math.min(Math.max(newValue, 0), 10);
          setValue(clampedValue);
          if (onValueChange) {
            onValueChange(clampedValue);
          }
        },
      );
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.slider} {...panResponder.panHandlers}>
        <View
          ref={knobRef}
          style={[styles.knob, {transform: [{rotate: `${value * 30}deg`}]}]}>
          <View style={styles.mark} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    transform: [{rotateY: '180deg'}, {rotate: '120deg'}],
  },
  slider: {
    width: 140,
    height: 140,
    borderRadius: 100,
    backgroundColor: 'rgba(15, 15, 15, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 10,
    borderColor: 'rgba(30, 30, 30, 0.8)',
  },
  knob: {
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mark: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    position: 'absolute',
    top: '50%',
    transform: [{translateY: -5}],
  },
});

export default Potentiometer;
