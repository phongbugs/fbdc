var subscriptionForm = Ext.create('Ext.form.Panel', {
  id: 'subscriptionForm',
  bodyStyle: 'background:transparent',
  title: 'Thông tin đăng kí',
  icon:
    'https://icons.iconarchive.com/icons/hopstarter/sleek-xp-basic/16/Document-Write-icon.png',
  bodyPadding: 15,
  width: 450,
  layout: 'anchor',
  defaults: {
    anchor: '100%',
  },
  style: {
    position: 'absolute',
    top: '100px',
    left: '100px',
    right: '50%',
    zIndex: 999,
  },
  frame: true,
  hidden: true,
  draggable: true,
  layout: 'anchor',
  defaults: {
    anchor: '100%',
  },
  tools: [
    {
      type: 'close',
      handler: () => {
        subscriptionForm.hide();
        getCmp('#subscriptionGrid').enable();
      },
    },
  ],
  listeners: {
    hide: () => getCmp('#subscriptionGrid').enable(),
    show: () =>
      Ext.getCmp('btnSubmitsubscriptionForm').setIconCls(
        subscriptionFormAction.iconCls
      ),
  },
  defaultType: 'textfield',
  defaultStyle: {
    height: '50px',
  },
  items: [
    {
      xtype: 'hiddenfield',
      name: 'id',
      allowBlank: false,
    },
    {
      fieldLabel: 'Tên',
      name: 'fullName',
      allowBlank: false,
    },
    {
      fieldLabel: 'Email',
      name: 'email',
      vtype: 'email',
      allowBlank: false,
      hideTrigger: true,
      keyNavEnabled: false,
      mouseWheelEnabled: false,
    },
    {
      fieldLabel: 'Số tiền',
      name: 'amount',
      allowBlank: false,
    },
    {
      //xtype: 'datefield',
      fieldLabel: 'Ngày đăng kí',
      name: 'subscriptionDate',
      allowBlank: false,
      //value: new Date(),
      format: 'd/m/Y',
      disabled:true
    },
    {
      xtype: 'datefield',
      fieldLabel: 'Ngày hết hạn',
      name: 'expiredDate',
      allowBlank: false,
      //value: new Date(),
      format: 'd/m/Y',
      disabled:true
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
      id: 'btnResetsubscriptionForm',
    },
    {
      id: 'btnSubmitsubscriptionForm',
      text: subscriptionFormAction.label,
      formBind: true,
      disabled: false,
      handler: function () {
        var form = this.up('form').getForm();
        if (form.isValid()) {
          let button = this;
          button.setIconCls('spinner');
          button.disable();
          form.submit({
            url: hostAPI + '/subscription/' + subscriptionFormAction.name,
            method: subscriptionFormAction.method,
            success: function (form, action) {
              if (!action.result.success)
                Ext.Msg.alert('Kểt Quả', action.result.message);
              else {
                let grid = Ext.getCmp('subscriptionGrid'),
                  store = grid.getStore();
                switch (subscriptionFormAction.name) {
                  case 'create':
                    // add new record
                    let r = action.result.data,
                      rIndex = store.getData().getCount();
                    // fix bind new r(just added) to form
                    //r.re_examination_date = r.re_examination_date.substr(0, 10);
                    //r.gender = +r.gender;
                    store.insert(rIndex, r);
                    subscriptionForm.reset();
                    grid.getView().addRowCls(rIndex, 'success');
                    subscriptionForm.hide();
                    break;
                  case 'update':
                    let record = form.getValues();
                    log(record);
                    var removedRecord = store.findRecord('id', record.id);
                    var recordIndex = store.indexOf(removedRecord);
                    store.remove(removedRecord);
                    store.insert(recordIndex, record);
                    grid.getView().addRowCls(recordIndex, 'success');
                    subscriptionForm.hide();
                    break;
                }
              }
              button.enable();
              button.setIconCls(subscriptionFormAction.icon);
            },
            failure: function (form, action) {
              Ext.Msg.alert('Thông báo', action.result.message);
              button.setIconCls('update');
              button.enable();
            },
          });
        }
      },
    },
  ],
  renderTo: Ext.getBody(),
});
