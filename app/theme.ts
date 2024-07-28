'use client';
import { Nanum_Gothic } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const nanumGothic = Nanum_Gothic({
   weight: ['400', '700', '800'],
   subsets: ['latin'],
});

const theme = createTheme({
   typography: {
      fontFamily: nanumGothic.style.fontFamily,
   },
});

export default theme;
