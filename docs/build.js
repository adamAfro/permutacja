import Markdown from "markdown-it";
import mdkatex from "markdown-it-katex";

import { readFileSync as read, writeFileSync as write } from "fs";
import { DOMParser } from "linkedom";

const markdown = new Markdown({ html: true }).use(mdkatex, { output: "html" });
let doc = (new DOMParser())
  .parseFromString(markdown.render(read("ReadMe.md").toString()), 'text/html');

write("./ReadMe.html", doc.toString());