<a name="module_index"></a>

## index
The miyagi module


* [index](#module_index)
    * [~argsIncludeMockGenerator(args)](#module_index..argsIncludeMockGenerator) ⇒ <code>boolean</code>
    * [~argsIncludeComponentGenerator(args)](#module_index..argsIncludeComponentGenerator) ⇒ <code>boolean</code>
    * [~argsIncludeBuild(args)](#module_index..argsIncludeBuild) ⇒ <code>boolean</code>
    * [~argsIncludeServer(args)](#module_index..argsIncludeServer) ⇒ <code>boolean</code>
    * [~getCliArgs(args)](#module_index..getCliArgs) ⇒ <code>object</code>
    * [~getAllAvailableTemplateExtensions(possibleExtensions, folder, ignores)](#module_index..getAllAvailableTemplateExtensions) ⇒ <code>Array</code>
    * [~guessExtensionFromEngine(engineName)](#module_index..guessExtensionFromEngine) ⇒ <code>string</code>
    * [~guessEngineFromExtension(extension)](#module_index..guessEngineFromExtension) ⇒ <code>string</code>
    * [~guessEngineAndExtensionFromFiles(config)](#module_index..guessEngineAndExtensionFromFiles) ⇒ <code>object</code> \| <code>null</code>
    * [~Miyagi()](#module_index..Miyagi)

<a name="module_index..argsIncludeMockGenerator"></a>

### index~argsIncludeMockGenerator(args) ⇒ <code>boolean</code>
Checks if miyagi was started with `mocks` command

**Kind**: inner method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| args | <code>object</code> | 

<a name="module_index..argsIncludeComponentGenerator"></a>

### index~argsIncludeComponentGenerator(args) ⇒ <code>boolean</code>
Checks if miyagi was started with `new` command

**Kind**: inner method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| args | <code>object</code> | 

<a name="module_index..argsIncludeBuild"></a>

### index~argsIncludeBuild(args) ⇒ <code>boolean</code>
Checks if miyagi was started with `build` command

**Kind**: inner method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| args | <code>object</code> | 

<a name="module_index..argsIncludeServer"></a>

### index~argsIncludeServer(args) ⇒ <code>boolean</code>
Checks if miyagi was started with `start` command

**Kind**: inner method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| args | <code>object</code> | 

<a name="module_index..getCliArgs"></a>

### index~getCliArgs(args) ⇒ <code>object</code>
Converts and removes unnecessary cli args

**Kind**: inner method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| args | <code>object</code> | 

<a name="module_index..getAllAvailableTemplateExtensions"></a>

### index~getAllAvailableTemplateExtensions(possibleExtensions, folder, ignores) ⇒ <code>Array</code>
Returns all extensions that belong to template files found in the components folder

**Kind**: inner method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| possibleExtensions | <code>Array</code> | 
| folder | <code>string</code> | 
| ignores | <code>Array</code> | 

<a name="module_index..guessExtensionFromEngine"></a>

### index~guessExtensionFromEngine(engineName) ⇒ <code>string</code>
Returns the template files extension that belongs to a given engine

**Kind**: inner method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| engineName | <code>string</code> | 

<a name="module_index..guessEngineFromExtension"></a>

### index~guessEngineFromExtension(extension) ⇒ <code>string</code>
Returns the engine name that belongs to a given extension

**Kind**: inner method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| extension | <code>string</code> | 

<a name="module_index..guessEngineAndExtensionFromFiles"></a>

### index~guessEngineAndExtensionFromFiles(config) ⇒ <code>object</code> \| <code>null</code>
Scans the files, tries to find template files and based on the result
returns an object with engine.name and files.templates.extension

**Kind**: inner method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| config | <code>object</code> | 

<a name="module_index..Miyagi"></a>

### index~Miyagi()
Requires the user config and initializes and calls correct modules based on command

**Kind**: inner method of [<code>index</code>](#module_index)  