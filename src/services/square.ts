declare global {
  interface Window {
    Square: any;
  }
}

const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APP_ID || '';
const SQUARE_ENVIRONMENT = import.meta.env.VITE_SQUARE_ENVIRONMENT || 'sandbox';

export async function loadSquare(): Promise<any> {
  if (window.Square) {
    return window.Square.payments(SQUARE_APP_ID, SQUARE_ENVIRONMENT);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.onload = () => {
      resolve(window.Square.payments(SQUARE_APP_ID, SQUARE_ENVIRONMENT));
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
