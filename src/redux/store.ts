import { configureStore } from '@reduxjs/toolkit'
import loginSlice from './loginSlice'
import userSlice from './userSlice'
import taskSlice from './taskSlice'

export const store = configureStore({
  reducer: {
    login:loginSlice,
    user:userSlice,
    task:taskSlice
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch