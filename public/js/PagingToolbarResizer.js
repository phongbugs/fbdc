Ext.define('PagingToolbarResizer', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.pagingtoolbarresizer',
    options: [5, 10, 15, 20, 25, 30, 50, 75, 100, 200, 300, 500, 1000],
    mode: 'remote',
    displayText: 'Số lượng dòng trên 1 trang',
    recordsPerPageCmb: null,
    constructor: function (config) {
      Ext.apply(this, config);
  
      this.callParent(arguments);
    },
    init: function (pagingToolbar) {
      var me = this;
      var comboStore = me.options;
      me.recordsPerPageCmb = Ext.create('Ext.form.field.ComboBox', {
        typeAhead: false,
        triggerAction: 'all',
        forceSelection: true,
        lazyRender: true,
        editable: false,
        mode: me.mode,
        value: pagingToolbar.store.pageSize,
        width: 80,
        store: comboStore,
        listeners: {
          select: function (combo, value, i) {
            pagingToolbar.store.pageSize = value.data.field1;
            pagingToolbar.store.load();
          },
        },
      });
  
      var index = pagingToolbar.items.indexOf(pagingToolbar.refresh);
      pagingToolbar.insert(++index, me.displayText);
      pagingToolbar.insert(++index, me.recordsPerPageCmb);
      pagingToolbar.insert(++index, '-');
  
      //destroy combobox before destroying the paging toolbar
      pagingToolbar.on({
        beforedestroy: function () {
          me.recordsPerPageCmb.destroy();
        },
      });
    },
  });
  Ext.define('PagingToolbar', {
    extend: 'Ext.toolbar.Paging',
    alias: 'widget.resizer.pagingtoolbar',
  
    requires: ['PagingToolbarResizer'],
  
    toolbarResizer: null,
  
    initComponent: function () {
      var me = this;
      me.callParent(arguments);
  
      var pluginClassName = 'PagingToolbarResizer';
  
      me.toolbarResizer = Ext.create(pluginClassName);
  
      if (Ext.isEmpty(me.plugins)) {
        me.plugins = [me.toolbarResizer];
      } else {
        var pushTbResizer = true;
        Ext.each(me.plugins, function (plugin) {
          if (Ext.getClassName(plugin) == pluginClassName) {
            pushTbResizer = false;
          }
        });
        if (pushTbResizer) {
          me.plugins.push(me.toolbarResizer);
        }
      }
    },
    bindStore: function (store, initial, propertyName) {
      var me = this;
      me.callParent(arguments);
      if (
        !Ext.isEmpty(me.toolbarResizer) &&
        !Ext.isEmpty(me.toolbarResizer.recordsPerPageCmb) &&
        !Ext.isEmpty(store)
      ) {
        me.toolbarResizer.recordsPerPageCmb.setValue(store.pageSize);
      }
    },
  });
