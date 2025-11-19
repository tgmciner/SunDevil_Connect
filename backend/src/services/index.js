const eventBus = require('./eventBus');
const notifier = require('./notifierAdapter');

// Observer wiring:
// When an announcement is created, notify users (logged for now).
eventBus.subscribe('announcement.created', async (announcement) => {
  await notifier.sendAnnouncementNotification(announcement);
});

// When a membership is approved, notify student.
eventBus.subscribe('membership.approved', async (info) => {
  await notifier.sendMembershipApprovedNotification(info);
});

module.exports = { eventBus };
