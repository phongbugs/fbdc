// Global Variables
let Groups,
  data = [],
  featureGrouping = Ext.create('Ext.grid.feature.GroupingSummary', {
    startCollapsed: true,
    showSummaryRow: false,
    groupHeaderTpl: [
      '<div style="color:#d14836; font-weight: bold">{name:this.formatName}<span style="color:green; font-weight: normal"> ({rows.length} Bệnh nhân)</span></div>',
      {
        formatName: (name) => {
          for (let i = 0; i < Groups.items.length; i++) {
            if (name.toString() === Groups.items[i]._groupKey.toString()) {
              switch (name) {
              }
              return (
                '<span style="color:green">[' + (i + 1) + ']</span> ' + name
              );
            }
          }
        },
      },
    ],
  }),
  actions = {
    create: {
      name: 'create',
      label: 'Đăng ký mới',
      iconCls: 'add',
      method: 'POST',
      icon: 'https://icons.iconarchive.com/icons/icojam/blue-bits/16/user-add-icon.png',
    },
    update: {
      name: 'update',
      label: 'Cập nhật',
      iconCls: 'update',
      method: 'PUT',
      icon: 'https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-9/16/edit-file-icon.png',
    },
    delete: {
      name: 'delete',
      label: 'Xóa',
      icon: 'https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/16/Actions-edit-delete-icon.png',
    },
    find: { name: 'find', label: 'Tìm kiếm', icon: '' },
    logout: { name: 'logout', label: 'Đăng xuất', icon: '' },
  },
  customerFormAction = actions.create,
  getCmp = function (query) {
    return Ext.ComponentQuery.query(query)[0];
  };
