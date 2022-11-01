// this is the model we will be using in the store
Ext.define('SubscriptionDetail', {
  extend: 'Ext.data.Model',
  fields: [
    { name: 'subscriptionId', type: 'int' },
    { name: 'amount', type: 'int' },
    { name: 'subscriptionDate', type: 'date' },
  ],
});

// note how we set the 'root' in the reader to match the data structure above
var storeSubscriptionDetail = Ext.create('Ext.data.Store', {
  autoLoad: true,
  model: 'SubscriptionDetail',
  data: [
    {
      subscriptionId: 811,
      amount: 75000,
      subscriptionDate: '1970-04-30T11:05:38.000Z',
    },
    {
      subscriptionId: 811,
      amount: 300000,
      subscriptionDate: '2002-02-09T15:33:16.000Z',
    },
    {
      subscriptionId: 811,
      amount: 50000,
      subscriptionDate: '1947-12-12T05:23:26.000Z',
    },
  ],
  proxy: {
    type: 'memory',
    reader: {
      type: 'json',
    },
  },
});

var subscriptionForm = Ext.create('Ext.form.Panel', {
  id: 'subscriptionForm',
  bodyStyle: 'background:transparent',
  title: 'Thông tin đăng kí',
  icon: 'https://icons.iconarchive.com/icons/hopstarter/sleek-xp-basic/16/Document-Write-icon.png',
  bodyPadding: 15,
  width: 500,
  height: 500,
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
    editable: false,
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
      name: 'totalAmount',
    },
    {
      fieldLabel: 'Số ngày',
      name: 'totalDay',
      editable: false,
    },
    {
      xtype: 'datefield',
      fieldLabel: 'Ngày đăng kí',
      name: 'subscriptionDate',
      format: 'd/m/Y',
      disabled: true,
    },
    {
      xtype: 'datefield',
      fieldLabel: 'Ngày hết hạn',
      name: 'expiredDate',
      format: 'd/m/Y',
      disabled: true,
    },
    {
      fieldLabel: 'Trạng thái',
      name: 'status',
      editable: false,
    },
    {
      xtype: 'gridpanel',
      itemId: 'subscriptionDetailGrid',
      store: storeSubscriptionDetail,
      width: 500,
      height: 200,
      frame: false,
      header: false,
      tools: [
        {
          type: 'close',
          handler: () => domainGrid.setHidden(true),
        },
      ],
      plugins: ['cellediting'],
      plugins: [
        {
          ptype: 'cellediting',
          clicksToEdit: 1,
        },
      ],
      viewConfig: {
        loadMask: true,
      },
      listeners: {
        // beforeedit: function (editor, context) {},
        show: (grid) => {},
        hide: () => Ext.getCmp('gridWLs').setDisabled(false),
      },
      columns: [
        //new Ext.grid.RowNumberer({ dataIndex: 'no', text: 'No.', width: 60 }),
        {
          xtype: 'rownumberer',
          dataIndex: 'id',
          text: 'STT',
          width: 60,
        },
        {
          text: 'Số tiền',
          width: 100,
          dataIndex: 'amount',
          renderer: (v) => (v ? formatCash(v.toString()) + ' VND' : ''),
        },
        {
          text: 'Ngày đăng ký',
          width: 120,
          dataIndex: 'subscriptionDate',
          renderer: (v) => new Date(v).toLocaleDateString(),
        },
        {
          text: 'Ngày hết hạn',
          width: 120,
          dataIndex: 'expiredDate',
          renderer: (value, metaData, record) =>
            expiredDate(new Date(record.get('subscriptionDate'))),
        },
        {
          xtype: 'actioncolumn',
          text: 'Xóa',
          tooltip: 'Xóa đăng ký',
          width: 60,
          iconCls: 'deleteCls',
          handler: (grid, rowIndex, colIndex, item, e, record) => null,
        },
      ],
    },
  ],
  buttons: [
    {
      icon: 'https://icons.iconarchive.com/icons/custom-icon-design/flatastic-8/16/Refresh-icon.png',
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
