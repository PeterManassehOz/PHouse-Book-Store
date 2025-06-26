// themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

// ← this must be at the very top
const isBrowser = typeof window !== 'undefined';

const initialState = {
  darkMode: isBrowser && window.localStorage.getItem('darkMode') === 'true',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      if (isBrowser) {
        window.localStorage.setItem('darkMode', state.darkMode);
      }
    },
    resetTheme: (state) => {
      state.darkMode = false;
      if (isBrowser) {
        window.localStorage.setItem('darkMode', 'false');
      }
    },
  },
});

export const { toggleDarkMode, resetTheme } = themeSlice.actions;
export default themeSlice.reducer;
