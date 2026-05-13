import { useEffect } from "react";
import "./TermsOfUse.css";

function TermsOfUse({ onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="terms-modal" onClick={handleOverlayClick}>
      <div className="terms-modal__content">
        <button
          onClick={onClose}
          className="terms-modal__close"
          type="button"
          aria-label="Close"
        >
          ×
        </button>
        <h1 className="terms-modal__title">Terms of Use</h1>
        <div className="terms-modal__body">
          <p className="terms-modal__updated">Last Updated: May 2026</p>

          <p>
            Welcome to Printing Etc, LLC. By
            accessing or using our website and services, you agree to comply
            with and be bound by the following Terms of Use. Please read these
            terms carefully before placing an order or using our website.
          </p>

          <p>
            If you do not agree with these Terms of Use, please do not use our
            website or services.
          </p>

          <h2>1. Use of Website</h2>
          <p>
            By using this website, you confirm that you are at least 18 years
            old or have permission from a parent or legal guardian to use this
            site.
          </p>
          <p>
            You agree to use this website only for lawful purposes and in
            accordance with these Terms of Use.
          </p>
          <p>You may not:</p>
          <ul>
            <li>
              Use the website in any way that violates applicable laws or
              regulations
            </li>
            <li>
              Attempt to gain unauthorized access to our systems or servers
            </li>
            <li>Upload malicious software, viruses, or harmful code</li>
            <li>Use automated systems to scrape or copy website content</li>
            <li>Misrepresent your identity or payment information</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate access to users who
            violate these terms.
          </p>

          <h2>2. Orders & Payments</h2>
          <p>
            All orders placed through our website are subject to acceptance and
            availability.
          </p>
          <p>By submitting an order, you agree that:</p>
          <ul>
            <li>All information provided is accurate and complete</li>
            <li>You are authorized to use the payment method submitted</li>
            <li>
              You are responsible for reviewing all order details before
              checkout
            </li>
          </ul>
          <p>Orders are processed once payment is successfully received.</p>
          <p>
            We reserve the right to refuse or cancel orders at our discretion,
            including orders containing incorrect pricing, suspected fraud, or
            prohibited content.
          </p>

          <h2>3. Custom Printing & Final Sale Policy</h2>
          <p>
            Due to the custom nature of printed products, all sales are final
            once an order has been submitted.
          </p>
          <p>Customers are responsible for carefully reviewing:</p>
          <ul>
            <li>Artwork</li>
            <li>File uploads</li>
            <li>Sizing</li>
            <li>Spelling</li>
            <li>Design placement</li>
            <li>Product selections</li>
            <li>Shipping information</li>
          </ul>
          <p>
            Cancellation requests submitted after an order has entered
            production may not be accommodated, and charges will still apply.
          </p>

          <h2>4. Production & Turnaround Times</h2>
          <p>
            Estimated production times are provided for convenience only and are
            not guaranteed unless explicitly stated.
          </p>
          <p>Standard production timelines:</p>
          <ul>
            <li>Standard Orders: 5–7 business days</li>
            <li>Custom Orders: 7–10 business days</li>
          </ul>
          <p>Production and shipping delays may occur due to:</p>
          <ul>
            <li>File issues</li>
            <li>Order volume</li>
            <li>Material availability</li>
            <li>Shipping carrier delays</li>
            <li>Holidays or unforeseen circumstances</li>
          </ul>
          <p>
            Rush services may be available for select products. Please contact
            us directly for availability.
          </p>

          <h2>5. Customer Files & Intellectual Property</h2>
          <p>
            You retain ownership of all artwork and content you upload to our
            website.
          </p>
          <p>By submitting files to us, you confirm that:</p>
          <ul>
            <li>You own the rights to the content, or</li>
            <li>You have permission to reproduce and print the content</li>
          </ul>
          <p>You may not upload content that:</p>
          <ul>
            <li>Violates copyrights or trademarks</li>
            <li>Contains unlawful, offensive, or harmful material</li>
            <li>Infringes on the rights of third parties</li>
          </ul>
          <p>
            We reserve the right to reject any order containing prohibited
            content.
          </p>
          <p>
            You grant us permission to use submitted files solely for the
            purpose of fulfilling your order.
          </p>

          <h2>6. Color Accuracy & Print Variations</h2>
          <p>
            Printed products may vary slightly from digital proofs or screen
            displays due to:
          </p>
          <ul>
            <li>Monitor differences</li>
            <li>Ink variations</li>
            <li>Material types</li>
            <li>Printing processes</li>
          </ul>
          <p>
            Minor variations in color, trimming, alignment, or placement are
            considered acceptable industry tolerances and do not qualify as
            defects.
          </p>

          <h2>7. Shipping & Delivery</h2>
          <p>
            Shipping timelines are estimates provided by shipping carriers and
            are not guaranteed.
          </p>
          <p>We are not responsible for delays caused by:</p>
          <ul>
            <li>Shipping carriers</li>
            <li>Weather conditions</li>
            <li>Incorrect shipping addresses</li>
            <li>Lost or stolen packages after delivery confirmation</li>
          </ul>
          <p>
            Customers are responsible for providing accurate shipping
            information at checkout.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Printing Etc, LLC shall not
            be liable for:
          </p>
          <ul>
            <li>Indirect or consequential damages</li>
            <li>Lost profits or business interruption</li>
            <li>Delays in production or shipping</li>
            <li>Errors approved by the customer before printing</li>
          </ul>
          <p>
            Our maximum liability for any claim related to an order shall not
            exceed the amount paid for the product or service in question.
          </p>

          <h2>9. Website Content & Intellectual Property</h2>
          <p>
            All website content including logos, graphics, product descriptions,
            customer work, and designs are the property of Printing Etc, LLC and may
            not be copied, reproduced, or distributed without written
            permission.
          </p>

          <h3>Product Image Disclaimer</h3>
          <p>
            Product images displayed on this website are for illustrative and
            example purposes only. Certain mockups, sample designs, and preview
            images may include third-party artwork, stock imagery, or
            customer-provided examples used to demonstrate print products and
            capabilities. All trademarks, logos, and copyrighted materials shown
            remain the property of their respective owners. If you believe any
            content displayed on this website infringes upon your copyright or
            intellectual property rights, please contact us and we will promptly
            review and address the matter.
          </p>

          <h2>10. Privacy</h2>
          <p>
            Your use of this website is also governed by our Privacy Policy.
          </p>
          <p>
            We are committed to protecting your personal information and
            processing it responsibly.
          </p>

          <h2>11. Changes to These Terms</h2>
          <p>
            We reserve the right to update or modify these Terms of Use at any
            time without prior notice.
          </p>
          <p>Changes become effective immediately upon posting to this page.</p>
          <p>
            Your continued use of the website constitutes acceptance of the
            updated terms.
          </p>

          <h2>12. Contact Information</h2>
          <p>
            If you have questions regarding these Terms of Use, please contact
            us:
          </p>
          <div className="terms-modal__contact">
            <p>
              <strong>Printing Etc, LLC</strong>
            </p>
            <p>Phone: (661) 272-2869</p>
            <p>
              Email: avprintingetc@gmail.com
            </p>
            <p>1747 E Ave Q Ste B2</p>
            <p>Palmdale, CA 93550</p>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfUse;
