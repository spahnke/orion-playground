define([
	'tern/lib/tern',
	'tern/lib/infer',
	'./ajax'
], function (tern, infer, ajax) {

	var defs = {
		"!name": "testplugin",
		"Foo": {
			"!type": "fn()",
			"create": {
				"!type": "fn(name: string) -> +Foo",
				"!doc": "Returns a new Foo object."
			},
			"prototype": {
				"name": {
					"!type": "string",
					"!doc": "The name of the Foo.\n@since 1.1"
				},
				"designation": {
					"!type": "string",
					"!doc": "The name of the Foo.\n@since 1.0\n@deprecated"
				}
			}
		},
		"defineModule": {
			"!type": "fn(name: string, def: fn()) -> !custom:defineModule"
		},
		"loadModule": {
			"!type": "fn(name: string) -> !custom:loadModule"
		}
	};
	
	tern.registerPlugin('testplugin', function (server, options) {
		server.addDefs(defs);
	});

	/* Test module support with:
		var Person = loadModule('person');
		var john = new Person('John', 'Doe');
		john.
	*/

	var moduleTypes = Object.create(null);

	infer.registerFunction('defineModule', function (self, args, argnodes) {
		if (!argnodes[0] || argnodes[0].type !== 'Literal' || typeof argnodes[0].value !== 'string' ||
			!argnodes[1] || argnodes[1].type !== 'FunctionExpression' && argnodes[1].type !== 'ArrowFunctionExpression') {

			return infer.ANull;
		}

		var moduleName = argnodes[0].value;
		var functionDefinition = argnodes[1];
		var functionType = infer.expressionType({
			node: functionDefinition,
			state: functionDefinition.scope
		});
		moduleTypes[moduleName] = functionType.retval;

		return infer.ANull;
	});

	infer.registerFunction('loadModule', function (self, args, argnodes) {
		if (!argnodes[0] || argnodes[0].type !== 'Literal' || typeof argnodes[0].value !== 'string')
			return infer.ANull;

		var moduleName = argnodes[0].value;
		var moduleType = moduleTypes[moduleName];
		if (!moduleType) {
			moduleTypes[moduleName] = infer.ANull; // prevent fetching multiple times

			var ternServer = infer.cx().parent;
			var currentFile = argnodes[0].sourceFile.name;

			getModule('../../' + moduleName + '.js').then(function (content) {
				console.log('Adding file ' + moduleName + '.js ...');
				ternServer.addFile('/' + moduleName, content, currentFile);
			}).catch(function (error) {
				console.log(error);
			});

			return infer.ANull;
		}
		return moduleType;
	});

	function getModule(modulePath) {
		if (!self.fetch) {
			console.log('No Fetch API available, falling back to XHR.');
			return ajax.get(modulePath, {
				timeout: 10000
			});
		}
		
		return fetch(modulePath).then(function (response) {
			if (response.ok)
				return response.text();
			throw new Error('Failed to fetch "' + modulePath + '": ' + response.status + ' ' + response.statusText);
		});
	}
});