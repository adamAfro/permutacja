import anime from "https://cdn.jsdelivr.net/gh/juliangarnier/anime@master/lib/anime.es.js";

/** Layout hooks */
const Layout = {
  
  /** Measures offset difference between nodes */
  diff(/** @type Element */ x, /** @type Element */ y) {
    
    return {
      top: x.offsetTop - y.offsetTop,
      left: x.offsetLeft - y.offsetLeft
    };
  }
}

/** Template elements for displaying */
const Template = {};
try {
  
  const parser = new DOMParser();
  const parse = (html) => parser.parseFromString(html, "text/html");


  /** @type HTMLElement, empty space */
  Template.holder = parse(/*HTML*/`
  
    <div style="display:inline-block"></div>
  
  `).querySelector("div");



  /** @type HTMLElement; Equation layout */
  Template.equation = parse(/*HTML*/`

    <div class="equation">

      <header class="header">

        <button class="button addition" name="addition">
          +
        </button>

        <label class="button dim">
          <span>n = </span>
          <input name="length" type="number" min="2" max="9" value="3">
        </label>

      </header>

      <div class="symbol target" style="display:inline-block">&#963;</div>
      <button class="symbol sign" style="display:inline-block">=</button>

    </div>

  `).querySelector(".equation");


  /** @type HTMLElement; Permutation object */
  Template.permutation = parse(/*HTML*/`
    
    <div class="permutation" style="display:inline-block;position:relative">

      <div class="interactions" style="display:inline-block">
        <button class="button sorter" style="display:block">&gtdot;</button>
        <button class="button removal" style="display:block">&cross;</button>
      </div>

      <div class="parenthesis" style="display:inline-block;font-size:3em;transform:scaleX(.5)">(</div>

      <div class="parenthesis" style="display:inline-block;font-size:3em;transform:scaleX(.5)">)</div>

      <label class="exponent" style="display:inline-block;width:1em;position:static">
        <div style="display:block;position:absolute;top:0">
          <input style="position:absolute;bottom:-100%" name="invert" type="checkbox">
          <span class="value">-1</span>
        </div>
      </label>

    </div>

  `).querySelector(".permutation");

  
  /** @type HTMLElement; Column of a permutation */
  Template.column = parse(/*HTML*/ `
    
    <div class="column" style="position:relative;display:inline-block">
      <button class="value top" draggable="true" style="display:block"></button>
      <select class="value bottom" style="display:block"></select>
    </div>

  `).querySelector(".column");


  /** @type HTMLElement; Placeholder that shows up for adding permutation to equation */
  Template.placeholder = parse(/*HTML*/ `

    <div class="placeholder" 
      style="display:inline-block;min-width:1em;min-height:1em;border:thin dashed;margin:.5em"
    ></div>

  `).querySelector(".placeholder");


  /** @type HTMLOptionElement; Option to select for a permutation value */
  Template.option = parse(/*HTML*/ `

    <option></option>

  `).querySelector("option");


  /** @type HTMLElement; Placeholder when there is nothing rightside of equation sign */
  Template.identy = parse(/*HTML*/`
  
    <div class="identy" style="display:inline-block">id</div>

  `).querySelector(".identy");

} catch (error) { throw error;} finally {

  /** Removes white spaces */
  for (let name in Template) {
    for (let element of [Template[name], ...Template[name].querySelectorAll("*")]) {
      for (let node of element.childNodes) {

        if (node.nodeName == "#text" && !node.textContent.trim())
          node.remove();
      }
    }
  }

  Object.freeze(Template);
}

/** Symbolizes column of a permutation */
class Column {

  /** @type HTMLElement; Container-element */
  root;

  /** @type HTMLButtonElement; Element with top value */
  top;
  
  /** @type HTMLSelectElement;  Element with bottom value */
  bottom;

  constructor(element) { 
    
    this.root = element;
    this.top = element.querySelector(".top");
    this.bottom = element.querySelector(".bottom");
  }

  /** Changes column top value */
  set index(/** @type number */ value) {

    this.top.value = this.top.textContent = value;
  }

  get index() {

    return parseInt(this.top.value);
  }

  set value(/** @type number */ value) {

    this.bottom.value = value;
  }

  get value() {

    return parseInt(this.bottom.value);
  }

  /** Returns count of possible options */
  get range() {
    
    return this.top.children.length;
  }

  /** Changes possible options for the bottom to select - limits them or adds */
  set range(range = 0) {

    let previous = this.range;
    let change = range - previous;
    if (change > 0) for (let i = 0; i < change; i++) {

      let option = Template.option.cloneNode(true);
     
      option.textContent = option.value = previous + i + 1;

      this.bottom.insertAdjacentElement("beforeend", option);

    } else if (change < 0) for (let i = previous - 1; i > range - 1; i--) {

      this.bottom.options[i].remove();
    }
  }
}

