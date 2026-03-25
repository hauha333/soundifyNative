import { Text, View, StyleSheet, Alert } from 'react-native';
import useColorScheme from '@/hooks/useColorScheme';
import Button from '@/components/elements/Button';
import { useRouter } from 'expo-router';
import { colors } from '@/theme';
import { TextInput } from 'react-native-gesture-handler';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthenticationParams } from '@/types/auth';
import * as yup from 'yup';

import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { PAGES } from '@/utils/constants/pages';
import { useAuthenticationMutation } from '@/services/user.service';

export const loginValidation = yup.object({
  username: yup.string().required(),
  password: yup.string().required()
});

export type LoginModel = yup.InferType<typeof loginValidation>;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGrayPurple,
    paddingBottom: '20%'
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  buttonTitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center'
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: colors.lightPurple,
    height: 44,
    width: '50%'
  },
  input: {
    width: '50%',
    borderRadius: 8,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 4,
    paddingHorizontal: 8
  },
  error: {
    color: 'red',
    marginBottom: 8,
    width: '50%',
    fontSize: 12
  }
});

export default function Login() {
  const router = useRouter();
  const [login, { isLoading: isLoginLoading }] = useAuthenticationMutation();
  const { isDark } = useColorScheme();
  const { isAuthenticated } = useSelector((state: any) => state.userStore);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LoginModel>({
    resolver: yupResolver(loginValidation),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginModel) => {
    try {
      const model: AuthenticationParams = {
        params: {
          type: 'default',
          action: 'loggin'
        },
        body: { data }
      };

      const response = await login(model).unwrap();

      reset();

      router.push('/home');
    } catch (e: any) {
      console.error('❌ Login error:', e);
      console.error('❌ Error data:', e?.data);
      console.error('❌ Error response:', e?.error);

      const error =
        e?.data?.error?.message?.description ||
        e?.error?.message?.description ||
        e?.message ||
        'Помилка входу';

      Alert.alert('Помилка', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && PAGES.AUTHENTICATION_LOGIN.startsWith(PAGES.AUTHENTICATION_LOGIN)) {
      router.push(PAGES.HOME);
    }
  }, []);

  return (
    <View style={[styles.root, isDark && { backgroundColor: colors.blackGray }]}>
      <Text style={[styles.title, isDark && { color: colors.gray }]}>Login</Text>

      <Controller
        control={control}
        name='username'
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={[
                styles.input,
                errors.username && { borderColor: 'red', borderWidth: 2 },
                isDark ? { color: colors.white } : { color: colors.blackGray }
              ]}
              placeholder='Email'
              placeholderTextColor={isDark ? '#999' : '#666'}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType='email-address'
              autoCapitalize='none'
            />
            {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}
          </>
        )}
      />

      <Controller
        control={control}
        name='password'
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={[
                styles.input,
                errors.password && { borderColor: 'red', borderWidth: 2 },
                isDark ? { color: colors.white } : { color: colors.blackGray }
              ]}
              placeholder='Password'
              placeholderTextColor={isDark ? '#999' : '#666'}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={true}
            />
            {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
          </>
        )}
      />

      <Button
        style={styles.button}
        titleStyle={styles.buttonTitle}
        title={isLoginLoading ? 'Завантаження...' : 'Enter'}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoginLoading}
      />
    </View>
  );
}
