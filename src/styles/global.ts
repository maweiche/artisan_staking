import { createGlobalStyle } from 'styled-components';

import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    font-size: 1.6rem;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    /*
    background-image: url('/');
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: cover; */
  }

  html {
    font-size: 62.5%; // 1rem = 10px
    height: 100%;
  }

  body {
    text-rendering: optimizeLegibility !important;
    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100%;
    position: relative;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  ::-webkit-scrollbar {
    height: 6px;
    width: 3px;
    background-color:#787878;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.7);
    -webkit-border-radius: 8px;
  }

  .ReactModal__Overlay {
    -webkit-perspective: 600;
    perspective: 600;
    opacity: 0;
  }

  .ReactModal__Overlay--after-open {
    opacity: 1;
    transition: opacity .2s ease;
  }

  .ReactModal__Content {
    -webkit-transform: scale(0.5);
    transform: scale(0.5);
  }

  .ReactModal__Content--after-open {
    -webkit-transform: scale(1);
    transform: scale(1);
    transition: all .2s ease;
  }

  .ReactModal__Overlay--before-close {
    opacity: 0;
  }

  .ReactModal__Content--before-close {
    -webkit-transform: scale(0.5);
    transform: scale(0.5);
    transition: all .2s ease-in;
  }

  .ReactModal__Body--open,
  .ReactModal__Html--open {
    overflow: hidden;
  }

  .modal-overlay {
    z-index: 9999;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
    backdrop-filter: blur(4px);
  }

  .modal-content {
    z-index: 999;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: ${({ theme }) => theme.colors.background};
    border-radius: 20px;
    border: none;
    outline: none;
    max-width: 600px;
    max-height: 450px;
    height: 100%;
    margin: auto;
    overflow: hidden;

    @media ${({ theme }) => theme.breakpoints.mobile} {
      width: 90%;
    }
  }

  .dropdown {
    background: #131313;
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    width: 100%;
    max-width: 300px;
    transition: all .2s ease;
  }

  .dropdown-control {
    background-color: transparent;
    border: none;
    padding: 0;
    width: 100%;
    max-width: 300px;
    padding: 24px 32px;
    cursor: pointer;
  }

  .dropdown-placeholder {

  }

  .dropdown-menu {
    background-color: ${({ theme }) => theme.colors.card};
    margin-top: 4px;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    padding: 8px 4px;
    width: 100%;
    max-width: 300px;
    border: none;
    top: 45%;
    transition: all .2s ease;

    .is-selected {
      background-color: ${({ theme }) => theme.colors.card};

      h6, span {
        color: #706F78;
      }

      :hover {
        background-color: ${({ theme }) => theme.colors.card} !important;
        cursor: default;
      }
    }
  }

  .dropdown-arrow {
    right: 24px;
    top: 32px;
  }

  .Dropdown-option {
    padding: 8px 24px;

    :hover {
      background: rgba(255, 255, 255, .3);
      border-radius: 12px;
    }
  }
`;
