import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Sport Calendar Marker",
  description: "Privacy policy for Sport Calendar Marker",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: March 14, 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Overview</h2>
          <p>
            Sport Calendar Marker is a free tool that helps you add your favorite
            teams&apos; match schedules to your Google Calendar. We respect your
            privacy and are committed to protecting your personal data. This policy
            explains what data we access, how we use it, and your rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Google Calendar Access
          </h2>
          <p className="mb-3">
            Sport Calendar Marker uses the Google Calendar API to create and manage
            match events in your calendar. We request a single OAuth scope:
          </p>
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-3">
            https://www.googleapis.com/auth/calendar.events
          </div>
          <p>This scope allows the app to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Create calendar events for upcoming matches of teams you follow</li>
            <li>Delete previously synced events when you unfollow a team</li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> read your existing calendar events, access
            your contacts, read your emails, or access any other Google services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Data We Collect
          </h2>
          <p className="mb-3">
            Sport Calendar Marker collects and stores the minimum data necessary to
            function:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Google OAuth tokens</strong> — stored in secure, HTTP-only
              cookies in your browser. These are used to authenticate with Google
              Calendar on your behalf. We do not store these on any server or
              database.
            </li>
            <li>
              <strong>Team/player preferences</strong> — your selected sports, teams,
              and players are stored in your browser&apos;s local storage. This data
              never leaves your device.
            </li>
            <li>
              <strong>Calendar event IDs</strong> — we store IDs of events we create
              in your browser&apos;s local storage so we can update or remove them
              later.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Data We Do NOT Collect
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>We do not collect your name, email address, or Google profile information</li>
            <li>We do not use analytics, tracking cookies, or advertising pixels</li>
            <li>We do not store any data on external servers or databases</li>
            <li>We do not sell, share, or transfer any user data to third parties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Third-Party Services
          </h2>
          <p>We use the following third-party APIs solely to fetch sports schedule data:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>TheSportsDB</strong> — for football, basketball, and cricket
              match schedules
            </li>
            <li>
              <strong>AllSportsAPI</strong> — for tennis tournament fixtures
            </li>
          </ul>
          <p className="mt-3">
            No personal or user-identifying information is sent to these services.
            Only sport/league/team identifiers are used to fetch public schedule data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Data Retention &amp; Deletion
          </h2>
          <p>
            All data is stored locally in your browser. You can delete your data at
            any time by:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>Disconnecting Google Calendar</strong> — click the Google icon
              in the navbar and select &quot;Disconnect Google&quot; to revoke access
              and clear OAuth tokens
            </li>
            <li>
              <strong>Clearing browser data</strong> — clearing your browser&apos;s
              cookies and local storage will remove all app data
            </li>
            <li>
              <strong>Revoking access via Google</strong> — you can revoke the
              app&apos;s access at any time from your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Account permissions page
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Security
          </h2>
          <p>
            OAuth tokens are stored in HTTP-only, secure cookies that cannot be
            accessed by JavaScript. All communication with Google&apos;s APIs uses
            HTTPS encryption. No sensitive data is stored on any server — everything
            stays in your browser.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Children&apos;s Privacy
          </h2>
          <p>
            This app is not directed at children under 13. We do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be
            posted on this page with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at{" "}
            <a
              href="mailto:mayank.mund@gmail.com"
              className="text-blue-600 hover:underline"
            >
              mayank.mund@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
