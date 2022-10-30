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
  subscriptionFormAction = actions.create,
  getCmp = function (query) {
    return Ext.ComponentQuery.query(query)[0];
  },
  formatCash = (str) => {
    return str
      .split('')
      .reverse()
      .reduce((prev, next, index) => {
        return (index % 3 ? next : next + '.') + prev;
      });
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
  let storesubscription = Ext.create('Ext.data.Store', {
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
        Groups = storesubscription.getGroups();
      },
    },
    autoLoad: { start: 0, limit: 25 },
  });

  let subscriptionGrid = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    itemId: 'subscriptionGrid',
    store: storesubscription,
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
        loadScript('js/subscriptionForm.js');
      },
      cellclick(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        if (cellIndex > 0 && cellIndex <= 5) {
          subscriptionGrid.setDisabled(true);
          subscriptionFormAction = actions.update;
          subscriptionForm.show();
          //fix binding betwwen datefield & datecolumn
          // record.set(
          //   'expiredDate',
          //   record.get('expiredDate').split('/').reverse().join('-')
          // );
          subscriptionForm.loadRecord(record);
          subscriptionForm.query('#btnResetsubscriptionForm')[0].setDisabled(true);
          submitButton = subscriptionForm.query('#btnSubmitsubscriptionForm')[0];
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
          var seletedRecords = subscriptionGrid
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
                    storesubscription.remove(seletedRecords);
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
            storesubscription.clearFilter();
            storesubscription.reload();
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
            subscriptionGrid.setDisabled(true);
            subscriptionFormAction = actions.create;
            subscriptionForm.show();
            subscriptionForm.reset();
            resetButton = subscriptionForm.query('#btnResetsubscriptionForm')[0];
            resetButton.setDisabled(false);
            submitButton = subscriptionForm.query('#btnSubmitsubscriptionForm')[0];
            submitButton.setText(subscriptionFormAction.label);
            submitButton.setIcon(subscriptionFormAction.icon);
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
              storesubscription.setGroupField(val);
              Groups = storesubscription.getGroups();
              storesubscription.loadData(data);
            } else {
              storesubscription.setGroupField(undefined);
            }
          },
        },
      },
      {
        xtype: 'textfield',
        width: 250,
        id: 'txtsubscriptionFindField',
        itemId: 'txtsubscriptionFindField',
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
            storesubscription.clearFilter();
            var searchValue = Ext.getCmp('txtsubscriptionFindField').getValue();
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
              storesubscription.filter(filters);
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
        text: 'Số tiền',
        width: 120,
        dataIndex: 'amount',
        renderer: (v) => (v ? formatCash(v) : ''),
      },
      {
        text: 'Ngày đăng ký',
        width: 120,
        dataIndex: 'subscriptionDate',
        //renderer: (v) => v.split('-').reverse().join('/'),
      },
      {
        text: 'Ngày hết hạn',
        width: 120,
        dataIndex: 'expiredDate',
        //renderer: (v) => v.split('-').reverse().join('/'),
      },
    ],
  });
});
