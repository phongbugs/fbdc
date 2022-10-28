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
      label: 'Thêm bệnh nhân mới',
      iconCls: 'add',
      method: 'POST',
      icon:
        'https://icons.iconarchive.com/icons/icojam/blue-bits/16/user-add-icon.png',
    },
    update: {
      name: 'update',
      label: 'Cập nhật',
      iconCls: 'update',
      method: 'PUT',
      icon:
        'https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-9/16/edit-file-icon.png',
    },
    delete: {
      name: 'delete',
      label: 'Xóa',
      icon:
        'https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/16/Actions-edit-delete-icon.png',
    },
    find: { name: 'find', label: 'Tìm kiếm', icon: '' },
    logout: { name: 'logout', label: 'Đăng xuất', icon: '' },
  },
  customerFormAction = actions.create;
Ext.onReady(function () {
  // authenticate((isAuthenticated) =>
  //   !isAuthenticated ? location.reload() : null
  // );

  Ext.define('Customer', {
    extend: 'Ext.data.Model',
    fields: [
      'id',
      'id_ref',
      'phone',
      'name',
      'age',
      'gender',
      'career',
      'address',
      'disease_type',
      're_examination_date',
      'annual_examination',
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
      },
    },
    listeners: {
      load: function (_, records, successful, operation, eOpts) {
        data = records;
        Groups = storeCustomer.getGroups();
      },
    },
    autoLoad: true,
  });

  let customerGrid = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    id: 'customerGrid',
    store: storeCustomer,
    width: Ext.getBody().getViewSize().width,
    height: Ext.getBody().getViewSize().height,
    icon:
      'https://icons.iconarchive.com/icons/google/noto-emoji-travel-places/16/42491-hospital-icon.png',
    title: 'Quản lý bệnh nhân',
    plugins: ['gridfilters'],
    //selModel: 'cellmodel',
    features: [featureGrouping],
    listeners: {
      viewready: (_) => {
        loadScript('js/customerForm.js');
      },
      cellclick(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        if (cellIndex !== 11) {
          customerGrid.setDisabled(true);
          customerFormAction = actions.update;
          customerForm.show();
          //fix binding betwwen datefield & datecolumn
          record.set(
            're_examination_date',
            record.get('re_examination_date').split('/').reverse().join('-')
          );
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
        id: 'btnAdd',
        icon:
          'https://icons.iconarchive.com/icons/icojam/blue-bits/16/user-add-icon.png',
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
        id: 'btnRefresh',
        icon:
          'https://icons.iconarchive.com/icons/graphicloads/100-flat/16/reload-icon.png',
        text: 'Nạp lại danh sách',
        listeners: {
          click: () => {
            storeCustomer.clearFilter();
            storeCustomer.reload();
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
            ['disease_type', 'Loại bệnh'],
            ['career', 'Nghề nghiệp'],
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
        icon:
          'https://icons.iconarchive.com/icons/zerode/plump/16/Search-icon.png',
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
                        .get('name')
                        .toLowerCase()
                        .indexOf(searchValue.toLowerCase()) > -1 ||
                      item
                        .get('phone')
                        .toLowerCase()
                        .indexOf(searchValue.toLowerCase()) > -1 ||
                      item
                        .get('re_examination_date')
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
      '->',
      {
        xtype: 'button',
        id: 'btnLogout',
        icon:
          'https://icons.iconarchive.com/icons/saki/nuoveXT-2/16/Apps-session-logout-icon.png',
        text: actions.logout.label,
        dock: 'right',
        listeners: {
          click: () => {
            localStorage.removeItem('authToken');
            location.reload();
          },
        },
      },
    ],
    columns: [
      new Ext.grid.RowNumberer({ dataIndex: 'no', text: 'STT', width: 60 }),
      {
        text: 'ID',
        width: 50,
        dataIndex: 'id',
        hidden: true,
      },
      {
        text: 'Tên bệnh nhân',
        width: 180,
        dataIndex: 'name',
      },

      {
        text: 'Số điện thoại',
        width: 120,
        dataIndex: 'phone',
      },
      {
        text: 'Địa chỉ',
        width: 120,
        dataIndex: 'address',
      },
      {
        text: 'Tuổi',
        width: 60,
        dataIndex: 'age',
      },
      {
        text: 'Giới tính',
        width: 80,
        dataIndex: 'gender',
        renderer: (v) => (v === 0 ? 'Nữ' : 'Nam'),
      },
      {
        text: 'Nghề nghiệp',
        width: 100,
        dataIndex: 'career',
      },
      {
        text: 'Loại bệnh',
        width: 100,
        dataIndex: 'disease_type',
      },
      {
        //xtype: 'datecolumn',
        //format: 'd/m/Y',
        text: 'Ngày tái khám',
        width: 120,
        dataIndex: 're_examination_date',
        renderer: (v) => v.split('-').reverse().join('/'),
      },
      {
        text: 'Khám thường niên',
        width: 150,
        dataIndex: 'annual_examination',
        renderer: (v) => v + ' Lần / năm',
      },
      {
        text: 'Ghi chú',
        width: 150,
        dataIndex: 'note',
      },
      {
        xtype: 'actioncolumn',
        width: 30,
        tooltip: 'Xóa bệnh nhân',
        text: 'Xóa',
        items: [
          {
            icon: actions.delete.icon,
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              Ext.Msg.confirm(
                'Xác nhận',
                'Bạn muốn xóa bệnh nhân này ?',
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
