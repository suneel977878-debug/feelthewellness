'use client';
import React, { useMemo, use } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function SupportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const content = useMemo(() => {
    switch (slug) {
      case 'delivery':
        return {
          title: 'Discreet Delivery Guide',
          icon: '📦',
          body: `
            <h3>100% Privacy Guaranteed</h3>
            <p>Your privacy is our utmost priority. We understand the sensitive nature of our products, which is why every single order is shipped in plain, unmarked, and standard brown cardboard boxes or polymailers.</p>
            <ul>
              <li><strong>No Branding:</strong> There are no logos, brand names, or product descriptions anywhere on the outside of the package.</li>
              <li><strong>Discreet Billing:</strong> Your credit card or bank statement will show a discreet charge under "FTW Retail Solutions", not our website name.</li>
              <li><strong>Confidential Handling:</strong> Even the delivery courier will not know what is inside your package.</li>
            </ul>
            <p>Enjoy total peace of mind from checkout to delivery.</p>
          `
        };
      case 'returns':
        return {
          title: 'Return Policy (Hygiene Guaranteed)',
          icon: '🛡️',
          body: `
            <h3>Strict Hygiene Standards</h3>
            <p>Due to the intimate nature of our products and strict health and hygiene regulations, we cannot accept returns or exchanges on any opened or used items.</p>
            <ul>
              <li><strong>Defective Items:</strong> If you receive a defective or damaged product, please contact our Intimacy Experts within 48 hours of delivery for a free replacement.</li>
              <li><strong>Unopened Items:</strong> Unopened items in their original, sealed packaging may be returned within 7 days of delivery subject to a restocking fee.</li>
            </ul>
            <p>This policy guarantees that every item you purchase from FeelTheWellness is 100% brand new and hygienically safe.</p>
          `
        };
      case 'product-care':
        return {
          title: 'Product Care & Hygiene',
          icon: '✨',
          body: `
            <h3>Maximizing Pleasure & Lifespan</h3>
            <p>Taking care of your intimate toys is essential for your health and to ensure the longevity of the products.</p>
            <ul>
              <li><strong>Before First Use:</strong> Always clean your new toy with warm water and a specialized toy cleaner or mild antibacterial soap.</li>
              <li><strong>Silicone Toys:</strong> Only use water-based lubricants with silicone toys. Silicone-based lubricants will degrade the material.</li>
              <li><strong>Storage:</strong> Store your toys in a cool, dry place away from direct sunlight. Do not let silicone toys touch each other during storage, as they can melt together. Use the storage bags provided or wrap them in a lint-free cloth.</li>
              <li><strong>Waterproofing:</strong> Check your product's manual to confirm if it is splashproof, waterproof, or fully submersible before using it in the bath or shower.</li>
            </ul>
          `
        };
      case 'faq':
        return {
          title: 'Frequently Asked Questions',
          icon: '❓',
          body: `
            <h3>Answers to Common Questions</h3>
            <p><strong>Q: How long does delivery take?</strong><br>A: Standard delivery takes 2-3 business days. Expedited shipping is available at checkout.</p>
            <p><strong>Q: Is my personal information secure?</strong><br>A: Yes, we use industry-standard encryption. We never sell or share your personal data.</p>
            <p><strong>Q: Do you ship internationally?</strong><br>A: Currently, we only ship within the country to ensure the highest speed and discretion.</p>
            <p><strong>Q: What if I live with roommates or family?</strong><br>A: Our packages are completely unbranded. You can safely receive them without anyone knowing the contents.</p>
          `
        };
      case 'contact':
        return {
          title: 'Contact Intimacy Experts',
          icon: '💌',
          body: `
            <h3>We're Here to Help</h3>
            <p>Our dedicated team of Intimacy Experts is ready to assist you with product recommendations, order tracking, and any other inquiries you might have.</p>
            <ul>
              <li><strong>Email:</strong> support@feelthewellness.com</li>
              <li><strong>Phone:</strong> 1-800-WELLNESS (Available Mon-Fri, 9AM-6PM)</li>
              <li><strong>Live Chat:</strong> Click the chat icon in the bottom right corner of your screen during business hours.</li>
            </ul>
            <p>All communications are strictly confidential and handled with the utmost discretion and respect.</p>
          `
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: '🔒',
          body: `
            <h3>Your Data is Safe With Us</h3>
            <p>At FeelTheWellness, we take your privacy seriously. We only collect the minimum amount of data required to process and ship your orders.</p>
            <ul>
              <li><strong>Data Encryption:</strong> All transactions and personal details are encrypted using state-of-the-art SSL technology.</li>
              <li><strong>No Data Sharing:</strong> We will never sell, rent, or share your personal information with third-party marketing companies.</li>
              <li><strong>Discreet Billing & Shipping:</strong> As outlined in our delivery guide, all packages and billing statements are entirely discreet.</li>
            </ul>
            <p>By using our website, you consent to the collection and use of your information as described in this Privacy Policy.</p>
          `
        };
      case 'terms':
        return {
          title: 'Terms & Conditions',
          icon: '📜',
          body: `
            <h3>General Terms of Use</h3>
            <p>Welcome to FeelTheWellness. By accessing and using our website, you agree to comply with and be bound by the following terms and conditions.</p>
            <ul>
              <li><strong>Age Restriction:</strong> You must be 18 years of age or older to view, purchase, and interact with the content on this website.</li>
              <li><strong>Product Usage:</strong> Our products are sold as novelty items. Use them responsibly and strictly according to the provided instructions.</li>
              <li><strong>Order Cancellation:</strong> We reserve the right to cancel any order if fraudulent activity is suspected or if the item is out of stock.</li>
            </ul>
            <p>We reserve the right to update or modify these terms at any time without prior notice.</p>
          `
        };
      case 'disclaimer':
        return {
          title: 'Medical & Usage Disclaimer',
          icon: '⚠️',
          body: `
            <h3>Important Information</h3>
            <p>Please read this disclaimer carefully before purchasing or using any products from FeelTheWellness.</p>
            <ul>
              <li><strong>Not Medical Devices:</strong> The products sold on this website are novelty items and are not intended to diagnose, treat, cure, or prevent any medical condition or disease.</li>
              <li><strong>Consult a Physician:</strong> If you have any pre-existing medical conditions, are pregnant, or use a pacemaker, consult with a healthcare professional before using vibrating or electronic intimacy products.</li>
              <li><strong>Safe Usage:</strong> Always use products with the appropriate, recommended lubricants and clean them thoroughly before and after every use. Discontinue use immediately if you experience pain or severe discomfort.</li>
            </ul>
            <p>FeelTheWellness assumes no liability for the misuse of our products or any adverse reactions resulting from their use.</p>
          `
        };
      default:
        return {
          title: 'Support Center',
          icon: 'ℹ️',
          body: '<p>Welcome to the FeelTheWellness Support Center. Please select a topic from the footer menu.</p>'
        };
    }
  }, [slug]);

  return (
    <>
      <Header />
      <div className="support-page-layout">
        <div className="container">
          <div className="support-content-box">
            <div className="support-header">
              <span className="support-icon">{content.icon}</span>
              <h1 className="support-title">{content.title}</h1>
            </div>
          <div className="support-body" dangerouslySetInnerHTML={{ __html: content.body }}></div>
          
          <div className="support-footer">
            <Link href="/catalog" className="neon-btn-primary">Continue Exploring</Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .support-page-layout {
          min-height: 80vh;
          padding: 80px 0;
          background-color: var(--bg-primary);
          background-image: radial-gradient(circle at 50% 0%, rgba(255, 42, 133, 0.05) 0%, transparent 70%);
        }

        .support-content-box {
          max-width: 800px;
          margin: 0 auto;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 60px;
          box-shadow: var(--shadow-lg), 0 0 40px rgba(0,0,0,0.4);
          position: relative;
          overflow: hidden;
        }

        .support-content-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--neon-gradient);
        }

        .support-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid var(--border-light);
        }

        .support-icon {
          font-size: 3rem;
        }

        .support-title {
          font-size: 2.5rem;
          font-family: var(--font-serif);
          color: var(--text-primary);
          margin: 0;
        }

        .support-body {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1.1rem;
        }

        .support-body h3 {
          color: var(--text-primary);
          font-family: var(--font-serif);
          font-size: 1.5rem;
          margin-top: 30px;
          margin-bottom: 15px;
        }

        .support-body h3:first-child {
          margin-top: 0;
        }

        .support-body p {
          margin-bottom: 20px;
        }

        .support-body ul {
          list-style: none;
          padding: 0;
          margin-bottom: 30px;
        }

        .support-body li {
          position: relative;
          padding-left: 24px;
          margin-bottom: 15px;
        }

        .support-body li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--accent);
          font-size: 1.5rem;
          line-height: 1;
          top: -2px;
        }

        .support-body strong {
          color: var(--accent-light);
        }

        .support-footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 1px solid var(--border-light);
          text-align: center;
        }
          
        @media (max-width: 768px) {
          .support-content-box {
            padding: 30px 20px;
          }
          .support-header {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }
          .support-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
    <Footer />
    </>
  );
}
