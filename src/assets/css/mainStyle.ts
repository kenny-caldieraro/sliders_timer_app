import {StyleSheet, Platform, Dimensions} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const scale = (screenWidth / screenHeight) * (screenHeight > 800 ? 2.2 : 1.5);

const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'black',
    height: 830,
  },
  screenDaysContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    zIndex: 1,
    width: '100%',
    backgroundColor: 'black',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  screenDays: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    height: 'auto',
    width: '100%',
    transform: [{rotateY: '180deg'}, {scale: scale}],
  },
  screensContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 'auto',
  },
  mainDigits: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digits: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButtons: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '98%',
    height: 'auto',
    marginTop: 0,
    marginBottom: 15,
  },
  colomunButtons: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    width: '100%',
    height: 110,
    marginBottom: 10,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  main: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'android' ? 'flex-start' : 'center',
    width: screenWidth,
    height: 160,
    marginTop: 5,
  },
  mainLeft: {
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: screenWidth / 2.3,
    height: 130,
  },
  mainRight: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: screenWidth / 2.2,
    height: 200,
  },
  aside: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    height: 200,
  },
  collon: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 50,
    marginTop: 12,
    width: 1,
  },
});

export default styles;
