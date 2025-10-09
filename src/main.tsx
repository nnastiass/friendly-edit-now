import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ScreenOrientation } from '@capacitor/screen-orientation'

// Lock screen orientation to portrait
if (typeof window !== 'undefined' && 'Capacitor' in window) {
  ScreenOrientation.lock({ orientation: 'portrait' }).catch(console.error)
}

createRoot(document.getElementById("root")!).render(<App />);
