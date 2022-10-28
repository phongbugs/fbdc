let changePWDFormAction = {
  icon:
    '',
};
Ext.onReady(() => {
  var loginForm = Ext.create('Ext.Panel', {
    id: 'loginForm',
    layout: 'center',
    border: false,
    bodyStyle: 'background:transparent',
    bodyPadding: '50%',
    renderTo: 'app',
    items: [
      {
        xtype: 'form',
        bodyStyle: 'background:transparent',
        title: 'Input password',
        bodyPadding: 15,
        width: 240,
        url: hostAPI + '/user/login',
        layout: 'anchor',
        frame: true,
        defaults: {
          anchor: '100%',
        },
        iconCls: 'login-form-title',
        listeners: {
          afterrender: () => {
            var loading = document.getElementById('loading');
            loading.classList.remove('spinner');
            loadScript('js/changePWDForm.js');
          },
        },
        defaultType: 'textfield',
        items: [
          {
            inputType: 'password',
            placeholder: 'password',
            name: 'password',
            allowBlank: false,
          },
        ],
        buttons: [
          {
            text: 'Change Password',
            iconCls: 'change-password-btn',
            handler: function () {
              Ext.getCmp('loginForm').hide();
              Ext.getCmp('changePWDForm').show();
            },
          },
          {
            text: 'Login',
            formBind: true,
            disabled: true,
            iconCls: 'login-btn',
            handler: function () {
              
              let me = this;
              var form = this.up('form').getForm();
              me.setIconCls('spinner');
              me.disable();
              if (form.isValid()) {
                form.submit({
                  success: function (form, action) {
                    if (!action.result.success) {
                      Ext.Msg.alert('Login Failed', action.result.message);
                      me.enable();
                    } else {
                      //let authToken = action.result.authToken;
                      //localStorage.setItem('authToken', authToken);
                      document.getElementById('app').innerHTML = '';
                      me.setIconCls('login-btn');
                      me.enable();
                      loadScript('js/index.js');
                    }
                  },
                  failure: function (form, action) {
                    me.setIconCls('login-btn');
                    me.enable();
                    Ext.Msg.alert('Failed', action.result.message);
                  },
                });
              }
            },
          },
        ],
      },
    ],
  });
});
