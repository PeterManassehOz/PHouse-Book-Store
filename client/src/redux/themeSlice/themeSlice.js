import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  darkMode: localStorage.getItem('darkMode') === 'true',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode); // Save to localStorage
    },
    resetTheme: (state) => {
      state.darkMode = false;
      localStorage.removeItem('darkMode'); // Clear from localStorage
    },
  },
});

export const { toggleDarkMode, resetTheme } = themeSlice.actions;
export default themeSlice.reducer;
