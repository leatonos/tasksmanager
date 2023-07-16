import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

export interface LoginSlice {
  screen: string
}

const initialState: LoginSlice = {
  screen: 'login',
}

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    goToCreateAccount: (state) => {
      state.screen = 'createAccount'
    },
    goToLogin: (state) => {
      state.screen = 'login'
    },
    goTo: (state, action: PayloadAction<string>) => {
      state.screen = action.payload
    },
  },
})

export const { goToCreateAccount, goToLogin, goTo } = loginSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectLoginScreen = (state: RootState) => state.login.screen

export default loginSlice.reducer