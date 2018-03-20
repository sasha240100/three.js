class DataParser {
  constructor(parser) {
    this.parser = parser;
  }

  data(name) {
    // console.log(this.parser.activeData);
    return name ? this.parser.activeData[name] : this.parser.activeData;
  }

  get object() {
    return this.parser.activeObject;
  }

  get mixer() {
    return this.parser.activeMixer;
  }

  get name() {
    return this.parser.activeName;
  }

  get clip() {
    return this.parser.activeClip;
  }

  get action() {
    return this.parser.activeAction;
  }

  get events() {
    return this.parser.activeEvents;
  }

  set clip(value) {
    this.parser.activeClip = value;
  }
}
