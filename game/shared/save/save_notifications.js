const activeSaveNotifications = {
  saveStatus: null,
  storageFailure: null,
};

export function bindSaveNotifications(notifications = null) {
  activeSaveNotifications.saveStatus = notifications?.saveStatus || null;
  activeSaveNotifications.storageFailure = notifications?.storageFailure || null;
  return getSaveNotifications();
}

export function getSaveNotifications() {
  return {
    saveStatus: activeSaveNotifications.saveStatus,
    storageFailure: activeSaveNotifications.storageFailure,
  };
}
