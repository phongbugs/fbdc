var customerForm = Ext.create('Ext.form.Panel', {
  id: 'customerForm',
  bodyStyle: 'background:transparent',
  title: 'Thông tin người dùng',
  icon: 'https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/16/User-blue-icon.png',
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
        customerForm.hide();
        getCmp('#customerGrid').enable();
      },
    },
  ],
  listeners: {
    hide: () => getCmp('#customerGrid').enable(),
    show: () =>
      Ext.getCmp('btnSubmitCustomerForm').setIconCls(
        customerFormAction.iconCls
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
      fieldLabel: 'Số điện thoại',
      name: 'phone',
      allowBlank: false,
      hideTrigger: true,
      keyNavEnabled: false,
      mouseWheelEnabled: false,
    },
    // {
    //   xtype: 'datefield',
    //   fieldLabel: 'Ngày hết hạn',
    //   name: 'expiredDate',
    //   allowBlank: false,
    //   value: new Date(),
    //   format: 'd/m/Y',
    //   disabled:true
    // },
    // {
    //   xtype: 'numberfield',
    //   fieldLabel: 'Năm sinh',
    //   name: 'birthday',
    //   allowBlank: false,
    //   minValue: 1930,
    //   maxValue: 2022,
    // },
    // {
    //   fieldLabel: 'Giới tính',
    //   name: 'gender',
    //   allowBlank: false,
    //   xtype: 'combo',
    //   width: 150,
    //   editable: false,
    //   store: new Ext.data.ArrayStore({
    //     fields: ['id', 'name'],
    //     data: [
    //       [1, 'Nam'],
    //       [0, 'Nữ'],
    //     ],
    //   }),
    //   displayField: 'name',
    //   valueField: 'id',
    //   value: 1,
    //   queryMode: 'local',
    // },
    // {
    //   fieldLabel: 'Nghề nghiệp',
    //   name: 'career',
    //   allowBlank: false,
    // },
    // {
    //   fieldLabel: 'Địa chỉ',
    //   name: 'address',
    //   allowBlank: false,
    // },

    // {
    //   xtype: 'numberfield',
    //   fieldLabel: 'Khám thường niên',
    //   name: 'annual_examination',
    //   allowBlank: false,
    //   minValue: 0,
    //   maxValue: 10,
    //   //regex: /^([1-9]|1[0-9]):([0-5][0-9])(\s[a|p]m)$/i,
    //   maskRe: /[\d\s:amp]/i,
    //   msgTarget: 'under',
    //   invalidText: 'Khám thường niên 0-10',
    // },
    // {
    //   fieldLabel: 'Ghi chú',
    //   name: 'note',
    //   allowBlank: true,
    // },
  ],
  buttons: [
    {
      icon: 'https://icons.iconarchive.com/icons/custom-icon-design/flatastic-8/16/Refresh-icon.png',
      text: 'Refresh',
      handler: function () {
        this.up('form').getForm().reset();
      },
      id: 'btnResetCustomerForm',
    },
    {
      id: 'btnSubmitCustomerForm',
      text: customerFormAction.label,
      formBind: true,
      disabled: false,
      handler: function () {
        var form = this.up('form').getForm();
        if (form.isValid()) {
          let button = this;
          button.setIconCls('spinner');
          button.disable();
          form.submit({
            url: hostAPI + '/customer/' + customerFormAction.name,
            method: customerFormAction.method,
            success: function (form, action) {
              if (!action.result.success)
                Ext.Msg.alert('Kểt Quả', action.result.message);
              else {
                let grid = getCmp('#customerGrid'),
                  store = grid.getStore();
                switch (customerFormAction.name) {
                  case 'create':
                    // add new record
                    let r = action.result.data,
                      rIndex = store.getData().getCount();
                    // fix bind new r(just added) to form
                    //r.re_examination_date = r.re_examination_date.substr(0, 10);
                    //r.gender = +r.gender;
                    store.insert(rIndex, r);
                    customerForm.reset();
                    grid.getView().addRowCls(rIndex, 'success');
                    customerForm.hide();
                    break;
                  case 'update':
                    let record = form.getValues();
                    log(record);
                    var removedRecord = store.findRecord('id', record.id);
                    var recordIndex = store.indexOf(removedRecord);
                    store.remove(removedRecord);
                    store.insert(recordIndex, record);
                    grid.getView().addRowCls(recordIndex, 'success');
                    customerForm.hide();
                    break;
                }
              }
              button.enable();
              button.setIconCls(customerFormAction.icon);
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
  renderTo: 'app',
});
