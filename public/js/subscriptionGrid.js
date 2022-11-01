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
      'totalAmount',
      'totalDay',
      'subscriptionDate',
      'SubscriptionDetails',
      'expiredDate',
      'status',
    ],
  });
  let storesubscription = Ext.create('Ext.data.Store', {
    model: 'Subscription',
    proxy: {
      type: 'ajax',
      url: hostAPI + '/subscription/list',
      reader: {
        type: 'json',
        root: 'records',
        totalProperty: 'totalCount',
        transform: {
          fn: function (data) {
            if (data.success) {
              data.records = data.records.map((record) => {
                record = { ...record, ...record['Customer'] };
                delete record['Customer'];
                // sum amount
                record.SubscriptionDetails.forEach((subscriptionDetail) => {
                  record.totalAmount += subscriptionDetail.amount;
                });
                record.totalDay = (record.totalAmount / 25000) * 30;
                record.subscriptionDate = _.min(
                  record.SubscriptionDetails.map(
                    (s) => new Date(s.subscriptionDate)
                  )
                );
                record.expiredDate = new Date(
                  new Date(record.subscriptionDate).getTime() +
                    record.totalDay * 24 * 3600 * 1000
                );
                //console.log(record)
                return record;
              });
            }
            return data;
          },
        },
      },
    },
    listeners: {
      load: function (_, records, successful, operation, eOpts) {
        data = records;
        Groups = storesubscription.getGroups();
      },
    },
    autoLoad: true,
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
      mode: 'MULTI',
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
        loadScript('js/subscriptionDetailGrid.js');
      },
      celldblclick(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        subscriptionGrid.setDisabled(true);
        subscriptionFormAction = actions.update;
        subscriptionForm.show();
        //fix binding betwwen datefield & datecolumn
        // record.set(
        //   'expiredDate',
        //   record.get('expiredDate').split('/').reverse().join('-')
        // );
        subscriptionDetailGridData = getCmp('#subscriptionGrid')
          .getStore()
          .getAt(rowIndex)
          .get('SubscriptionDetails');
        storeSubscriptionDetail.loadData(subscriptionDetailGridData);
        subscriptionForm.loadRecord(record);
        subscriptionForm
          .query('#btnResetsubscriptionForm')[0]
          .setDisabled(true);
        submitButton = subscriptionForm.query('#btnSubmitsubscriptionForm')[0];
        submitButton.setText(actions.update.label);
        submitButton.setIcon(actions.update.icon);
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
            resetButton = subscriptionForm.query(
              '#btnResetsubscriptionForm'
            )[0];
            resetButton.setDisabled(false);
            submitButton = subscriptionForm.query(
              '#btnSubmitsubscriptionForm'
            )[0];
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
      store: storesubscription,
      displayMsg: 'Dữ liệu từ {0} - {1} of {2}',
      emptyMsg: 'Không có dữ liệu',
      plugins: [
        {
          ptype: 'pagingtoolbarresizer',
          options: [25, 30, 50, 100, 125, 150, 200, 400, 500, 700, 1000],
          displayMsg: 'Số lượng dòng trên một trang',
        },
      ],
    },
    columns: [
      {
        xtype: 'rownumberer',
        dataIndex: 'id',
        text: 'STT',
        width: 60,
      },
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
        width: 222,
        dataIndex: 'email',
      },
      {
        text: 'Số tiền',
        width: 120,
        dataIndex: 'totalAmount',
        renderer: (v) => (v ? formatCash(v.toString()) + ' VND' : ''),
      },
      {
        text: 'Số ngày',
        width: 90,
        dataIndex: 'totalDay',
      },
      {
        text: 'Ngày đăng ký',
        width: 120,
        dataIndex: 'subscriptionDate',
        renderer: (v) => v.toLocaleDateString('vi-VN'),
      },
      {
        text: 'Ngày hết hạn',
        width: 120,
        dataIndex: 'expiredDate',
        renderer: (v) => v.toLocaleDateString('vi-VN'),
      },
      {
        text: 'Trạng thái',
        width: 100,
        dataIndex: 'status',
        renderer: (v) => (v ? 'Còn hạng' : 'Hết hạng'),
      },
    ],
    viewConfig: {
      getRowClass: function (record, index, rowParams) {
        //console.log(record.SubscriptionDetails());
        return !record.get('status') ? 'expired' : 'active';
      },
    },
  });
});
