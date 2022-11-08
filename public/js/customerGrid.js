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
      label: 'Thêm người dùng mới',
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
  Ext.define('Customer', {
    extend: 'Ext.data.Model',
    fields: [
      'id',
      'fullName',
      'email',
      'phone',
      'gender',
      'birthday',
      'address',
      'career',
      'note',
    ],
  });
  let storeCustomer = Ext.create('Ext.data.Store', {
    model: 'Customer',
    proxy: {
      type: 'ajax',
      url: hostAPI + '/customer/list',
      reader: {
        type: 'json',
        root: 'records',
        totalProperty: 'totalCount',
      },
    },
    listeners: {
      load: function (_, records, successful, operation, eOpts) {
        data = records;
        Groups = storeCustomer.getGroups();
        log(Groups);
      },
    },
    autoLoad: true,
  });

  let customerGrid = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    itemId: 'customerGrid',
    store: storeCustomer,
    width: Ext.getBody().getViewSize().width,
    height: Ext.getBody().getViewSize().height,
    icon: 'https://icons.iconarchive.com/icons/google/noto-emoji-travel-places/16/42491-hospital-icon.png',
    header: false,
    plugins: ['gridfilters'],
    multiSelect: true,
    selModel: Ext.create('Ext.selection.CheckboxModel', {
      mode: 'MULTI',
      listeners: {
        selectionchange: function (model, selections) {
          var btnDelete = getCmp('#btnDelete');
          var btnSubscribe = getCmp('#btnSubscribe');
          if (selections.length > 0) {
            btnDelete.setDisabled(false);
            if (selections.length === 1) {
              btnSubscribe.setDisabled(false);
            } else btnSubscribe.setDisabled(true);
          } else {
            btnDelete.setDisabled(true);
            btnSubscribe.setDisabled(true);
          }
        },
      },
    }),
    features: [featureGrouping],
    listeners: {
      viewready: (_) => {
        loadScript('js/customerForm.js');
        loadScript('js/subscriptionAddForm.js');
      },
      celldblclick(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        if (cellIndex > 0 && cellIndex <= 5) {
          customerGrid.setDisabled(true);
          customerFormAction = actions.update;
          customerForm.show();

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
        tooltip: 'Xóa người dùng',
        handler: () => {
          var seletedRecords = customerGrid
            .getSelectionModel()
            .getSelected()
            .getRange();
          Ext.Msg.confirm(
            'Xác nhận',
            'Bạn muốn xóa ' + seletedRecords.length + ' người dùng này ?',
            (buttonId) => {
              if (buttonId === 'yes') {
                var ids = seletedRecords.map((record) => record.data.id);
                Ext.Ajax.request({
                  method: 'DELETE',
                  url: hostAPI + '/customer/delete/' + ids.toString(),
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
        listeners: {
          click: () => {
            storeCustomer.clearFilter();
            storeCustomer.getProxy().setConfig('url', ['/customer/list/']);
            storeCustomer.load();
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
        xtype: 'button',
        itemId: 'btnSubscribe',
        disabled: true,
        iconCls: 'subscribe',
        text: 'Subsribe',
        listeners: {
          click: () => {
            customerGrid.setDisabled(true);
            var seletedRecord = customerGrid
              .getSelectionModel()
              .getSelected()
              .getAt(0);
            seletedRecord.set('subscriptionDate', new Date());
            subscriptionAddForm.loadRecord(seletedRecord);
            subscriptionAddForm.show();
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
            ['address', 'Địa chỉ'],
            ['gender', 'Giới tính'],
            ['career', 'Nghề nghiệp'],
            ['birthday', 'Tuổi'],
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
              //featureGrouping.collapseAll();
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
              var proxy = storeCustomer.getProxy();
              proxy.setConfig('url', ['/customer/find/']);
              proxy.setConfig('extraParams', { searchValue });
              storeCustomer.load();
            }
          },
        },
      },
    ],
    bbar: {
      xtype: 'pagingtoolbar',
      displayInfo: true,
      store: storeCustomer,
      displayMsg: 'Dữ liệu từ {0} - {1} of {2}',
      emptyMsg: 'Không có dữ liệu',
      plugins: [
        {
          ptype: 'pagingtoolbarresizer',
          options: [25, 50, 100, 125, 150, 200, 400, 500, 700, 1000],
          displayMsg: 'Số lượng dòng trên một trang',
        },
      ],
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
            icon: 'https://icons.iconarchive.com/icons/fatcow/farm-fresh/16/coins-add-icon.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {},
          },
        ],
      },
    ],
  });
});
