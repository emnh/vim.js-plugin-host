/*global clearInterval: false, clearTimeout: false, document: false, event:
 * false, frames: false, history: false, Image: false, location: false, name:
 * false, navigator: false, Option: false, parent: false, screen: false,
 * setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false,
 * self: false, unsafeWindow: false */

//var self = require("sdk/self");

var Module = {
  noInitialRun: false,
  noExitRuntime: true,
  //arguments: ['/usr/local/share/vim/example.js'],
  arguments: ['/root/textarea0'],
  memoryInitializerPrefixURL: 'http://coolwanglu.github.io/vim.js/emterpreter/',
  preRun: [
    //function() { window.vimjs.pre_run(); },
    function() {
      window.vimjs.pre_run();
      var textareas = document.getElementsByTagName("textarea");
      var i;
      var textarea;
      var tname;
      //window.FS.mkdir("/root");
      
      // Write all textareas to Emscripten file system
      for (i = 0; i < textareas.length; i++) {
        textarea = textareas[i];
        tname = "vimtextarea" + i;
        textarea.classList.add(tname);
        window.FS.writeFile("/root/textarea" + i, textarea.value);
      }

      // Write all CodeMirror editor values to Emscripten file system
      var codemirrors = unsafeWindow.document.getElementsByClassName("CodeMirror");
      var codemirror;
      var data;
      //var script;
      for (i = 0; i < codemirrors.length; i++) {
        codemirror = codemirrors[i];
        tname = "vimcodemirror" + i;
        codemirror.classList.add(tname);

        data = codemirror.CodeMirror.getValue();
        window.FS.writeFile("/root/codemirror" + i, data);
      }

      // Write all Ace editor values to Emscripten file system
      var aceEditors = unsafeWindow.document.getElementsByClassName("ace_editor");
      var aceEditor;
      //var script;
      for (i = 0; i < aceEditors.length; i++) {
        if (unsafeWindow.ace.edit !== undefined) {
          aceEditor = unsafeWindow.ace.edit(aceEditors[i]);
          tname = "vimace" + i;
          aceEditors[i].classList.add(tname);

          data = aceEditor.getValue();
          window.FS.writeFile("/root/ace" + i, data);
        } else {
          console.log("ace.edit was undefined");
        }
      }


      // Add autocommands to vimrc to write back textarea buffer to DOM
      var vimrc = window.FS.readFile('/usr/local/share/vim/vimrc', { encoding: 'utf8' });
      for (i = 0; i < textareas.length; i++) {
        tname = "vimtextarea" + i;
        // slash at the end escapes JS newline
        // slash at the front escapes vimrc newline
        vimrc += "\
        au BufWritePost /root/textarea" + i + " : \n\
        \\ silent !var data = FS.readFile(\"%\", { encoding: \"utf8\" } ); \n\
        \\ var p = document.getElementsByClassName(\"" + tname + "\")[0]; \n\
        \\ p.value = data; \n\
        ";
      }

      // Add autocommands to vimrc to write back codemirror buffer to DOM
      for (i = 0; i < codemirrors.length; i++) {
        tname = "vimcodemirror" + i;
        // slash at the end escapes JS newline
        // slash at the front escapes vimrc newline
        vimrc += "\
        au BufWritePost /root/codemirror" + i + " : \n\
        \\ silent !var data = FS.readFile(\"%\", { encoding: \"utf8\" } ); \n\
        \\ var p = unsafeWindow.document.getElementsByClassName(\"" + tname + "\")[0]; \n\
        \\ p.CodeMirror.setValue(data); \n\
        ";
      }

      // Add autocommands to vimrc to write back Ace buffer to DOM
      for (i = 0; i < aceEditors.length; i++) {
        tname = "vimace" + i;
        // slash at the end escapes JS newline
        // slash at the front escapes vimrc newline
        vimrc += "\
        au BufWritePost /root/ace" + i + " : \n\
        \\ silent !var data = FS.readFile(\"%\", { encoding: \"utf8\" } ); \n\
        \\ var p = unsafeWindow.document.getElementsByClassName(\"" + tname + "\")[0]; \n\
        \\ unsafeWindow.ace.edit(p).setValue(data); \n\
        ";
      }

      window.FS.writeFile('/usr/local/share/vim/vimrc', vimrc);

    }
  ],
  postRun: [],
  print: function() { 
    if (console.group !== undefined) {
      console.group.apply(console, arguments); 
      console.groupEnd();
    } else {
      // IE
      console.log(arguments);
    }
  },
  printErr: function() { 
    if (console.group !== undefined) {
      console.group.apply(console, arguments); 
      console.groupEnd();
    } else {
      // IE
      console.log(arguments);
    }
  },
};
var insertNode = document.getElementsByClassName("vimInsertNode")[0];
var i;
var filename;
for (i = 0; i < insertNode.classList.length; i++) {
  if (insertNode.classList[i].indexOf("vimFileName_") !== -1) {
    filename = insertNode.classList[i].replace("vimFileName_", "/root/");
    console.log("filename", filename);
    Module.arguments = [ filename ];
    break;
  }
}
window.Module = Module;

var script = document.createElement("script");
script.async = true;
var baseUrl = "http://emnh.github.io/vim.js-plugin-host/";
script.src = baseUrl + "vim.js/vim.js";
var head = document.head || document.getElementsByTagName("head")[0];
head.appendChild(script);
