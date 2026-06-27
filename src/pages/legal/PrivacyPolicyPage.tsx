import LegalPage from './LegalPage';

const sections = [
  {
    heading: 'Information We Collect',
    body: 'We collect information you provide directly to us, such as your name, email address, company details, and any project or consultation request information submitted through our forms. We also collect usage data such as browser type, device information, and interaction patterns to improve our website experience.',
  },
  {
    heading: 'How We Use Your Information',
    body: 'Your information is used to respond to enquiries, provide services, manage projects, send updates, improve our website, and comply with legal obligations. We may also use your contact details to share relevant product or service updates if you have opted in.',
  },
  {
    heading: 'Data Security',
    body: 'We take reasonable technical and organizational measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no system can be guaranteed 100% secure.',
  },
  {
    heading: 'Your Choices',
    body: 'You may request access, correction, or deletion of your personal information by contacting us. You can also unsubscribe from marketing communications at any time using the links in our emails.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This Privacy Policy explains how CoreStack Technology collects, uses, stores, and protects your personal information when you interact with our website and services."
      sections={sections}
      icon="privacy"
    />
  );
}