/** Symbolizes mathematical permutation and holds its columns */
class Permutation {

  /** @type HTMLElement; Container element */
  root;

  /** @type Column[]; Stores perm's columns */
  columns;

  /** @type HTMLElement; Previous, opening parenthesis of permutation */
  opening;

  /** @type HTMLElement; Closing parenthesis of permutation */
  closing;

  /** @type HTMLButtonElement; Button for removing a whole permutation */
  removal;

  /** @type HTMLButtonElement; Button for sorting */
  sorter;

  /** @type HTMLInputElement; Checkbox for handling inversion status */
  inversion;

  constructor(element, length = 3) { 
    
    this.root = element;
  
    this.columns = [];
    for (let subel of element.querySelectorAll(".column"))
      this.columns.push(new Column(subel));

    this.opening = this.root.querySelector(".parenthesis");
    this.closing = this.root.querySelector(".parenthesis + .parenthesis");

    this.removal = this.root.querySelector(".removal");

    this.sorter = this.root.querySelector(".sorter");
    this.sorter.addEventListener("click", (click) => this.sort());

    this.inversion = this.root.querySelector(`input[name="invert"]`);

    this.length = length;
  }

  /** Aligns top row so that it is in order */
  async sort() {

    let columns = this.root.querySelectorAll(".column");
    let animations = [];
    for (let i = 0, n = this.length; i < n; i++) {

      let replacement = this.columns
        .find((column) => (column.index == i + 1))
        .root;
      
      let replaced = columns[i];
      if (replaced === replacement)
        continue;

      let diff = Layout.diff(replaced, replacement);
      animations.push(anime({ 
        targets: replacement, 
        translateX: diff.left, 
        translateY: diff.top 
      }));
    }

    await Promise.all(animations.map((anim) => anim.finished));

    let anchor = this.opening;
    for (let i = 0, n = this.length; i < n; i++) {

      let next = this.columns.find((column) => (column.index == i + 1));

      next.root.style.transform = "";
      anchor.after(next.root);
      anchor = next.root;
    }
  }

  /** Inverts top-bottom values and changes inversion box status */
  async invert() {

    let flows = [];
    for (let column of this.columns) {

      flows.push(anime({
        targets: column.root,
        rotateX: "90deg"
      }).finished.then(() => {

        let holder = column.index;
        column.index = column.value;
        column.value = holder;

      }).then(() => anime({
        targets: column.root,
        rotateX: "0deg"
      })));
    }

    this.inversion.checked = !this.inversion.checked;

    await Promise.all(flows);
  }

  /** Applies drag effect on column that is dragged over another and the another one */
  async drophook(/** @type DragEvent */ event) {

    event.preventDefault();

    let replaced = this.columns
      .find((search) => (search.top == event.currentTarget));

    let value = new Number(event.dataTransfer.getData("text/plain"));
    if (!value)
      throw "smthng wnt wrng";

    let replacement = this.columns
      .find((search) => (search.index == value))

    if ((!replaced || !replacement) || replacement === replaced)
      return;

    if (replacement.root.parentElement != replaced.root.parentElement)
      return;

    replaced.root.style.pointerEvents = "none";
    replacement.root.style.pointerEvents = "none";

    let diff = Layout.diff(replaced.root, replacement.root);

    replacement.root.style.transform = `translate(${diff.left}px, ${diff.top}px)`;
    let animation = anime({ targets: replaced.root, translateX: -diff.left, translateY: -diff.top });

    await animation.finished;
    
    animation.pause(), animation.reset();
    replaced.root.style.transform = "";
    replacement.root.style.transform = "";

    let anchor = replacement.root.previousElementSibling;
    if (anchor === replaced.root) {

      anchor.before(replacement.root);  

    } else {

      replaced.root.replaceWith(replacement.root);
      anchor.after(replaced.root);
    }

    replaced.root.style.pointerEvents = "";
    replacement.root.style.pointerEvents = "";
  }

  /** Handles dragging of a column's top */
  dragging(/** @type DragEvent */ event) {

    event.dataTransfer.setData("text/plain", event.currentTarget.value);
    event.dataTransfer.setDragImage(event.currentTarget.parentElement, 0, 0);
  }

  /** Applies changed bottom of a column - changes its duplicate - one that had the value before */
  selecthook(column) {

    let replaced = this.columns.filter((inclusion) => (inclusion !== column))
      .find((search) => (search.value == column.value))

    replaced.value = this.unused.bottom[0];

    for (let other of this.columns)
      other.bottom.classList.remove("replaced");

    replaced.bottom.classList.add("replaced");
    column.bottom.classList.add("replaced");
  }

  /** Count of columns inside permutation */
  get length() { return this.columns.length;}

