var changePWDForm = Ext.create('Ext.Panel', {
  id: 'changePWDForm',
  layout: 'center',
  border: false,
  bodyStyle: 'background:transparent',
  bodyPadding: '50%',
  hidden: true,
  items: [
    {
      xtype: 'form',
      bodyStyle: 'background:transparent',
      title: 'Thay đổi mật khẩu',
      icon: changePWDFormAction.icon,
      bodyPadding: 15,
      width: 350,
      layout: 'anchor',
      frame: true,
      defaults: {
        anchor: '100%',
      },
      tools: [
        {
          type: 'close',
          handler: () => {
            changePWDForm.hide();
            Ext.getCmp('loginForm').show();
          },
        },
      ],
      listeners: {
        hide: () => Ext.getCmp('loginForm').show(),
      },
      defaultType: 'textfield',
      defaultStyle: {
        height: '70px',
      },
      items: [
        {
          fieldLabel: 'Mật khẩu hiện tại',
          labelWidth: 130,
          inputType: 'password',
          name: 'password',
          allowBlank: false,
        },
        {
          fieldLabel: 'Mật khẩu mới',
          labelWidth: 130,
          inputType: 'password',
          name: 'newPassword',
          allowBlank: false,
        },
        {
          fieldLabel: 'Lập lại mật khẩu mới',
          labelWidth: 130,
          id: 'txt',
          inputType: 'password',
          name: 'newPasswordConfirm',
          allowBlank: false,
          //validator: () => {},
        },
      ],
      buttons: [
        {
          icon:
            'https://icons.iconarchive.com/icons/custom-icon-design/flatastic-8/16/Refresh-icon.png',
          text: 'Làm mới',
          handler: function () {
            this.up('form').getForm().reset();
          },
          id: 'btnResetChangePWDForm',
        },
        {
          id: 'btnSubmitChangePWDForm',
          text: 'Đổi mật khẩu',
          iconCls: 'change-password-btn',
          formBind: true,
          disabled: false,
          handler: function () {
            var form = this.up('form').getForm();
            if (form.isValid()) {
              let button = this;
              button.setIconCls('spinner');
              // compare password
              var newPassword = Ext.ComponentQuery.query(
                'textfield[name="newPassword"]'
              )[0].getValue();
              var newPasswordConfirm = Ext.ComponentQuery.query(
                'textfield[name="newPasswordConfirm"]'
              )[0].getValue();
              if (newPassword !== newPasswordConfirm) {
                Ext.Msg.alert('Thông báo', 'Mật khẩu không trùng khớp');
                button.setIconCls('change-password-btn');
                return;
              }
              form.submit({
                url: hostAPI + '/user/change-pwd',
                method: 'PUT',
                success: function (form, action) {
                  if (action.result.success) {
                    Ext.getCmp('loginForm').show();
                    changePWDForm.hide();
                  }
                  Ext.Msg.alert('Kểt Quả', action.result.message);
                  button.setIconCls('change-password-btn');
                },
                failure: function (form, action) {
                  log(action.result);
                  Ext.Msg.alert('Thông báo lỗi', action.result.message);
                  button.setIconCls('change-password-btn');
                },
              });
            }
          },
        },
      ],
    },
  ],
  renderTo: 'app',
});
