export function reactive<T>(input: T | (() => T)): Reactive<T> {
  return new Reactive(input);
}
function isEqual(a: any, b: any) {
  return a === b;
}

// Global state
let CurrentReactive: Reactive<any> | undefined = undefined;
let CurrentGets: Reactive<any>[] | null = null;
let CurrentGetsIndex = 0;

const NodeClean = 0;
const NodeCheck = 1;
const NodeDirty = 2;

type NodeState = typeof NodeClean | typeof NodeCheck | typeof NodeDirty;
type NodenonClean = typeof NodeCheck | typeof NodeDirty;

class Reactive<T> {
  private _value: T;
  private fn?: () => T;

  private state: NodeState;
  private parents: Reactive<any>[] | null = null;
  private children: Reactive<any>[] | null = null;

  constructor(input: (() => T) | T) {
    if (typeof input === "function") {
      this._value = undefined as any;
      this.fn = input as () => T;
      this.state = NodeDirty;
    } else {
      this._value = input;
      this.fn = undefined;
      this.state = NodeClean;
    }
  }

  get value(): T {
    return this.get();
  }

  set value(v: T | (() => T)) {
    this.set(v);
  }

  get(): T {
    if (CurrentReactive) {
      if (
        !CurrentGets &&
        CurrentReactive.parents &&
        CurrentReactive.parents[CurrentGetsIndex] === this
      ) {
        CurrentGetsIndex += 1;
      } else {
        if (!CurrentGets) CurrentGets = [this];
        else CurrentGets.push(this);
      }
    }

    if (this.fn) this.checkParentsState();
    return this._value;
  }

  set(v: T | (() => T)) {
    if (typeof v === "function") {
      this._value = undefined as any;
      !isEqual(this.fn, v) && this.colorDown(NodeDirty);
      this.fn = v as () => T;
    } else {
      if (this.fn) {
        this.fn = undefined;
        this.parents = null;
        this.removeParentsChildren(0);
      }

      if (!isEqual(this._value, v)) {
        if (this.children) {
          for (const c of this.children) {
            c.colorDown(NodeDirty);
          }
        }
        this._value = v;
      }
    }
  }

  colorDown(stateFromSource: NodenonClean) {
    if (this.state < stateFromSource) {
      this.state = stateFromSource;
      if (this.children) {
        for (const c of this.children) {
          c.colorDown(NodeCheck);
        }
      }
    }
  }

  checkParentsState() {
    if (this.state === NodeCheck) {
      for (const s of this.parents!) {
        s.checkParentsState();
        if ((this.state = NodeDirty)) break;
      }
    }

    if (this.state === NodeDirty) this.update();

    this.state = NodeClean;
  }

  removeParentsChildren(index: number) {
    if (!this.parents) return;
    for (let i = index; i < this.parents.length; i++) {
      let p = this.parents[i];
      let me = p.children!.findIndex((c) => c === this);
      p.children![me] = p.children![p.children!.length - 1];
      p.children!.pop();
    }
  }

  update() {
    const old_value = this._value;
    const prevReactive = CurrentReactive;
    const prevGets = CurrentGets;
    const prevIndex = CurrentGetsIndex;

    CurrentReactive = this;
    CurrentGets = null as any;
    CurrentGetsIndex = 0;

    try {
      this._value = this.fn!();
      if (CurrentGets) {
        this.removeParentsChildren(CurrentGetsIndex);
        if (this.parents && CurrentGetsIndex > 0) {
          this.parents.length = CurrentGetsIndex + CurrentGets.length;
          for (let i = 0; i < CurrentGets.length; i++) {
            this.parents[CurrentGetsIndex + i] = CurrentGets[i];
          }
        } else {
          this.parents = CurrentGets;
        }

        for (let i = CurrentGetsIndex; i < this.parents.length; i++) {
          let p = this.parents[i];
          if (p.children) {
            p.children.push(this);
          } else {
            p.children = [this];
          }
        }
      } else if (this.parents && CurrentGetsIndex < this.parents.length) {
        this.removeParentsChildren(CurrentGetsIndex);
        this.parents.length = CurrentGetsIndex;
      }
    } finally {
      CurrentReactive = prevReactive;
      CurrentGets = prevGets;
      CurrentGetsIndex = prevIndex;
    }

    if (!isEqual(this._value, old_value) && this.children) {
      for (const c of this.children) {
        c.state = NodeDirty;
      }
    }

    this.state = NodeClean;
  }
}