  /** Changes count of columns and their values so that they don't exceed length */
  set length(length = 1) {

    if (length < 0)
      throw new Error("Length cannot be negative");

    let previous = this.length;
    let change = length - previous;
    if (change > 0) {

      for (let column of this.columns)
        column.range = length;

      for (let i = 0; i < change; i++) {

        let column = new Column(Template.column.cloneNode(true));

        column.range = length;
        
        column.index = previous + i + 1;
        column.top.addEventListener("dragover", (drag) => drag.preventDefault());
        column.top.addEventListener("dragstart", (drag) => this.dragging(drag));
        column.top.addEventListener("drop", (drop) => this.drophook(drop));
        
        column.value = previous + i + 1;
        column.bottom.addEventListener("change", (change) => this.selecthook(column));

        this.columns.push(column);
        this.closing.insertAdjacentElement("beforebegin", column.root);
      }

    } else if (change < 0) {

      for (let column of this.columns.splice(length, -change))
        column.root.remove();

      let unused = this.unused;
      for (let column of this.columns) {

        if (column.index > this.length) 
          column.index = unused.top[0], unused.top.shift();
        if (column.bottom.value > this.length) 
          column.value = unused.bottom[0], unused.bottom.shift()

        column.range = length;
      }
    }
  }

  /** Values between 1 and length of the permutation that are not among columns */
  get unused() {

    return {
      
      top: [...Array(this.length).keys()]
        .map((i) => (i + 1))
        .filter((i) => !this.columns.some((column) => (column.index == i))),
      
      bottom: [...Array(this.length).keys()]
        .map((i) => (i + 1))
        .filter((i) => !this.columns.some((column) => (column.value == i))) 
    };
  }

  /** Performs submission animation */
  static async submit(/** @type Permutation */ previous, /** @type Permutation */ next, /** @type number */ length = previous.length) {

    let diff = Layout.diff(previous.root, next.root);
    let submission = new Permutation(Template.permutation.cloneNode(true), length);
    for (let i = 0; i < length; i++) {

      let replacement = next.columns[i];
      let replaced = previous.columns
        .find((search) => (search.index == replacement.value));
      let shift = replaced.top.offsetHeight;

      await Promise.all([

        anime({
          targets: replacement.root,
          translateX: `${diff.left - replacement.root.offsetLeft + replaced.root.offsetLeft}px`,
          translateY: `${diff.top + replaced.root.offsetTop - replacement.root.offsetHeight + shift*.5}px`
        }).finished,

        anime({
          targets: replaced.root,
          translateY: `${shift*1.5}px`
        }).finished
      ]);

      await Promise.all([
        anime({ targets: [replaced.top, replacement.bottom], opacity: 0 }).finished,
        anime({ targets: replacement.root, translateY: `${diff.top}px` }).finished,
        anime({ targets: replaced.root, translateY: 0 }).finished
      ]);

      submission.columns[i].index = replacement.index;
      submission.columns[i].value = replaced.value;
    }

    previous.root.after(submission.root);
    previous.root.remove();
    next.root.remove();

    return submission;
  }
}

/** Symbolizes mathematical equation of permutations and holds them */
export default class Equation {

  /** @type HTMLElement; Container element */
  root;

  /** @type HTMLElement; Element that contains equation target symbol */
  target;

  /** @type HTMLButtonElement; Element with equality symbol */
  sign;

  /** @type HTMLInputElement; Element that dictates length of permutations */
  length;

  /** @type Permutation[]; Array of permutations in equation */
  permutations;
  
  /** @type HTMLButtonElement; Element that makes it possible to add permutations */
  addition;

  constructor(element) { 
    
    this.root = element;

    this.target = element.querySelector(`.target`);
    
    this.sign = element.querySelector(`.sign`);
    this.sign.addEventListener("click", (click) => this.solve());

    this.length = element.querySelector(`input[name="length"]`);
    this.length.addEventListener("input", (input) => this.resize());

    this.permutations = [];

    this.addition = this.root.querySelector(`button[name="addition"]`);
    this.addition.addEventListener("click", (click) => (this.placeholding = !this.placeholding));
  }

  /** Changes lengths of permutations */
  resize() {

    for (let perm of this.permutations)
      perm.length = this.length.value;
  }

