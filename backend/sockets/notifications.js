// ---------------------------------------------------------------------------
// Module: backend/sockets/notifications.js
// Purpose: notifications
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const emitNotificationToUsers = (io, userIds, payload, options = {}) => {
  const uniqueUserIds = Array.from(
    new Set((Array.isArray(userIds) ? userIds : [userIds]).filter(Boolean).map((id) => String(id)))
  );

  uniqueUserIds.forEach((id) => {
    io.to(`user:${id}`).emit('notification', payload);
  });

  if (options.includeAdmins) {
    io.to('role:admin').emit('notification', payload);
  }
};

const emitRealtimeNotification = (req, payload, options = {}) => {
  try {
    const io = req.app.get('io');
    if (!io) return;
    emitNotificationToUsers(io, options.userIds, payload, options);
  } catch (_error) {
    // Ignore socket emission failures for non-critical notification flows.
  }
};

module.exports = {
  emitNotificationToUsers,
  emitRealtimeNotification,
};


