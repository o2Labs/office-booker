import React from 'react';
import { RouteComponentProps } from '@reach/router';

import Layout from '../Layout/Layout';

import HelpStyles from './Help.styles';

const Privacy: React.FC<RouteComponentProps> = () => (
  <Layout>
    <HelpStyles>
      <h3>Privacy Policy</h3>
      <p>
        Office Booker is operated by Our Company. This privacy policy will explain how we use the
        personal data we collect from you when you use our website.
      </p>
      <p>Topics:</p>
      <ul>
        <li>What data do we collect?</li>
        <li>How do we collect your data?</li>
        <li>How will we use your data?</li>
        <li>How do we store your data?</li>
        <li>Marketing</li>
        <li>What are your data protection rights?</li>
        <li>What are cookies?</li>
        <li>How do we use cookies?</li>
        <li>What types of cookies do we use?</li>
        <li>How to manage your cookies</li>
        <li>Privacy policies of other websites</li>
        <li>Changes to our privacy policy</li>
        <li>How to contact us</li>
        <li>How to contact the appropriate authorities</li>
      </ul>
      <h3>What data do we collect?</h3>
      <p>Our Company collects the following data:</p>
      <ul>
        <li>Authorisation information (your email address)</li>
        <li>Booking records (including your email address)</li>
        <li>Audit logs (containing every booking created or deleted)</li>
        <li>Access logs (including your email address)</li>
      </ul>
      <h3>How do we collect your data?</h3>
      <p>
        You directly provide Our Company with most of the data we collect. We collect data and
        process data when you:
      </p>
      <ul>
        <li>Log into the website.</li>
        <li>Make a booking to visit an office.</li>
        <li>Use or view our website.</li>
      </ul>
      <h3>How will we use your data?</h3>
      <p>Our Company collects your data so that we can:</p>
      <ul>
        <li>Verify you are an employee of Our Company.</li>
        <li>Verify you have approval to access a specific office on a specific day.</li>
        <li>Monitor the system for data corruption, unauthorised access or abuse.</li>
      </ul>
      <h3>How do we store your data?</h3>
      <p>Our Company securely stores your data on Amazon Web Services.</p>
      <p>
        Our Company permanently deletes all audit logs, access logs and bookings after after a
        maximum of 30 days.
      </p>
      <p>
        Our Company will keep your user profile (containing your email address) for the lifetime of
        the system to allow you to log back in. You can request your email address to be removed
        from the system by emailing admin@our-company.example
      </p>
      <h3>Marketing</h3>
      <p>We will not use your email address for any marketing purposes.</p>
      <h3>What are your data protection rights?</h3>
      <p>
        Our Company would like to make sure you are fully aware of all of your data protection
        rights. Every user is entitled to the following:
      </p>
      <p>
        <strong>The right to access</strong>&nbsp;&ndash; You have the right to request Our Company
        for copies of your personal data. We may charge you a small fee for this service.
      </p>
      <p>
        <strong>The right to rectification</strong>&nbsp;&ndash; You have the right to request that
        Our Company correct any information you believe is inaccurate. You also have the right to
        request Our Company to complete the information you believe is incomplete.
      </p>
      <p>
        <strong>The right to erasure</strong>&nbsp;&ndash; You have the right to request that Our
        Company erase your personal data, under certain conditions.
      </p>
      <p>
        <strong>The right to restrict processing</strong>&nbsp;&ndash; You have the right to request
        that Our Company restrict the processing of your personal data, under certain conditions.
      </p>
      <p>
        <strong>The right to object to processing</strong>&nbsp;&ndash; You have the right to object
        to Our Company&rsquo;s processing of your personal data, under certain conditions.
      </p>
      <p>
        <strong>The right to data portability</strong>&nbsp;&ndash; You have the right to request
        that Our Company transfer the data that we have collected to another organization, or
        directly to you, under certain conditions.
      </p>
      <p>
        If you make a request, we have one month to respond to you. If you would like to exercise
        any of these rights, please contact us at our email: admin@our-company.example
      </p>
      {/* <h3>Cookies</h3>
      <p>
        Cookies are text files placed on your computer to collect standard Internet log information
        and visitor behavior information. When you visit our websites, we may collect information
        from you automatically through cookies or similar technology
      </p>
      <p>For further information, visit allaboutcookies.org.</p>
      <h3>How do we use cookies?</h3>
      <p>
        Our Company uses cookies in a range of ways to improve your experience on our website,
        including:
      </p>
      <ul>
        <li>Keeping you signed in</li>
        <li>Understanding how you use our website</li>
        <li>[Add any uses your company has for cookies]</li>
      </ul>
      <h3>What types of cookies do we use?</h3>
      <p>There are a number of different types of cookies, however, our website uses:</p>
      <ul>
        <li>
          Functionality &ndash; Our Company uses these cookies so that we recognize you on our
          website and remember your previously selected preferences. These could include what
          language you prefer and location you are in. A mix of first-party and third-party cookies
          are used.
        </li>
        <li>
          Advertising &ndash; Our Company uses these cookies to collect information about your visit
          to our website, the content you viewed, the links you followed and information about your
          browser, device, and your IP address. Our Company sometimes shares some limited aspects of
          this data with third parties for advertising purposes. We may also share online data
          collected through cookies with our advertising partners. This means that when you visit
          another website, you may be shown advertising based on your browsing patterns on our
          website.
        </li>
        <li>[Add any other types of cookies your company uses]</li>
      </ul>
      <h3>How to manage cookies</h3>
      <p>
        You can set your browser not to accept cookies, and the above website tells you how to
        remove cookies from your browser. However, in a few cases, some of our website features may
        not function as a result.
      </p> */}
      <h3>Privacy policies of other websites</h3>
      <p>
        The Office Booker website contains links to other websites. Our privacy policy applies only
        to our website, so if you click on a link to another website, you should read their privacy
        policy.
      </p>
      <h3>Changes to our privacy policy</h3>
      <p>
        Our Company keeps its privacy policy under regular review and places any updates on this web
        page. This privacy policy was last updated on 1 July 2020.
      </p>
      <h3>How to contact us</h3>
      <p>
        If you have any questions about Our Company&rsquo;s privacy policy, the data we hold on you,
        or you would like to exercise one of your data protection rights, please do not hesitate to
        contact us.
      </p>
      <p>Email us at: admin@our-company.example</p>
      <h3>How to contact the appropriate authority</h3>
      <p>
        Should you wish to report a complaint or if you feel that Our Company has not addressed your
        concern in a satisfactory manner, you may contact the Information Commissioner&rsquo;s
        Office.
      </p>
      <p>Email: ico@our-company.example</p>
    </HelpStyles>
  </Layout>
);

export default Privacy;
