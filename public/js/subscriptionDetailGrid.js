// this is the model we will be using in the store
Ext.define('SubscriptionDetail', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id',    type: 'int' },
        { name: 'subscriptionId',  type: 'int' },
        { name: 'amount', type: 'int'},
        { name: 'subscriptionDate', type: 'date'}
    ]
});

// note how we set the 'root' in the reader to match the data structure above
var storeSubscriptionDetail = Ext.create('Ext.data.Store', {
    autoLoad: true,
    model: 'SubscriptionDetail',
    data: [],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
        }
    }
});
