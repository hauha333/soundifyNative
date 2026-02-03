import { Dimensions, View } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export const TrackSkeleton = () => {
  return (
    <View
      style={{
        width: screenWidth - 20,
        height: 70,
        borderRadius: 12,
        backgroundColor: '#1e1e1e',
        marginVertical: 6,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 8,
          backgroundColor: '#2a2a2a'
        }}
      />

      <View style={{ marginLeft: 12, flex: 1 }}>
        <View
          style={{
            width: '70%',
            height: 12,
            borderRadius: 6,
            backgroundColor: '#2a2a2a',
            marginBottom: 8
          }}
        />
        <View
          style={{
            width: '40%',
            height: 10,
            borderRadius: 6,
            backgroundColor: '#2a2a2a'
          }}
        />
      </View>
    </View>
  );
};
