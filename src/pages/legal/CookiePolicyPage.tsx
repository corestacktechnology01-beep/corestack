import LegalPage from './LegalPage';

const sections = [
  {
    heading: 'What Are Cookies?',
    body: 'Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, understand how visitors use the site, and improve overall performance.',
  },
  {
    heading: 'How We Use Cookies',
    body: 'We use cookies for essential site functionality, analytics, user preferences, and security. These tools help us understand which pages are most useful and how visitors navigate the website.',
  },
  {
    heading: 'Managing Cookies',
    body: 'You can control or disable cookies through your browser settings. Please note that blocking some cookies may impact the functionality of the website.',
  },
  {
    heading: 'Third-Party Cookies',
    body: 'Some analytics or embedded services may place cookies on your device. We only use trusted third-party tools and encourage you to review their privacy and cookie policies where applicable.',
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="This Cookie Policy explains how CoreStack Technology uses cookies and similar technologies on our website."
      sections={sections}
      icon="cookie"
    />
  );
}
