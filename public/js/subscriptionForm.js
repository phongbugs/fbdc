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
  ],
  proxy: {
    type: 'memory',
    reader: {
      type: 'json',
    },
  },
});
var getDayQuantity = (amount) => {
  var day = 0;
  switch (amount) {
    case 25000:
      day = 30;
      break;
    case 50000:
      day = 60;
      break;
    case 75000:
      day = 90;
      break;
    case 150000:
      day = 180;
      break;
    case 300000:
      day = 360;
      break;
  }
  return day;
};
var calcExpiredDate = (subscriptionDate, amount) => {
  var days = getDayQuantity(amount);
  return new Date(subscriptionDate.getTime() + days * 24 * 3600 * 1000);
};
var subscriptionForm = Ext.create('Ext.form.Panel', {
  id: 'subscriptionForm',
  bodyStyle: 'background:transparent',
  title: 'Subcription Info',
  icon: 'https://icons.iconarchive.com/icons/hopstarter/sleek-xp-basic/16/Document-Write-icon.png',
  bodyPadding: 15,
  width: 600,
  height: 450,
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
      editable: false,
    },
    {
      fieldLabel: 'Email',
      name: 'email',
      vtype: 'email',
      allowBlank: false,
      hideTrigger: true,
      keyNavEnabled: false,
      mouseWheelEnabled: false,
      editable: false,
    },
    {
      fieldLabel: 'Amount',
      name: 'totalAmount',
      editable: false,
    },
    {
      fieldLabel: "Day's Quantity",
      name: 'totalDay',
      editable: false,
    },
    {
      xtype: 'datefield',
      fieldLabel: 'Subscribe Date',
      name: 'subscriptionDate',
      format: 'd/m/Y',
      editable: false,
      readOnly: true,
    },
    {
      xtype: 'datefield',
      fieldLabel: 'Expired Date',
      name: 'expiredDate',
      format: 'd/m/Y',
      editable: false,
      readOnly: true,
    },
    // {
    //   fieldLabel: 'Status',
    //   name: 'status',
    //   itemId: 'txtStatus',
    //   editable: false,
    // },
    {
      xtype: 'component',
      id: 'statusBox',
      itemdId: 'statusBox',
      ariaLabel: '',
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
      viewConfig: {
        loadMask: true,
      },
      listeners: {
        // beforeedit: function (editor, context) {},
        show: (grid) => {},
        hide: () => null,
      },
      tbar: [
        {
          xtype: 'button',
          text: 'Add',
          itemId: '#btnAddSubscriptionDetail',
          icon: 'https://icons.iconarchive.com/icons/awicons/vista-artistic/16/coin-add-icon.png',
          listeners: {
            click: () => {
              storeSubscriptionDetail.clearFilter();
              storeSubscriptionDetail.reload();
            },
          },
        },
      ],
      columns: [
        {
          xtype: 'rownumberer',
          dataIndex: 'id',
          text: 'No',
          width: 52,
        },
        {
          text: 'Amount',
          width: 100,
          dataIndex: 'amount',
          renderer: (v) => (v ? formatCash(v.toString()) : ''),
        },
        {
          text: 'Days',
          width: 60,
          dataIndex: 'amount',
          renderer: (v) => (v ? getDayQuantity(v) : 0),
        },
        {
          text: 'Subscribe Date',
          width: 120,
          dataIndex: 'subscriptionDate',
          renderer: (v) => new Date(v).toLocaleDateString(),
        },
        {
          text: 'Expired Date',
          width: 105,
          renderer: (value, metaData, record) =>
            calcExpiredDate(
              new Date(record.get('subscriptionDate')),
              record.get('amount')
            ).toLocaleDateString('vi-VN'),
        },
        {
          text: 'Status',
          width: 65,
          renderer: (value, metaData, record) => {
            try {
              let currentDate = new Date(),
                expiredDate = calcExpiredDate(
                  new Date(record.get('subscriptionDate')),
                  record.get('amount')
                );
              return expiredDate.getTime() - currentDate.getTime() < 0
                ? 'Expired'
                : 'Active';
            } catch (error) {
              log(error);
            }
          },
        },
        {
          xtype: 'actioncolumn',
          width: 45,
          tooltip: 'Xóa dòng này',
          align: 'center',
          text: 'Del',
          items: [
            {
              icon: actions.delete.icon,
              handler: function (grid, rowIndex, colIndex, item, e, record) {
                Ext.Msg.confirm(
                  'Xác nhận',
                  'Bạn muốn xóa đăng kí này ?',
                  (buttonId) => {
                    if (buttonId === 'yes') {
                      let store = grid.getStore();
                      var recordIndex = store.indexOf(record);
                      var id = grid.getStore().getAt(recordIndex).get('id');
                      Ext.Ajax.request({
                        method: 'DELETE',
                        url: hostAPI + '/subscription-detail/delete/' + id,
                        success: function (response) {
                          store.removeAt(recordIndex);
                          getCmp('#subscriptionGrid').getStore().load();
                        },
                        failure: function (response) {
                          alert(JSON.stringify(response));
                        },
                      });
                    }
                  }
                );
              },
            },
          ],
        },
      ],
      viewConfig: {
        getRowClass: function (record, index, rowParams) {
          // var currentDate = new Date(),
          //   expiredDate = calcExpiredDate(
          //     new Date(record.get('subscriptionDate')),
          //     record.get('amount')
          //   );
          let isExpired = isExpiredDate(
            record.get('subscriptionDate'),
            record.get('amount')
          );
          return isExpired ? 'expiredSubscriptionDetail' : 'active';
        },
      },
    },
  ],
  renderTo: Ext.getBody(),
});