Ext.onReady(function () {
  Ext.define('Subscription', {
    extend: 'Ext.data.Model',
    fields: [
      'id',
      'fullName',
      'email',
      'amount',
      'subscriptionDate',
      'expiredDate',
    ],
  });
  let storeCustomer = Ext.create('Ext.data.Store', {
    model: 'Subscription',
    proxy: {
      type: 'ajax',
      url: hostAPI + '/subscription/list',
      reader: {
        type: 'json',
      },
    },
    listeners: {
      load: function (_, records, successful, operation, eOpts) {
        data = records;
        Groups = storeCustomer.getGroups();
      },
    },
    autoLoad: { start: 0, limit: 25 },
  });

  let customerGrid = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    itemId: 'subscriptionGrid',
    store: storeCustomer,
    width: Ext.getBody().getViewSize().width,
    height: Ext.getBody().getViewSize().height,
    icon: 'https://icons.iconarchive.com/icons/google/noto-emoji-travel-places/16/42491-hospital-icon.png',
    header: false,
    plugins: ['gridfilters'],
    multiSelect: true,
    selModel: Ext.create('Ext.selection.CheckboxModel', {
      mode: 'SIMPLE',
      listeners: {
        selectionchange: function (model, selections) {
          var btnDelete = getCmp('#btnDelete');
          if (selections.length > 0) btnDelete.setDisabled(false);
          else btnDelete.setDisabled(true);
        },
      },
    }),
    features: [featureGrouping],
    listeners: {
      viewready: (_) => {
        loadScript('js/customerForm.js');
      },
      cellclick(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        if (cellIndex > 0 && cellIndex <= 5) {
          customerGrid.setDisabled(true);
          customerFormAction = actions.update;
          customerForm.show();
          //fix binding betwwen datefield & datecolumn
          // record.set(
          //   'expiredDate',
          //   record.get('expiredDate').split('/').reverse().join('-')
          // );
          customerForm.loadRecord(record);
          customerForm.query('#btnResetCustomerForm')[0].setDisabled(true);
          submitButton = customerForm.query('#btnSubmitCustomerForm')[0];
          submitButton.setText(actions.update.label);
          submitButton.setIcon(actions.update.icon);
        }
      },
    },
    tbar: [
      {
        xtype: 'button',
        itemId: 'btnDelete',
        icon: actions.delete.icon,
        disabled: true,
        tooltip: 'Xóa đăng kí',
        handler: () => {
          var seletedRecords = customerGrid
            .getSelectionModel()
            .getSelected()
            .getRange();
          Ext.Msg.confirm(
            'Xác nhận',
            'Bạn muốn xóa ' + seletedRecords.length + ' đăng kí này ?',
            (buttonId) => {
              if (buttonId === 'yes') {
                var ids = seletedRecords.map((record) => record.data.id);
                Ext.Ajax.request({
                  method: 'DELETE',
                  url: hostAPI + '/subscription/delete/' + ids.toString(),
                  success: function (response) {
                    storeCustomer.remove(seletedRecords);
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
      {
        xtype: 'button',
        id: 'btnRefresh',
        icon: 'https://icons.iconarchive.com/icons/graphicloads/100-flat/16/reload-icon.png',
        //text: 'Nạp lại danh sách',
        listeners: {
          click: () => {
            storeCustomer.clearFilter();
            storeCustomer.reload();
          },
        },
      },
      {
        xtype: 'button',
        id: 'btnAdd',
        icon: 'https://icons.iconarchive.com/icons/icojam/blue-bits/16/user-add-icon.png',
        text: actions.create.label,
        listeners: {
          click: () => {
            customerGrid.setDisabled(true);
            customerFormAction = actions.create;
            customerForm.show();
            customerForm.reset();
            resetButton = customerForm.query('#btnResetCustomerForm')[0];
            resetButton.setDisabled(false);
            submitButton = customerForm.query('#btnSubmitCustomerForm')[0];
            submitButton.setText(customerFormAction.label);
            submitButton.setIcon(customerFormAction.icon);
          },
        },
      },

      {
        xtype: 'combo',
        width: 120,
        store: new Ext.data.ArrayStore({
          fields: ['id', 'name'],
          data: [
            ['default', 'Phân nhóm'],
            ['subscriptionDate', 'Giới tính'],
          ],
        }),
        queryMode: 'local',
        displayField: 'name',
        valueField: 'id',
        name: 'cbbGrouping',
        id: 'cbbGrouping',
        value: 'default',
        editable: false,
        listeners: {
          change: (_, val) => {
            if (val !== 'default') {
              storeCustomer.setGroupField(val);
              Groups = storeCustomer.getGroups();
              storeCustomer.loadData(data);
            } else {
              storeCustomer.setGroupField(undefined);
            }
          },
        },
      },
      {
        xtype: 'textfield',
        width: 250,
        id: 'txtCustomerFindField',
        itemId: 'txtCustomerFindField',
        enableKeyEvents: true,
        listeners: {
          keypress: () => Ext.getCmp('btnFind').fireEvent('click'),
          keydown: (_, e) =>
            e.getKey() === e.ENTER
              ? Ext.getCmp('btnFind').fireEvent('click')
              : null,
        },
      },
      {
        xtype: 'button',
        text: actions.find.label,
        id: 'btnFind',
        icon: 'https://icons.iconarchive.com/icons/zerode/plump/16/Search-icon.png',
        listeners: {
          click: () => {
            storeCustomer.clearFilter();
            var searchValue = Ext.getCmp('txtCustomerFindField').getValue();
            if (!!searchValue) {
              var filters = [
                new Ext.util.Filter({
                  filterFn: function (item) {
                    return (
                      item
                        .get('fullName')
                        .toLowerCase()
                        .indexOf(searchValue.toLowerCase()) > -1 ||
                      item
                        .get('phone')
                        .toLowerCase()
                        .indexOf(searchValue.toLowerCase()) > -1 ||
                      item
                        .get('email')
                        .toLowerCase()
                        .indexOf(searchValue.toLowerCase()) > -1 ||
                      item
                        .get('subscriptionDate')
                        .split('-')
                        .reverse()
                        .join('/')
                        .indexOf(searchValue) > -1 ||
                      item
                        .get('expiredDate')
                        .split('-')
                        .reverse()
                        .join('/')
                        .indexOf(searchValue) > -1
                    );
                  },
                }),
              ];
              storeCustomer.filter(filters);
            }
          },
        },
      },
    ],
    bbar: {
      xtype: 'pagingtoolbar',
      displayInfo: true,
    },
    columns: [
      new Ext.grid.RowNumberer({ dataIndex: 'no', text: 'STT', width: 60 }),
      {
        text: 'ID',
        width: 50,
        dataIndex: 'id',
        hidden: true,
      },
      {
        text: 'Tên người dùng',
        width: 180,
        dataIndex: 'fullName',
      },
      {
        text: 'Email',
        width: 180,
        dataIndex: 'email',
      },
      {
        text: 'Số điện thoại',
        width: 120,
        dataIndex: 'phone',
      },
      {
        text: 'Ngày hết hạn',
        width: 120,
        dataIndex: 'expiredDate',
        //renderer: (v) => v.split('-').reverse().join('/'),
      },
      // {
      //   text: 'Địa chỉ',
      //   width: 120,
      //   dataIndex: 'address',
      // },
      // {
      //   text: 'Năm sinh',
      //   width: 100,
      //   dataIndex: 'birthday',
      // },
      // {
      //   text: 'Giới tính',
      //   width: 80,
      //   dataIndex: 'gender',
      //   renderer: (v) => (v === 0 ? 'Nữ' : 'Nam'),
      // },
      // {
      //   text: 'Nghề nghiệp',
      //   width: 100,
      //   dataIndex: 'career',
      // },

      // {
      //   text: 'Ghi chú',
      //   width: 150,
      //   dataIndex: 'note',
      // },
      {
        xtype: 'actioncolumn',
        width: 40,
        tooltip: 'Đăng Ký/Gia Hạn',
        text: 'ĐK',
        align: 'center',
        items: [
          {
            icon: 'https://icons.iconarchive.com/icons/awicons/vista-artistic/16/coin-add-icon.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {},
          },
        ],
      },
      {
        xtype: 'actioncolumn',
        width: 60,
        tooltip: 'Xóa người dùng',
        text: 'Xóa',
        align: 'center',
        items: [
          {
            icon: actions.delete.icon,
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              Ext.Msg.confirm(
                'Xác nhận',
                'Bạn muốn xóa người dùng này ?',
                (buttonId) => {
                  if (buttonId === 'yes') {
                    let store = grid.getStore();
                    var recordIndex = store.indexOf(record);
                    var id = grid.getStore().getAt(recordIndex).get('id');
                    Ext.Ajax.request({
                      method: 'DELETE',
                      url: hostAPI + '/customer/delete/' + id,
                      success: function (response) {
                        //log(response);
                        store.removeAt(recordIndex);
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
  });
});
