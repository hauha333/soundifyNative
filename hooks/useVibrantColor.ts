import { getColors } from 'react-native-image-colors';
import { useEffect, useState } from 'react';

export const useVibrantColor = (imageUrl: string): string => {
  const [color, setColor] = useState<string>('transparent');

  useEffect(() => {
    if (!imageUrl) {
      console.log('No image URL provided');
      return;
    }

    let isCancelled = false;

    console.log('Extracting colors from:', imageUrl);

    getColors(imageUrl, {
      fallback: '#228B22',
      cache: true,
      key: imageUrl
    })
      .then((result) => {
        console.log('Full result:', JSON.stringify(result, null, 2));

        if (!isCancelled) {
          let extractedColor = 'transparent';

          if (result.platform === 'android') {
            console.log('Android colors:', {
              vibrant: result.vibrant,
              dominant: result.dominant,
              average: result.average,
              darkVibrant: result.darkVibrant,
              lightVibrant: result.lightVibrant
            });
            extractedColor = result.vibrant || result.dominant || result.average || 'transparent';
          } else if (result.platform === 'ios') {
            console.log('iOS colors:', {
              primary: result.primary,
              secondary: result.secondary,
              background: result.background,
              detail: result.detail
            });
            extractedColor =
              result.primary || result.secondary || result.background || 'transparent';
          } else if (result.platform === 'web') {
            console.log('Web colors:', {
              vibrant: result.vibrant,
              dominant: result.dominant
            });
            extractedColor = result.vibrant || result.dominant || 'transparent';
          }

          console.log('Final extracted color:', extractedColor);
          setColor(extractedColor);
        }
      })
      .catch((error) => {
        console.error('Error extracting colors:', error);
        if (!isCancelled) {
          setColor('transparent');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [imageUrl]);

  return color;
};
