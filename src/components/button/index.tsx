import React from 'react';
import {StyleSheet, TouchableOpacity, Text} from 'react-native';

const MyButton = ({...props}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        props.onPress();
      }}
      style={[
        styles.container,
        {
          width: props.big ? 80 : 70,
          height: props.big ? 45 : 40,
          alignItems: props.big ? 'flex-end' : 'center',
        },
      ]}>
      <Text
        style={[
          styles.text,
          {fontSize: props.big ? 25 : 13, paddingRight: !props.big ? 0 : 10},
        ]}>
        {props.buttonName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    borderColor: 'white',
    borderWidth: 3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    textAlign: 'right',
    fontWeight: 'bold',
  },
});

export default MyButton;
