


// Footer.jsx - Cute but minimal footer component (no background)

const Footer = () => {
  return (
    <footer className="py-8 text-center text-sm text-gray-600">
      <p>
        🌿 Made by{' '}
        <a 
          href="https://www.lilywatson.dev/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-800 hover:text-gray-900 transition-colors font-medium"
        >
          Lily Watson
        </a>
        {' '}• {' '}
        <a 
          href="https://github.com/thislily" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-800 hover:text-gray-900 transition-colors font-medium"
        >
          GitHub
        </a>
        {' '}🌿
      </p>
    </footer>
  );
};

export default Footer;