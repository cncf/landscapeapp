document.addEventListener('DOMContentLoaded', function() {
  iFrameResize({
    log: false,
    onMessage : function(messageData){ // Callback fn when message is received
      if (messageData.message.type === 'showModal') {
        document.querySelector('body').style.overflow = 'hidden';
      }
      if (messageData.message.type === 'hideModal') {
        document.querySelector('body').style.overflow = 'auto';
      }
    },
  }, '#landscape');
});
