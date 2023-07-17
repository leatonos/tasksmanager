import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { UserTaskBoard } from '@/interfaces/interfaces';



export interface UserSlice {
    userName:string;
    userId:string;
    userEmail:string;
    userTaskBoards:UserTaskBoard[];
}

const initialState: UserSlice = {
   userName:'',
   userId:'',
   userEmail:'',
   userTaskBoards:[]
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload
    },
    setUserEmail: (state, action: PayloadAction<string>) => {
      state.userEmail = action.payload
    },
    setUserTaskBoards: (state, action: PayloadAction<UserTaskBoard[]>) =>{
      state.userTaskBoards = action.payload
    }
  },
})

export const { setUserName, setUserId, setUserEmail,setUserTaskBoards} = userSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectUserName = (state: RootState) => state.user.userName
export const selectUserId = (state: RootState) => state.user.userId
export const selectUserEmail = (state: RootState) => state.user.userEmail

export default userSlice.reducer