import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Html,
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
  const previewText = `Welcome to Rexon – Let's find your dream property!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* ── Header ── */}
          <Section style={header}>
            <Row>
              <Column style={{ verticalAlign: 'middle' }}>
                <Heading style={logoText}>REXON</Heading>
                <Text style={logoTagline}>Real Estate Excellence</Text>
              </Column>
              <Column style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                <Text style={headerBadge}>Premium Member</Text>
              </Column>
            </Row>
          </Section>

          {/* ── Accent bar ── */}
          <Section style={accentBar} />

          {/* ── Hero ── */}
          <Section style={heroSection}>
            <Text style={welcomeLabel}>WELCOME ABOARD</Text>
            <Heading style={heroHeading}>Hello, {fullName}!</Heading>
            <Text style={heroSubtext}>
              Your journey to finding the perfect property starts here. We're
              delighted to have you as part of the Rexon family.
            </Text>
          </Section>

          {/* ── Account Details ── */}
          <Section style={content}>
            <Section style={accountCard}>
              <Row>
                <Column style={cardAccentBar} />
                <Column style={{ paddingLeft: '20px' }}>
                  <Text style={cardLabel}>YOUR ACCOUNT</Text>
                  <Heading style={cardHeading}>Account Summary</Heading>
                </Column>
              </Row>
              <Hr style={divider} />
              <Row style={detailRow}>
                <Column style={detailLabel}>Full Name</Column>
                <Column style={detailValue}>{fullName}</Column>
              </Row>
              <Hr style={thinDivider} />
              <Row style={detailRow}>
                <Column style={detailLabel}>Email Address</Column>
                <Column style={detailValue}>{email}</Column>
              </Row>
              <Hr style={thinDivider} />
              <Row style={detailRow}>
                <Column style={detailLabel}>City</Column>
                <Column style={detailValue}>{city}</Column>
              </Row>
            </Section>

            {/* ── What's Next ── */}
            <Text style={sectionLabel}>WHAT YOU GET</Text>
            <Heading style={sectionHeading}>Everything You Need to Find Your Home</Heading>

            <Section style={featureGrid}>
              <Row style={featureRow}>
                <Column style={featureIconCol}>
                  <Section style={iconBox}>
                    <Text style={iconText}>🏠</Text>
                  </Section>
                </Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Curated Property Listings</Text>
                  <Text style={featureDescription}>
                    Access thousands of verified properties hand-picked to match
                    your exact preferences and budget.
                  </Text>
                </Column>
              </Row>

              <Row style={featureRow}>
                <Column style={featureIconCol}>
                  <Section style={iconBox}>
                    <Text style={iconText}>🔔</Text>
                  </Section>
                </Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Instant Property Alerts</Text>
                  <Text style={featureDescription}>
                    Be the first to know when a property matching your criteria
                    hits the market.
                  </Text>
                </Column>
              </Row>

              <Row style={featureRow}>
                <Column style={featureIconCol}>
                  <Section style={iconBox}>
                    <Text style={iconText}>💼</Text>
                  </Section>
                </Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Dedicated Expert Support</Text>
                  <Text style={featureDescription}>
                    Our experienced property advisors are available around the
                    clock to assist you.
                  </Text>
                </Column>
              </Row>

              <Row style={featureRow}>
                <Column style={featureIconCol}>
                  <Section style={iconBox}>
                    <Text style={iconText}>📊</Text>
                  </Section>
                </Column>
                <Column style={featureContent}>
                  <Text style={featureTitle}>Live Market Intelligence</Text>
                  <Text style={featureDescription}>
                    Make confident decisions with real-time pricing data and
                    neighbourhood insights.
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* ── CTA ── */}
            <Section style={ctaSection}>
              <Link href="https://rexonproperties.in" style={ctaButton}>
                Explore Properties Now →
              </Link>
              <Text style={ctaSubtext}>No credit card required · Free forever</Text>
            </Section>

            {/* ── Help ── */}
            <Section style={helpSection}>
              <Row>
                <Column style={helpIconCol}>
                  <Text style={helpIcon}>💬</Text>
                </Column>
                <Column>
                  <Text style={helpTitle}>Need Help Getting Started?</Text>
                  <Text style={helpBody}>
                    Our support team is available 24 / 7. Reach us at{' '}
                    <Link href="mailto:support@rexon.com" style={helpLink}>
                      support@rexon.com
                    </Link>{' '}
                    or call{' '}
                    <Link href="tel:+911234567890" style={helpLink}>
                      +91 123 456 7890
                    </Link>
                    .
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* ── Footer ── */}
          <Section style={footer}>
            <Hr style={footerDivider} />
            <Row style={socialRow}>
              <Column style={{ textAlign: 'center' }}>
                <Link href="#" style={socialLink}>Facebook</Link>
                {'  ·  '}
                <Link href="#" style={socialLink}>Twitter</Link>
                {'  ·  '}
                <Link href="#" style={socialLink}>Instagram</Link>
                {'  ·  '}
                <Link href="#" style={socialLink}>LinkedIn</Link>
              </Column>
            </Row>
            <Text style={footerText}>
              © {new Date().getFullYear()} Rexon Realty Pvt. Ltd. · All rights reserved.
            </Text>
            <Text style={footerText}>
              You received this email because you registered at Rexon.
            </Text>
            <Text style={footerUnsubscribe}>
              <Link href="#" style={unsubLink}>Unsubscribe</Link>
              {' · '}
              <Link href="#" style={unsubLink}>Privacy Policy</Link>
              {' · '}
              <Link href="#" style={unsubLink}>Terms of Service</Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */

const main = {
  backgroundColor: '#eef2f7',
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '32px auto',
  maxWidth: '620px',
  borderRadius: '4px',
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(30,58,120,0.10)',
};

/* Header */
const header = {
  backgroundColor: '#1d4ed8',  // blue-700
  padding: '28px 40px',
};

const logoText = {
  color: '#ffffff',
  fontSize: '26px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '4px',
  fontFamily: 'Georgia, serif',
};

const logoTagline = {
  color: '#93c5fd',  // blue-300
  fontSize: '11px',
  letterSpacing: '2px',
  margin: '4px 0 0',
  textTransform: 'uppercase' as const,
};

const headerBadge = {
  display: 'inline-block',
  backgroundColor: '#f97316',  // orange-500
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '1px',
  padding: '5px 12px',
  borderRadius: '20px',
  margin: '0',
};

/* Accent bar */
const accentBar = {
  backgroundColor: '#f97316',  // orange-500
  height: '4px',
  padding: '0',
  margin: '0',
};

/* Hero */
const heroSection = {
  backgroundColor: '#eff6ff',  // blue-50
  padding: '48px 48px 40px',
  textAlign: 'center' as const,
};

const welcomeLabel = {
  color: '#3b82f6',  // blue-500
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '3px',
  margin: '0 0 16px',
};

const heroHeading = {
  color: '#1e3a8a',  // blue-900
  fontSize: '34px',
  fontWeight: '700',
  margin: '0 0 16px',
  lineHeight: '1.2',
  fontFamily: 'Georgia, serif',
};

const heroSubtext = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0',
  maxWidth: '460px',
};

/* Content wrapper */
const content = {
  padding: '40px 48px',
};

/* Account card */
const accountCard = {
  backgroundColor: '#f8faff',
  borderRadius: '6px',
  padding: '28px 28px 20px',
  marginBottom: '40px',
  border: '1px solid #dbeafe',
};

const cardAccentBar = {
  backgroundColor: '#3b82f6',
  width: '4px',
  borderRadius: '4px',
};

const cardLabel = {
  color: '#3b82f6',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '0 0 4px',
};

const cardHeading = {
  color: '#1e3a8a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
  fontFamily: 'Georgia, serif',
};

const divider = {
  borderColor: '#dbeafe',
  margin: '20px 0 16px',
};

const thinDivider = {
  borderColor: '#eff6ff',
  margin: '10px 0',
};

const detailRow = {
  padding: '6px 0',
};

const detailLabel = {
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: '500',
  width: '140px',
};

const detailValue = {
  color: '#1e3a8a',
  fontSize: '13px',
  fontWeight: '600',
};

/* Section headings */
const sectionLabel = {
  color: '#3b82f6',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '3px',
  margin: '0 0 8px',
};

const sectionHeading = {
  color: '#1e3a8a',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 28px',
  fontFamily: 'Georgia, serif',
};

/* Features */
const featureGrid = {
  marginBottom: '8px',
};

const featureRow = {
  marginBottom: '20px',
};

const featureIconCol = {
  width: '52px',
  verticalAlign: 'top',
};

const iconBox = {
  backgroundColor: '#eff6ff',
  borderRadius: '10px',
  padding: '10px',
  width: '44px',
  textAlign: 'center' as const,
  border: '1px solid #dbeafe',
};

const iconText = {
  fontSize: '20px',
  margin: '0',
  lineHeight: '1',
};

const featureContent = {
  paddingLeft: '16px',
  verticalAlign: 'top',
};

const featureTitle = {
  color: '#1e3a8a',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 5px',
  lineHeight: '1.4',
};

const featureDescription = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0',
  lineHeight: '1.6',
};

/* CTA */
const ctaSection = {
  textAlign: 'center' as const,
  padding: '36px 0 8px',
};

const ctaButton = {
  backgroundColor: '#f97316',  // orange-500
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '16px 40px',
  letterSpacing: '0.5px',
};

const ctaSubtext = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '14px 0 0',
};

/* Help */
const helpSection = {
  backgroundColor: '#fffbf5',
  borderRadius: '6px',
  padding: '22px 24px',
  marginTop: '36px',
  border: '1px solid #fed7aa',  // orange-200
};

const helpIconCol = {
  width: '40px',
  verticalAlign: 'top',
};

const helpIcon = {
  fontSize: '22px',
  margin: '2px 0 0',
};

const helpTitle = {
  color: '#1e3a8a',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 6px',
};

const helpBody = {
  color: '#374151',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0',
};

const helpLink = {
  color: '#f97316',
  textDecoration: 'underline',
};

/* Footer */
const footer = {
  padding: '28px 48px 36px',
  backgroundColor: '#1e3a8a',  // blue-900
};

const footerDivider = {
  borderColor: '#2d4fa3',
  margin: '0 0 24px',
};

const socialRow = {
  marginBottom: '16px',
};

const socialLink = {
  color: '#93c5fd',  // blue-300
  fontSize: '12px',
  textDecoration: 'none',
};

const footerText = {
  color: '#93c5fd',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0 0 4px',
  textAlign: 'center' as const,
};

const footerUnsubscribe = {
  color: '#60a5fa',
  fontSize: '11px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
};

const unsubLink = {
  color: '#60a5fa',
  textDecoration: 'none',
};