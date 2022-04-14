const colorTheme = {
  primary: '#E7E7E7',
  secondary: '#FFF7DA',
  third: '#AD95F0',
  fourth: '#57FAAC',
  disabled: '#5e5c54',
  grayNFT: '#EDE2BC',
  grayTransparent: '#00000055',
  grayBurn: '#292929',
  grayDark: '#222222',
  graySlot: '#252525',
  grayInput: '#494949',
  grayDisabled: '#B4B4B4',
  grayDuration: '#535353',
  violetUnderline: '#C5B0FF',
  backgroundColorPlaceHolder: '#e6e0ca',
  foregroundColorPlaceHolder: '#f4eed7',
  'secondary-h': '#EDE2BC',
  'third-h': '#826AC6',
  'third-a': '#7863B5',
  'fourth-h': '#50DE9A',
  'primary-h': '#FF812B',
  'item-background': '#F9F9F9',
  'item-title': '#B8B8B8',
  'primus-orange': '#FF812B',
  'primus-grey': '#D2D2D2',
  'primus-dark-grey': '#969696',
  'primus-light-grey': '#F0F0F0',
  'primus-title': '#CECECE',
  'primus-copy': '#3B3B3B',
  'primus-label': '#C5C5C5',
  'rps-bg': '#F2F2F2',
  'rps-info-bg': '#FFE3D0'
};

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      borderRadius: {
        '3px': '3px',
        '10px': '10px',
      },
      backgroundColor: colorTheme,
      textColor: colorTheme,
      colors: colorTheme,
      borderColor: colorTheme,
      fill: colorTheme,
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        '11/12': '91.666667%',
      },
      maxHeight: {
        '80-screen': '80vh',
        '90-screen': '90vh',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
        sansLight: ['MaisonNeueLight', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['ShareTech', 'Helvetica', 'Arial', 'sans-serif'],
      },
      inset: {
        '-3': '-3px',
        '-4': '-4px',
      },
      fontSize: {
        '2xls': '1.4rem',
        xxs: '.65rem',
      },
      spacing: {
        '5px': '5px',
        100: '26rem',
        104: '28rem',
        108: '30rem',
        112: '32rem',
        116: '34rem',
        120: '36rem',
        124: '38rem',
        126: '54rem',
        128: '56rem',
      },
      gridTemplateColumns: {
        '7/3': '70% 30%',
      },
      minHeight: {
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem',
        100: '28rem',
        104: '32rem',
        108: '36rem',
        112: '40rem',
      },
      height: {
        '50-screen': '50vh',
      },
      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      transitionDelay: {
        1500: '1500ms',
        2000: '2000ms',
      },
      translate: {
        '11/10': '110%',
        '-11/10': '-110%',
      },
      transitionDuration: {
        1500: '1500ms',
      },
      scale: {
        25: '0.25',
      },
      boxShadow: {
        primus: '-4px 4px 0px 0px #0000001A',
        border: 'inset 0px 0px 0px 2px #FF812B',
        info: 'inset -10px 0px 20px 0px #0000001A'
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    // ...
  ],
};
