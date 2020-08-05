'use babel';

import EvalPadView from './eval-pad-view';
import { CompositeDisposable } from 'atom';

var leftEditor = null, rightEditor = null;
var atomDir = process.env.USERPROFILE + '/.atom/';
var bufferRows = false;
var inputJS = [], outputJS = [];

export default {

  evalPadView: null,
  Editor: null,
  subscriptions: null,

  activate(state) {
    this.evalPadView = new EvalPadView(state.evalPadViewState);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'eval-pad:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.evalPadView.destroy();
  },

  serialize() {
    return {
      evalPadViewState: this.evalPadView.serialize()
    };
  },

  toggle() {
    if(leftEditor != null || rightEditor != null) {
      leftEditor.onDidSave(function () {
        leftEditor.destroy();
        leftEditor = null;
      });
      rightEditor.onDidSave(function () {
        rightEditor.destroy();
        rightEditor = null;
      });
      leftEditor.save();
      rightEditor.save();
      return;
    }
    atom.workspace.open(atomDir + "output.js", {split: 'right', activatePane: false}).then(textEditor => {
        rightEditor = textEditor;
    });
    atom.workspace.open(atomDir + "input.js", {split: 'left', activatePane: true}).then(textEditor => {
        leftEditor = textEditor;
        if(leftEditor.getText() == "") {
          leftEditor.setText('bufferRows = false;')
          leftEditor.set
        }
        leftEditor.onDidChange(function() {
          text = "";
          lines = leftEditor.getText().split("\n");
          evalLines = "";
          lines.forEach((line, xqy) => {
            inputJS[xqy+1] = line;
            if(line == "\r" || line == "") {
              evalLines = "";
              text += "\n";
            } else {
              if(bufferRows) {
                evalLines += line;
              } else {
                evalLines = line;
              }
              try {
                tmp = eval(evalLines);
                if(typeof(tmp) == 'object') tmp = JSON.stringify(tmp);
                outputJS[xqy+1] = tmp;
                text += tmp + '\n';
              } catch(error) {
                text += error + '\n';
              }
            }
          });
          rightEditor.setText(text);
        });
    });
  }
};
