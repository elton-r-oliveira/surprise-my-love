import type { AppProps } from "next/app";
import { AudioProvider } from '../contexts/AudioContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AudioProvider>
      <Component {...pageProps} />
    </AudioProvider>
  );
}

export default MyApp;