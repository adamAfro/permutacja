/** Template elements for displaying */
const Template = {};
try {
  
  const parser = new DOMParser();
  const parse = (html) => parser.parseFromString(html, "text/html");


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
      <select class="value top" style="display:block"></select>
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

  /** @type HTMLSelectElement; Element with top value */
  top;
  
  /** @type HTMLSelectElement;  Element with bottom value */
  bottom;

  constructor(element) { 
    
    this.root = element;
    this.top = element.querySelector(".top");
    this.bottom = element.querySelector(".bottom");
  }

  /** Returns count of possible options */
  get range() {
    
    return this.top.children.length;
  }

  /** Changes possible options to select - limits them or adds */
  set range(range = 0) {

    let previous = this.range;
    let change = range - previous;
    if (change > 0) for (let i = 0; i < change; i++) {

      let options = [
        Template.option.cloneNode(true),
        Template.option.cloneNode(true)
      ];
      
      options[0].textContent = options[0].value = previous + i + 1;
      options[1].textContent = options[1].value = previous + i + 1;

      this.top.insertAdjacentElement("beforeend", options[0]);
      this.bottom.insertAdjacentElement("beforeend", options[1]);

    } else if (change < 0) for (let i = previous - 1; i > range - 1; i--) {

      this.top.options[i].remove();
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
  sort() {

    let anchor = this.opening;
    for (let i = 0, n = this.length; i < n; i++) {

      let next = this.columns.find((column) => (column.top.value == i + 1));

      anchor.after(next.root);
      anchor = next.root;
    }
  }

  /** Inverts top-bottom values and changes inversion box status */
  invert() {

    for (let column of this.columns) {

      let holder = column.top.value;

      column.top.value = column.bottom.value;
      column.bottom.value = holder;
    }

    this.inversion.checked = !this.inversion.checked;
  }

  /** Applies changed column - removes its duplicate - one that had the value before */
  changehook(column, position) {

    if (!["top", "bottom"].includes(position))
      throw new Error("invalid position");

    let replaced = this.columns.filter((inclusion) => (inclusion !== column))
      .find((search) => (search[position].value == column[position].value))

    replaced[position].value = this.unused[position][0];

    for (let other of this.columns)
      other[position].classList.remove("replaced");

    replaced[position].classList.add("replaced");
    column[position].classList.add("replaced");
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
        
        column.top.value = previous + i + 1;
        column.top.addEventListener("change", (change) => this.changehook(column, "top"));
        
        column.bottom.value = previous + i + 1;
        column.bottom.addEventListener("change", (change) => this.changehook(column, "bottom"));

        this.columns.push(column);
        this.closing.insertAdjacentElement("beforebegin", column.root);
      }

    } else if (change < 0) {

      for (let column of this.columns.splice(length, -change))
        column.root.remove();

      let unused = this.unused;
      for (let column of this.columns) {

        if (column.top.value > this.length) 
          column.top.value = unused.top[0], unused.top.shift();
        if (column.bottom.value > this.length) 
          column.bottom.value = unused.bottom[0], unused.bottom.shift()

        column.range = length;
      }
    }
  }

  /** Values between 1 and length of the permutation that are not among columns */
  get unused() {

    return {
      
      top: [...Array(this.length).keys()]
        .map((i) => (i + 1))
        .filter((i) => !this.columns.some((column) => (column.top.value == i))),
      
      bottom: [...Array(this.length).keys()]
        .map((i) => (i + 1))
        .filter((i) => !this.columns.some((column) => (column.bottom.value == i))) 
    };
  }

  /** Returns submission its product */
  static apply(/** @type Permutation */ previous, /** @type Permutation */ next, /** @type number */ length = previous.length) {

    let permutation = new Permutation(Template.permutation.cloneNode(true), length);
    for (let i = 0; i < length; i++) {

      permutation.columns[i].top.value = next.columns[i].top.value;
      permutation.columns[i].bottom.value = previous.columns
        .find((match) => (match.top.value == next.columns[i].bottom.value)).bottom.value;
    }

    return permutation;
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

  /** Solves equation and shows it */
  solve() {

    let target = undefined;

    /** Move permutation before targeted one */
    if (target = this.root.querySelector(`.permutation:not(.target ~ .permutation)`)) {

      this.sign.after(target);
      let moved = this.permutations.find((search) => (search.root == target))
        
      moved.inversion.checked = !moved.inversion.checked;

      return moved;
    } 

    /** Move permutation after targeted one */
    if (target = this.root.querySelector(`.permutation:not(.sign ~ .permutation)`)) {

      this.root.append(target);
      let moved = this.permutations.find((search) => (search.root == target))
        
      moved.inversion.checked = !moved.inversion.checked;

      return moved;
    }

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
        this.permutations.find((perm) => (perm.root === targets[targets.length - 1])),
        this.permutations.find((perm) => (perm.root === targets[targets.length - 2]))
      ];

      this.permutations = this.permutations
        .filter((keep) => !(targets.includes(keep)));

      let product = Permutation.apply(...targets);

      this.permutations.push(product);
      targets[1].root.after(product.root);
      
      targets[0].root.remove();
      targets[1].root.remove();

      product.sort();

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
        column.top.value = values.top[vindex], values.top.splice(vindex, 1);

        vindex = Math.floor(Math.random() * values.bottom.length);
        column.bottom.value = values.bottom[vindex], values.bottom.splice(vindex, 1);
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