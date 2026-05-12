export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__content">
          <div className="footer__credits">
            <p className="footer__credit">
              <span className="footer__label">Graphic design by</span>
              <span className="footer__name">Weronika Grzesiowska</span>
            </p>
            <p className="footer__credit">
              <span className="footer__label">Developed by</span>
              <a
                href="https://appcrates.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link"
              >
                Arkadiusz Wawrzyniak from appcrates.pl
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
