// Global Variables
let Groups,
  data = [],
  featureGrouping = Ext.create('Ext.grid.feature.GroupingSummary', {
    startCollapsed: true,
    showSummaryRow: false,
    groupHeaderTpl: [
      '<div style="color:#d14836; font-weight: bold">{name:this.formatName}<span style="color:green; font-weight: normal"> ({rows.length} User)</span></div>',
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
      label: 'New supscription',
      iconCls: 'add',
      method: 'POST',
      icon: 'https://icons.iconarchive.com/icons/icojam/blue-bits/16/user-add-icon.png',
    },
    update: {
      name: 'update',
      label: 'Update',
      iconCls: 'update',
      method: 'PUT',
      icon: 'https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-9/16/edit-file-icon.png',
    },
    delete: {
      name: 'delete',
      label: 'Delete',
      icon: 'https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/16/Actions-edit-delete-icon.png',
    },
    find: { name: 'find', label: 'Find', icon: '' },
    logout: { name: 'logout', label: 'Logout', icon: '' },
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
  },
  isExpiredDate = (supscriptionDate, amount) => {
    let currentDate = new Date(),
      expiredDate = calcExpiredDate(supscriptionDate, amount);
    return expiredDate.getTime() - currentDate.getTime() < 0;
  },
  formatFormRecord = (formRecord) => {
    formRecord.set(
      'totalAmount',
      formatCash(formRecord.get('totalAmount').toString())
    );
    let isExpired = isExpiredDate(
      formRecord.get('subscriptionDate'),
      formRecord.get('totalAmount')
    );
    log(isExpired);
    getCmp('#statusBox').setHtml(
      `<div id="divStatus" style="padding-left:104px"><span style="display:flex" class="${
        isExpired ? 'expiredbox' : 'activebox'
      }"> ${isExpired ? 'Expired' : 'Active'}</span></div>`
    );
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
  let storeSubscription = Ext.create('Ext.data.Store', {
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
        // records = records.map((record) => {
        //   //let status = record.status ? 'Active' : 'Expired';
        //   //record.set('status', status);
        //   //log(record);
        //   return record;
        // });

        data = records;
        Groups = storeSubscription.getGroups();
        log(Groups);
      },
    },
    autoLoad: true,
  });

  let subscriptionGrid = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    itemId: 'subscriptionGrid',
    store: storeSubscription,
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
        loadScript('js/subscriptionAddForm.js');
      },
      celldblclick(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        subscriptionGrid.setDisabled(true);
        subscriptionFormAction = actions.update;
        subscriptionForm.show();

        let formRecord = record; // _.clone(record);
        formatFormRecord(formRecord);
        subscriptionForm.loadRecord(formRecord);
        subscriptionForm
          .query('#btnResetsubscriptionForm')[0]
          .setDisabled(true);
        submitButton = subscriptionForm.query('#btnSubmitsubscriptionForm')[0];
        submitButton.setText(actions.update.label);
        submitButton.setIcon(actions.update.icon);

        // Load data on grid
        subscriptionDetailGridData = getCmp('#subscriptionGrid')
          .getStore()
          .getAt(rowIndex)
          .get('SubscriptionDetails');
        storeSubscriptionDetail.loadData(subscriptionDetailGridData);
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
          log(seletedRecords);
          var arrSubscriptionDetailIds = seletedRecords.map((record) =>
            record.data.SubscriptionDetails.map((s) => s.id)
          );
          let subscriptionDetailIds = [];
          arrSubscriptionDetailIds.forEach((arr) => {
            subscriptionDetailIds = [...arr, ...subscriptionDetailIds];
          });
          let uniqueSubscriptionDetailIds = [...new Set(subscriptionDetailIds)];
          log(arrSubscriptionDetailIds);
          log(subscriptionDetailIds);
          log(uniqueSubscriptionDetailIds);
          Ext.Msg.confirm(
            'Xác nhận',
            'Bạn muốn xóa ' + seletedRecords.length + ' đăng kí này ?',
            (buttonId) => {
              if (buttonId === 'yes') {
                Ext.Ajax.request({
                  method: 'DELETE',
                  url:
                    hostAPI +
                    '/subscription-detail/delete/' +
                    uniqueSubscriptionDetailIds.toString(),
                  success: function (response) {
                    var subscriptionIds = seletedRecords.map(
                      (record) => record.data.id
                    );
                    Ext.Ajax.request({
                      method: 'DELETE',
                      url:
                        hostAPI +
                        '/subscription/delete/' +
                        subscriptionIds.toString(),
                      success: function (response) {
                        storeSubscription.remove(seletedRecords);
                        getCmp('#subscriptionGrid').getStore().load();
                      },
                      failure: function (response) {
                        log(response);
                      },
                    });
                  },
                  failure: function (response) {
                    log(response);
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
            storeSubscription.clearFilter();
            storeSubscription.reload();
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
            subscriptionAddForm.show();
            subscriptionAddForm.reset();
            resetButton = subscriptionAddForm.query(
              '#btnResetSubscriptionAddForm'
            )[0];
            resetButton.setDisabled(false);
            submitButton = subscriptionAddForm.query(
              '#btnSubmitSubscriptionAddForm'
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
            ['default', 'Group by'],
            ['status', 'Status'],
            ['subscriptionDate', 'supcription Date'],
            ['subscriptionDate', 'supcription Date'],
            ['totalAmount', 'Total Amount'],
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
              storeSubscription.setGroupField(val);
              Groups = storeSubscription.getGroups();
              storeSubscription.loadData(data);
            } else {
              storeSubscription.setGroupField(undefined);
            }
          },
        },
      },
      {
        xtype: 'textfield',
        width: 250,
        itemId: 'txtSubscriptionFindField',
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
            storeSubscription.clearFilter();
            var searchValue = getCmp('#txtSubscriptionFindField').getValue();
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
                        .get('email')
                        .toLowerCase()
                        .indexOf(searchValue.toLowerCase()) > -1 ||
                      item
                        .get('subscriptionDate')
                        .indexOf(searchValue) > -1 ||
                      item
                        .get('expiredDate')
                        .indexOf(searchValue) > -1
                    );
                  },
                }),
              ];
              storeSubscription.filter(filters);
            }
          },
        },
      },
    ],
    bbar: {
      xtype: 'pagingtoolbar',
      displayInfo: true,
      store: storeSubscription,
      displayMsg: 'Data from {0} -> {1} of {2}',
      emptyMsg: 'No display of data',
      plugins: [
        {
          ptype: 'pagingtoolbarresizer',
          options: [25, 30, 50, 100, 125, 150, 200, 400, 500, 700, 1000],
          displayMsg: "Record's Quantity Per Page",
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
        text: 'Full Name',
        width: 180,
        dataIndex: 'fullName',
      },
      {
        text: 'Email',
        width: 222,
        dataIndex: 'email',
      },
      {
        text: 'Total Amount',
        width: 120,
        dataIndex: 'totalAmount',
        renderer: (v) => (v ? formatCash(v.toString()) : ''),
      },
      {
        text: 'Total Day',
        width: 90,
        dataIndex: 'totalDay',
      },
      {
        text: 'Subscription Date',
        width: 120,
        dataIndex: 'subscriptionDate',
        renderer: (v) => v.toLocaleDateString('vi-VN'),
      },
      {
        text: 'Expired Date',
        width: 120,
        dataIndex: 'expiredDate',
        renderer: (v) => v.toLocaleDateString('vi-VN'),
      },
      {
        text: 'Status',
        width: 100,
        dataIndex: 'status',
        renderer: (v) => (v ? 'Active' : 'Expired'),
      },
    ],
    viewConfig: {
      getRowClass: function (record, index, rowParams) {
        return !record.get('status') ? 'expired' : '';
      },
    },
  });
});
