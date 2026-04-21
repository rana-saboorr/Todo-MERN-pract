import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    status: false
  },
  reducers: {
    login: function(state, action){
      state.user = action.payload;
      state.status = true;
    },

    logout: function(state){
      state.user = null;
      state.status = false;
    }
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;