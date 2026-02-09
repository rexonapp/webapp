import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  fullName: string;
  email: string;
  city: string;
}

export const WelcomeEmail = ({
  fullName = 'Valued Customer',
  email = 'customer@example.com',
  city = 'Your City',
}: WelcomeEmailProps) => {
  const previewText = `Welcome to Rexon - Let's find your dream property!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Row>
              <Column>
                <Heading style={headerTitle}>REXON</Heading>
              </Column>
            </Row>
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Heading style={heroHeading}>
              Welcome to Rexon! 🎉
            </Heading>
            <Text style={heroText}>
              We're thrilled to have you on board, {fullName}!
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={paragraph}>
              Thank you for registering with Rexon. You've taken the first step 
              towards finding your perfect property, and we're here to guide you 
              every step of the way.
            </Text>

            {/* Account Details Card */}
            <Section style={accountCard}>
              <Heading style={cardHeading}>Your Account Details</Heading>
              <Hr style={divider} />
              <Row style={detailRow}>
                <Column style={detailLabel}>Name:</Column>
                <Column style={detailValue}>{fullName}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>Email:</Column>
                <Column style={detailValue}>{email}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>City:</Column>
                <Column style={detailValue}>{city}</Column>
              </Row>
            </Section>

            {/* What's Next Section */}
            <Heading style={sectionHeading}>What's Next?</Heading>
            <Section style={featureList}>
              <Row style={featureRow}>
                <Column style={featureIcon}>🏠</Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Browse Properties</Text>
                  <Text style={featureDescription}>
                    Explore our extensive collection of properties tailored to your preferences
                  </Text>
                </Column>
              </Row>

              <Row style={featureRow}>
                <Column style={featureIcon}>🔔</Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Get Notifications</Text>
                  <Text style={featureDescription}>
                    Receive instant updates about new properties matching your criteria
                  </Text>
                </Column>
              </Row>

              <Row style={featureRow}>
                <Column style={featureIcon}>💼</Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Expert Assistance</Text>
                  <Text style={featureDescription}>
                    Our team of property experts is ready to help you find your dream home
                  </Text>
                </Column>
              </Row>

              <Row style={featureRow}>
                <Column style={featureIcon}>📊</Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Market Insights</Text>
                  <Text style={featureDescription}>
                    Stay informed with the latest market trends and property valuations
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Link href="https://yourwebsite.com" style={button}>
                Start Exploring Properties
              </Link>
            </Section>

            {/* Help Section */}
            <Section style={helpSection}>
              <Text style={helpText}>
                <strong>Need help getting started?</strong>
              </Text>
              <Text style={helpText}>
                Our support team is here for you 24/7. Feel free to reach out at{' '}
                <Link href="mailto:support@rexon.com" style={link}>
                  support@rexon.com
                </Link>{' '}
                or call us at{' '}
                <Link href="tel:+911234567890" style={link}>
                  +91 123 456 7890
                </Link>
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerDivider} />
            <Text style={footerText}>
              © {new Date().getFullYear()} Rexon. All rights reserved.
            </Text>
            <Text style={footerText}>
              You're receiving this email because you registered at Rexon.
            </Text>
            <Row style={socialLinks}>
              <Column align="center">
                <Link href="#" style={socialLink}>Facebook</Link>
                {' • '}
                <Link href="#" style={socialLink}>Twitter</Link>
                {' • '}
                <Link href="#" style={socialLink}>Instagram</Link>
                {' • '}
                <Link href="#" style={socialLink}>LinkedIn</Link>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#dc2626',
  padding: '24px 40px',
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '2px',
};

const heroSection = {
  backgroundColor: '#fef2f2',
  padding: '40px 40px 30px',
  textAlign: 'center' as const,
};

const heroHeading = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  lineHeight: '1.2',
};

const heroText = {
  color: '#4b5563',
  fontSize: '18px',
  margin: '0',
  lineHeight: '1.5',
};

const content = {
  padding: '40px',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px',
};

const accountCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '32px',
  border: '1px solid #e5e7eb',
};

const cardHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '0 0 16px',
};

const detailRow = {
  marginBottom: '12px',
};

const detailLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  width: '100px',
};

const detailValue = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '400',
};

const sectionHeading = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  margin: '32px 0 20px',
};

const featureList = {
  marginBottom: '32px',
};

const featureRow = {
  marginBottom: '20px',
};

const featureIcon = {
  fontSize: '24px',
  width: '40px',
  verticalAlign: 'top',
};

const featureContent = {
  paddingLeft: '12px',
};

const featureTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
  lineHeight: '1.4',
};

const featureDescription = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.5',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '40px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  lineHeight: '1.5',
};

const helpSection = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '32px',
  border: '1px solid #fcd34d',
};

const helpText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px',
};

const link = {
  color: '#dc2626',
  textDecoration: 'underline',
};

const footer = {
  padding: '32px 40px',
  backgroundColor: '#f9fafb',
};

const footerDivider = {
  borderColor: '#e5e7eb',
  margin: '0 0 24px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const socialLinks = {
  marginTop: '16px',
};

const socialLink = {
  color: '#6b7280',
  fontSize: '12px',
  textDecoration: 'none',
};