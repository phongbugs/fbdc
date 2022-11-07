var subscriptionAddForm = Ext.create('Ext.form.Panel', {
  id: 'subscriptionAddForm',
  bodyStyle: 'background:transparent',
  title: 'Subcription Info',
  icon: 'https://icons.iconarchive.com/icons/hopstarter/sleek-xp-basic/16/Document-Write-icon.png',
  bodyPadding: 15,
  width: 400,
  height: 250,
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
        subscriptionAddForm.hide();
        getCmp('#subscriptionGrid').enable();
        getCmp('#subscriptionGrid').getStore().reload();
      },
    },
  ],
  listeners: {
    hide: () => {
      getCmp('#subscriptionGrid').enable();
    },
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
      fieldLabel: 'Full Name',
      name: 'fullName',
      allowBlank: false,
      disabled: true,
    },
    {
      fieldLabel: 'Email',
      name: 'email',
      vtype: 'email',
      allowBlank: false,
      hideTrigger: true,
      keyNavEnabled: false,
      mouseWheelEnabled: false,
      disabled: true,
    },
    {
      xtype: 'combo',
      fieldLabel: 'Amount',
      width: 75,
      store: new Ext.data.ArrayStore({
        fields: ['amountValue', 'amountDisplay'],
        data: [
          [25000, '25.000 - 30 days'],
          [50000, '50.000 - 60 days'],
          [75000, '75.000 - 90 days'],
          [150000, '150.000 - 180 days'],
          [300000, '300.000 - 360 days'],
        ],
      }),
      displayField: 'amountDisplay',
      valueField: 'amountValue',
      name: 'cbbAmount',
      id: 'cbbAmount',
      value: 25000,
      editable: false,
      listeners: {
        change: (_, newValue) => {},
      },
    },

    {
      xtype: 'datefield',
      fieldLabel: 'Subcribe Date',
      name: 'subscriptionDate',
      format: 'd/m/Y',
      value: new Date(),
    },
  ],

  buttons: [
    {
      itemId: 'btnSubmitsubscriptionAddForm',
      icon: 'https://icons.iconarchive.com/icons/fatcow/farm-fresh/16/coins-add-icon.png',
      text: 'Add',
      formBind: true,
      disabled: false,
      handler: function () {
        var form = this.up('form').getForm();
        if (form.isValid()) {
          let button = this;
          button.setIconCls('spinner');
          button.disable();
          form.submit({
            url: hostAPI + '/subscription/create',
            method: 'POST',
            success: function (form, action) {
              if (!action.result.success)
                Ext.Msg.alert('Kểt Quả', action.result.message);
              else {
                let grid = Ext.getCmp('subscriptionGrid'),
                  store = grid.getStore();
                switch (subscriptionAddFormAction.name) {
                  case 'create':
                    // add new record
                    let r = action.result.data,
                      rIndex = store.getData().getCount();
                    store.insert(rIndex, r);
                    subscriptionAddForm.reset();
                    grid.getView().addRowCls(rIndex, 'success');
                    subscriptionAddForm.hide();
                    break;
                }
              }
              button.enable();
              button.setIconCls(subscriptionAddFormAction.icon);
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
