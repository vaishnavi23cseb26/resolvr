let ioRef = null;

function initSocket(io) {
  ioRef = io;
}

function emitToUser(userId, event, payload) {
  if (!ioRef) return;
  ioRef.to(String(userId)).emit(event, payload);
}

module.exports = { initSocket, emitToUser };

