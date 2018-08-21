require.config({
	bundles: {
		'code_edit/built-codeEdit-amd': ['orion/codeEdit', 'orion/util', 'orion/keyBinding']
	},
	paths: {
		mytext: 'requirejs/text',
		json: 'requirejs/json'
	}
});

define([
	'orion/codeEdit',
	'orion/util',
	'orion/keyBinding',
	'templates',
	'json!tern-project.json',
	'json!eslintrc.json',
	'json!jsbeautifyrc.json',
	'json!tern/defs/big.json',
	'json!tern/defs/jquery.json'
], function(CodeEdit, util, KeyBinding, templates, ternProject, eslintrc, jsbeautifyrc, big, jquery) {

	var codeEdit = new CodeEdit({
		editorConfig: {
			showOccurrences: true,
			contentAssistAutoTrigger: true,
			autoSaveTimeTimeout: 300,
			zoomRuler: true,
			showWhitespaces: false,
			showInfoAnnotation: true,
			showWarningAnnotation: true
		}
	});

	var configFiles = [
		{
			name: '.tern-project',
			contents: JSON.stringify(ternProject)
		},
		{
			// Severities: 0=ignore, 1=warning, 2=error, 3=info
			name: '.eslintrc',
			contents: JSON.stringify(eslintrc)
		},
		{
			name: '.jsbeautifyrc',
			contents: JSON.stringify(jsbeautifyrc)
		},
		{
			name: '.definitions/big.json',
			contents: JSON.stringify(big)
		},
		{
			name: '.definitions/jquery.json',
			contents: JSON.stringify(jquery)
		},
		{
			name: '.definitions/additionalDefinitions.json',
			contents: JSON.stringify({"!name": " "})
		}
	];

	return {
		bootstrap: function (parent, statusReporter) {
			return new Promise(function (resolve, reject) {
				codeEdit.startup().then(function() {
					codeEdit.importFiles(configFiles).then(function () {
						codeEdit.create({
							parent: parent,
							statusReporter: statusReporter
						}).then(function (editorViewer) {
							editorViewer.editor.getTextView().setOptions({
								themeClass: 'prospecto'
							});

							resolve({
								editorViewer: editorViewer,
								KeyStroke: KeyBinding.KeyStroke,
								util: util,
								TemplateContentAssist: templates.TemplateContentAssist
							});
						});
					});
				});
			});
		}
	};
});