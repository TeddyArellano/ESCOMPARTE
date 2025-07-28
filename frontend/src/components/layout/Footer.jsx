import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => (  <footer className="escomparte__footer">
    <nav className="escomparte__footer-nav" aria-label="Footer navigation">
      <a href="#about" className="escomparte__footer-link">Acerca de</a>
      <Link to="/contacto" className="escomparte__footer-link">Contacto</Link>
      <a href="#support" className="escomparte__footer-link">Soporte</a>
      <a href="#terms" className="escomparte__footer-link">Términos de servicio</a>
      <a href="#privacy" className="escomparte__footer-link">Politica de Privacidad</a>
    </nav>
    <div className="escomparte__social">
      <a href="#" className="escomparte__social-link" aria-label="Facebook">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.77,7.46H14.5V10.24h4.27V13H14.5v9.83H10.73V13H6.5V10.24h4.23V7.46a4,4,0,0,1,4-4h4.27v4"></path>
        </svg>
      </a>
      <a href="#" className="escomparte__social-link" aria-label="Twitter">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.46,6c-.77.35-1.6.58-2.46.69.88-.53,1.56-1.37,1.88-2.38-.83.5-1.75.85-2.72,1.05C18.37,4.5,17.26,4,16,4c-2.35,0-4.27,1.92-4.27,4.29,0,.34,0,.67.11,1-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58,1.37-.58,2.15,0,1.49.75,2.81,1.91,3.56-.71,0-1.37-.2-1.95-.5v.03c0,2.08,1.48,3.82,3.44,4.21a4.22,4.22,0,0,1-1.93.07,4.28,4.28,0,0,0,4,2.98,8.521,8.521,0,0,1-5.33,1.84,8.39,8.39,0,0,1-1.02-.06A12.087,12.087,0,0,0,8.12,21,11.965,11.965,0,0,0,20.34,9.147c0-.183,0-.366-.013-.548A8.491,8.491,0,0,0,22.46,6Z"></path>
        </svg>
      </a>
      <a href="#" className="escomparte__social-link" aria-label="Instagram">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02c0-1.45-.47-2.7-1.3-3.54a4.82 4.82 0 0 0-3.54-1.25zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
        </svg>
      </a>
      <a href="#" className="escomparte__social-link" aria-label="YouTube">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
        </svg>
      </a>
    </div>
    <p className="escomparte__copyright">&copy; {new Date().getFullYear()} ESCOMPARTE. All rights reserved.</p>
  </footer>
);

export default Footer;
