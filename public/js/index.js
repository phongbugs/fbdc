const getCmp = function (query) {
    return Ext.ComponentQuery.query(query)[0];
  },
  createTab = ({ itemIdTabPanel, title, icon, htmlFile }) => {
    var tabPanel = getCmp(itemIdTabPanel)
    var tab = tabPanel.add({
      xtype: 'component',
      title: title,
      icon: icon,
      closable: true,
      autoEl: {
        tag: 'iframe',
        src: htmlFile,
        style: 'border:none',
      },
    });
    tabPanel.setActiveTab(tab);
  };
Ext.define('KitchenSink.view.layout.Border', {
  extend: 'Ext.panel.Panel',
  xtype: 'layout-border',
  requires: ['Ext.layout.container.Border'],
  profiles: {
    classic: {
      itemHeight: 100,
    },
    neptune: {
      itemHeight: 100,
    },
    graphite: {
      itemHeight: 120,
    },
    'classic-material': {
      itemHeight: 120,
    },
  },
  layout: 'border',
  width: 500,
  height: 400,
  cls: Ext.baseCSSPrefix + 'shadow',

  bodyBorder: false,

  defaults: {
    collapsible: true,
    split: true,
    bodyPadding: 10,
  },

  items: [
    // {
    //   title: 'Header',
    //   region: 'north',
    //   height: 100,
    //   minHeight: 75,
    //   maxHeight: 150,
    //   html: '<p>LOGO</p>',
    //   collapsible: false,
    //   header: false,
    //   split: false,
    // },
    {
      xtype: 'panel',
      collapsible: false,
      title: 'Menu',
      icon: 'https://icons.iconarchive.com/icons/icons8/windows-8/16/Very-Basic-Menu-icon.png',
      region: 'west',
      width: 200,
      height: 500,
      bodyPadding: 0,
      items: {
        xtype: 'menu',
        plain: true,
        floating: false,
        border: 'none',
        items: [
          {
            text: 'Users',
            iconCls: 'users',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: 'https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/16/Users-icon.png',
                htmlFile: '/customer.html',
              });
            },
          },
          {
            text: 'Subscriptions History',
            icon: 'https://icons.iconarchive.com/icons/mcdo-design/smooth-leopard/16/History-Folder-Willow-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/subscription.html',
              });
            },
          },
          {
            icon: 'https://icons.iconarchive.com/icons/saki/nuoveXT-2/16/Apps-session-logout-icon.png',
            text: 'Logout',
            handler: () => {
              document.cookie =
                'auth-token' +
                '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              location.reload();
            },
          },
        ],
      },
    },
    {
      xtype: 'tabpanel',
      title: 'Main Content',
      collapsible: false,
      header: false,
      region: 'center',
      itemId: 'mainContent',
      bodyPadding: 0,
      bodyBorder: 'none',
      border: 0,
    },
  ],
  renderTo: 'app',
});
Ext.onReady(function () {
  Ext.create('KitchenSink.view.layout.Border', {
    width:
      Ext.getBody().getViewSize().width < 1388
        ? 1388
        : Ext.getBody().getViewSize().width,
    height: Ext.getBody().getViewSize().height,
  });
});
