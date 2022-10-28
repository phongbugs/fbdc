function isLocalhost() {
  return (
    window.location.host.indexOf('localhost') > -1 ||
    window.location.host.indexOf('192.168.1.47') > -1
  );
}
let hostAPI = isLocalhost()
    ? 'http://localhost:6868'
    : 'https://' + window.location.host,
  log = console.log,
  loadScript = (pathScript) => {
    const script = document.createElement('script');
    script.src = pathScript;
    document.getElementsByTagName('body')[0].appendChild(script);
  },
  authenticate = (callback) => {
    Ext.Ajax.request({
      withCredentials: true,
      url: hostAPI + '/user/login/status',
      success: function (response) {
        let success = JSON.parse(response.responseText).success;
        if (success) callback(true);
        else callback(false);
      },
      failure: function (response) {
        Ext.Msg.alert('Error', '/login/status');
        log(response);
        callback(false);
      },
    });
  };