  /** Moves permutation to certain point of equation */
  async move(/** @type Permutation */moved, side = "right", pos = "start") {

    if (side == "left") throw "not implemented move";

    if (side == "right") {

      console.info("defeault inversion: inversion detection is not implemented yet");
      moved.inversion.checked = !moved.inversion.checked;

      let holder = Template.holder.cloneNode("true");

      holder.style.width = "0";
      holder.style.verticalAlign = "top";
      if (pos == "start")
        this.sign.after(holder);
      else if (pos == "end")
        this.root.append(holder);
      else
        throw "unnkown position";

      let grow = anime({
        targets: holder,
        width: `${moved.root.offsetWidth}px`,
        easing: "linear",
        duration: 230
      });

      let diff = Layout.diff(holder, moved.root);
      let move = anime({
        targets: moved.root,
        translateX: diff.left,
        translateY: diff.top
      });

      await move.finished;

      let anchor = moved.root.previousElementSibling;
      holder.replaceWith(moved.root);
      anchor.after(holder);

      move.pause(), move.reset();
      moved.root.style.transform = "";
      holder.style.transform = "";

      let shrink = anime({
        targets: holder,
        width: "0",
        easing: "linear",
        duration: 230
      });

      await shrink.finished;
      holder.remove();

      this.refresh();

      return moved;
    }

    throw "unnkown side";
  }

  /** Solves equation step and shows it */
  async solve() {

    let target = undefined;

    /** Move permutation before targeted one */
    if (target = this.root.querySelector(`.permutation:not(.target ~ .permutation)`)) 
      return this.move(this.permutations.find((search) => (search.root == target)), "right", "start");

    /** Move permutation after targeted one */
    if (target = this.root.querySelector(`.permutation:not(.sign ~ .permutation)`)) 
      return this.move(this.permutations.find((search) => (search.root == target)), "right", "end");

    /** Inverts permutation */
    for (let permutation of this.permutations) {

      if (permutation.inversion.checked) {

        permutation.invert();

        return permutation;
      }
    }
    
    /** Makes a submission of two last permutations */
    let targets = this.root.querySelectorAll(`.permutation`);
    if (targets.length >= 2) {

      targets = [
        this.permutations.find((perm) => (perm.root === targets[targets.length - 2])),
        this.permutations.find((perm) => (perm.root === targets[targets.length - 1]))
      ];

      this.permutations = this.permutations
        .filter((keep) => !(targets.includes(keep)));

      let product = await Permutation.submit(...targets);

      this.permutations.push(product);

      return product;
    }
  }

  /** Makes random equation of permutations */
  randomize() {

    /** Adds random amount of permutations at random places */
    for (let i = 0, n = Math.floor(Math.random() * 7 + 1); i < n; i++) {

      this.placeholding = true;
      
      let placeholders = this.root.querySelectorAll(".placeholder");
      this.add(placeholders[Math.floor(Math.random() * placeholders.length)]);

      this.placeholding = false;
    }
      
    /** Makes permutations' columns random */
    for (let perm of this.permutations) {

      let values = {
        top: [...Array(perm.length).keys()].map((i) => (i + 1)),
        bottom: [...Array(perm.length).keys()].map((i) => (i + 1))
      };

      let vindex;
      for (let column of perm.columns) {

        vindex = Math.floor(Math.random() * values.top.length);
        column.index = column.top.textContent = values.top[vindex], values.top.splice(vindex, 1);

        vindex = Math.floor(Math.random() * values.bottom.length);
        column.value = values.bottom[vindex], values.bottom.splice(vindex, 1);
      }
    }

    this.refresh();
  }

  /** Makes sure that everything is tip top */
  refresh() {

    if (!this.root.querySelector(".sign ~ .permutation")) {

      if (!this.root.querySelector(".sign ~ .identy"))
        this.root.append(Template.identy.cloneNode(true));

    } else this.root.querySelector(".identy")?.remove();
  }

  /** Adds permutation to the list and listens for its deletation
   * Replaces given container or append into root
   */
  add(container = this.root) {

    let perm = new Permutation(Template.permutation.cloneNode(true), this.length.value);
    this.permutations.push(perm);
    if (container === this.root) 
      container.append(perm.root);
    else
      container.replaceWith(perm.root); 

    perm.removal.addEventListener("click", (click) => {

      perm.root.remove(), this.permutations = this.permutations
        .filter((keep) => (keep !== perm));

      this.refresh();
    });

    return perm;
  }

  /** Checks if placeholders are displayed and it is possible to add permutations */
  get placeholding() { return (this.addition.textContent == "/") }

  /** Removes or adds placeholders and makes it possible to add permutations */
  set placeholding(status) {

    if (status == false) {

      this.addition.textContent = "+";
      for (let holder of this.root.querySelectorAll(".placeholder"))
        holder.remove();

    } else {

      this.addition.textContent = "/";
      let content = [this.target, this.sign, ...this.permutations.map((p) => p.root)];
      for (let element of content) 
        element.after(Template.placeholder.cloneNode(true));

      for (let child of this.root.children)
        if (content.includes(child)) { child.before(Template.placeholder.cloneNode(true)); break; }

      for (let holder of this.root.querySelectorAll(".placeholder")) {

        holder.addEventListener("click", (click) => {
          
          this.add(holder);
          this.refresh();
          this.placeholding = false;
        });
      }
    }
  }

  static Create() {

    return new this(Template.equation.cloneNode(true));
  }
}