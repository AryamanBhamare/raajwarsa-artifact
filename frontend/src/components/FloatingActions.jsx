import { BRAND, whatsappUrl, mapDirectionsUrl } from '../config';

const chatUrl = whatsappUrl();

function InstagramIcon() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" fill="#fff" aria-hidden="true">
      <path d="M20.4 5.2h-8.8A6.4 6.4 0 0 0 5.2 11.6v8.8a6.4 6.4 0 0 0 6.4 6.4h8.8a6.4 6.4 0 0 0 6.4-6.4v-8.8a6.4 6.4 0 0 0-6.4-6.4zm4.4 15.2a4.4 4.4 0 0 1-4.4 4.4h-8.8a4.4 4.4 0 0 1-4.4-4.4v-8.8a4.4 4.4 0 0 1 4.4-4.4h8.8a4.4 4.4 0 0 1 4.4 4.4v8.8zM16 10.9a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 8.2a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zm5.3-9.2c-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3 1.3-.6 1.3-1.3-.6-1.3-1.3-1.3z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" fill="#fff" aria-hidden="true">
      <path d="M22.3 26.4c-5 0-10.3-2.4-14.3-6.4s-6.4-9.3-6.4-14.3c0-1.2 1-2.2 2.2-2.2h2.9c1 0 1.9.7 2.1 1.7l.7 3.4c.2.8 0 1.6-.5 2.2L7.4 12.9c1.4 2.6 3.6 5.3 6.1 7.1l.1-.1 2.5-1.6c.6-.4 1.4-.5 2.1-.3l3.6.9c1 .3 1.8 1.3 1.8 2.4v2.8c0 1.2-1 2.2-2.2 2.2z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" fill="#fff" aria-hidden="true">
      <path d="M16 3.2a8.8 8.8 0 0 0-8.8 8.8c0 6.6 8.8 16.8 8.8 16.8s8.8-10.2 8.8-16.8A8.8 8.8 0 0 0 16 3.2zm0 11.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2z" />
    </svg>
  );
}

export default function FloatingActions() {
  return (
    <div className="float-actions">
      <a
        href={mapDirectionsUrl}
        target="_blank"
        rel="noreferrer"
        className="float-btn float-btn--maps"
        aria-label={`Get directions to ${BRAND.name}`}
      >
        <span className="float-btn__icon">
          <MapIcon />
        </span>
        <span className="float-btn__label">Get directions</span>
      </a>
      <a
        href={BRAND.instagramUrl}
        target="_blank"
        rel="noreferrer"
        className="float-btn float-btn--instagram"
        aria-label={`${BRAND.name} on Instagram`}
      >
        <span className="float-btn__icon">
          <InstagramIcon />
        </span>
        <span className="float-btn__label">Follow on Instagram</span>
      </a>
      <a
        href={BRAND.phoneUrl}
        className="float-btn float-btn--phone"
        aria-label={`Call ${BRAND.name} at ${BRAND.phoneDisplay}`}
      >
        <span className="float-btn__icon">
          <PhoneIcon />
        </span>
        <span className="float-btn__label">Call us</span>
      </a>
      <a
        href={chatUrl}
        target="_blank"
        rel="noreferrer"
        className="float-btn float-btn--whatsapp"
        aria-label={`Chat with ${BRAND.name} on WhatsApp`}
      >
        <span className="float-btn__ring" aria-hidden="true" />
        <span className="float-btn__icon">
          <svg viewBox="0 0 32 32" width="30" height="30" fill="#fff" aria-hidden="true">
            <path d="M16.04 5.2c-5.9 0-10.7 4.75-10.7 10.6 0 1.87.5 3.68 1.43 5.27L5.6 26.8l5.95-1.56a10.6 10.6 0 0 0 4.49.97h.01c5.9 0 10.7-4.75 10.7-10.6S21.94 5.2 16.04 5.2zm0 19.3a8.77 8.77 0 0 1-4.48-1.23l-.32-.19-3.53.93.94-3.44-.21-.33a8.73 8.73 0 0 1-1.34-4.66c0-4.83 3.97-8.77 8.95-8.77 4.97 0 8.95 3.94 8.95 8.77s-3.98 8.77-8.96 8.77zm4.9-6.56c-.27-.13-1.59-.78-1.84-.87-.25-.09-.43-.13-.61.13-.18.26-.7.87-.86 1.05-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.6-1.5-1.87-.16-.26-.02-.41.12-.54.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.13-.61-1.46-.83-2-.22-.52-.44-.45-.61-.46h-.52c-.18 0-.47.07-.72.34-.25.27-.94.92-.94 2.24 0 1.32.96 2.6 1.1 2.78.13.18 1.88 2.88 4.58 4.04.64.28 1.14.44 1.53.56.64.21 1.23.18 1.69.11.52-.08 1.59-.65 1.81-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.3z" />
          </svg>
        </span>
        <span className="float-btn__label">Chat with us</span>
      </a>
    </div>
  );
}