import { Alert } from 'react-native';
import { all, takeLatest, call, put } from 'redux-saga/effects';

import api from '~/services/api';
// import history from '~/services/history';

import { signInSuccess, signFailure, signUpSuccess } from './actions';

export function* signIn({ payload }) {
  try {
    const { email, password } = payload;

    const response = yield call(api.post, '/sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    if (user.provider) {
      Alert.alert(
        'Erro no login',
        'Usuário não pode ser prestador de serviços!'
      );

      return;
    }
    // -> Seta um header em todas as requisicoes
    api.defaults.headers.Authorization = `Bearer ${token}`;

    yield put(signInSuccess(token, user));
    // history.push('/dashboard');
  } catch (err) {
    Alert.alert(
      'Erro no login',
      'Houve um erro no login, verifique seus dados!'
    );

    yield put(signFailure());
  }
}

export function* signUp({ payload }) {
  try {
    const { name, email, password } = payload;

    yield call(api.post, '/users', {
      name,
      email,
      password,
    });
    yield put(signUpSuccess());
    Alert.alert('Sucesso', 'Conta criada com sucesso!');

    // history.push('/');
  } catch (err) {
    Alert.alert(
      'Erro no cadastro',
      'Houve um erro no cadastro, verifique seu dados!'
    );

    yield put(signFailure());
  }
}

export function setToken({ payload }) {
  if (!payload) return;

  const { token } = payload.auth;
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
}

export default all([
  takeLatest('persist/REHYDRATE', setToken),
  takeLatest('@auth/SIGN_IN_REQUEST', signIn),
  takeLatest('@auth/SIGN_UP_REQUEST', signUp),
]);
