import { Link } from 'react-router-dom';

function LegalShell({ title, children }) {
  return (
    <section className="legal section-pad">
      <div className="container legal__wrap">
        <Link to="/" className="legal__back">← Home</Link>
        <h1 className="legal__title">{title}</h1>
        <div className="legal__rule" aria-hidden="true" />
        <div className="legal__body">{children}</div>
      </div>
    </section>
  );
}

export function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      <p>
        Raajwarasa respects your privacy. This policy explains what information we collect
        when you use this website and how we use it.
      </p>
      <h2>Information we collect</h2>
      <p>
        When you submit an enquiry or contact form, we collect the details you provide —
        such as your name, email, phone number and message. We do not collect unnecessary
        personal information.
      </p>
      <h2>How we use it</h2>
      <p>
        We use your information solely to respond to your enquiry and, where relevant, to
        discuss a specific artifact. We do not sell or share your personal data with third
        parties for marketing.
      </p>
      <h2>Contact</h2>
      <p>
        For any privacy questions, please reach out through our contact page or Instagram.
      </p>
    </LegalShell>
  );
}

export function TermsPage() {
  return (
    <LegalShell title="Terms of Use">
      <p>
        By using this website you agree to the following terms.
      </p>
      <h2>Content</h2>
      <p>
        The artifacts and content displayed here are presented for informational and
        enquiry purposes. We do not misrepresent the history or provenance of objects.
      </p>
      <h2>Enquiries</h2>
      <p>
        Submitting an enquiry does not constitute a purchase. Availability, pricing and
        documentation are discussed personally with our team.
      </p>
      <h2>No warranties</h2>
      <p>
        While we aim to keep information accurate, we make no warranties about the
        completeness or accuracy of the content on this website.
      </p>
    </LegalShell>
  );
}