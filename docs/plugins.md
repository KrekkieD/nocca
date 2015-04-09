# Plugins

## Plugin Definition Object

    {
        interface: 'keyGenerator',
        id: 'uniqueIdForPlugin',
        name: 'Human Readable Name For Plugin',
        constructor: functionToInstantiate
    }
    
### interface

This defines what the plugin is and what interface is implemented in the instance.

### id

This is an ID for the plugin and MUST be unique. It is used to load the plugin.

### name

A short name for the plugin. 

### constructor

A function that is instantiated when the plugin is used. The instance is created with 
the Nocca instance as argument:

    var plugin = new definitionObject.constructor(Nocca);
    
## Loading plugins

To load a plugin provided by Nocca, specify the name in the Nocca configuration object:

    {
        ...
        record: false,
        ...
        plugins: [
            'cherryPickingKeygen'
        ]
    }

To load a custom plugin, specify the Plugin Definition Object in the Nocca configuration object:

    {
        ...
        record: false,
        ...
        plugins: [
            {
                interface: 'keyGenerator',
                id: 'customKeyGenerator',
                name: 'My Custom Key Generator',
                constructor: function (Nocca) {
                    ...
                }
            },
            
            // or alternatively (cleaner)
            require('path/to/my/plugin')
        ]
    }
    
