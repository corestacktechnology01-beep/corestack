import LegalPage from './LegalPage';

const sections = [
  {
    heading: 'Acceptance of Terms',
    body: 'By accessing or using our website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should not continue using the site.',
  },
  {
    heading: 'Use of the Website',
    body: 'You agree to use the website only for lawful purposes and not to interfere with its operation, security, or availability. You must not upload harmful content or attempt to disrupt our systems.',
  },
  {
    heading: 'Intellectual Property',
    body: 'All content, branding, designs, text, graphics, software, and other materials on this website are owned by CoreStack Technology or licensed to us unless otherwise stated. You may not copy, reuse, or distribute these materials without prior permission.',
  },
  {
    heading: 'Limitation of Liability',
    body: 'CoreStack Technology will not be liable for any indirect, incidental, or consequential damages arising from the use of our website or services, including loss of business, data, or profits.',
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These Terms of Service govern your use of the CoreStack Technology website and any services offered through it."
      sections={sections}
      icon="terms"
    />
  );
}
