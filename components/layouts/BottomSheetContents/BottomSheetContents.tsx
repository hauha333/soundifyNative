import GradientButton from '@/components/elements/GradientButton';
import { StyleSheet, View, Text } from 'react-native';
import useColorScheme from '@/hooks/useColorScheme';
import { windowWidth } from '@/utils/deviceInfo';
import { colors, fonts } from '@/theme';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.openSan.bold,
    color: colors.black,
    marginTop: 16,
    marginBottom: 32,
    width: '100%',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.openSan.regular,
    width: '100%'
  },
  buttonTitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center'
  },
  button: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    width: windowWidth / 2,
    backgroundColor: colors.pink,
    marginBottom: 40
  },
  envContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  envTitle: {
    fontSize: 14,
    fontFamily: fonts.openSan.bold,
    color: colors.black
  },
  envValue: {
    fontSize: 14,
    fontFamily: fonts.openSan.regular,
    color: colors.black
  }
});

type WelcomeBottomSheetContentsProps = {
  onClose: () => void;
};

export default function BottomSheetContents({ onClose }: WelcomeBottomSheetContentsProps) {
  const { isDark } = useColorScheme();
  return (
    <View style={[styles.root, isDark && { backgroundColor: colors.blackGray }]}>
      <GradientButton
        title="OK"
        titleStyle={[styles.buttonTitle, isDark && { color: colors.blackGray }]}
        style={styles.button}
        gradientBackgroundProps={{
          colors: [colors.purple, colors.pink],
          start: { x: 0, y: 1 },
          end: { x: 0.8, y: 0 }
        }}
        onPress={onClose}
      />
    </View>
  );
}
