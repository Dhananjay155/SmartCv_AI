import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  resumeData:""
};
export const resumeSlice = createSlice({
  name: "editResume",
  initialState,
  reducers: {
    addResumeData: (state, action) => {
      state.resumeData = action.payload;
    },
  },
});

export const { addResumeData } = resumeSlice.actions;

export default resumeSlice.reducer;
