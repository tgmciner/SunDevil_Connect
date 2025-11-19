// Adapter over hypothetical email / push providers.
// For Phase III we just log, but structure matches Adapter pattern.

class NotifierAdapter {
  async sendAnnouncementNotification({ clubId, text }) {
    // In the future this could call SendGrid / SMTP etc.
    console.log(
      `[NotifierAdapter] Announcement notification -> club ${clubId}: ${text}`
    );
  }

  async sendMembershipApprovedNotification({ userEmail, clubName }) {
    console.log(
      `[NotifierAdapter] Membership approved -> ${userEmail} for club ${clubName}`
    );
  }
}

module.exports = new NotifierAdapter();
