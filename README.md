# Reactive Signals

This repo is for learning, practice of reactive programming, simplified version of [reactively](https://github.com/modderme123/reactively), amazing work by [modderme123](https://github.com/modderme123).

```javascript
const a = reactive(1);
const double = reactive(() => a.value * 2);

double.value; // 2

a.value = 4;
double.value; // 8

a.value = 6;
double.value; // 12
```

```javascript
const a = reactive(0);
const big = reactive(() => a.value > 0);

const isABig = reactive(() => {
  return big.value ? "A is big" : "A is not big";
});

isABig.value; // "A is not big"

a.value = 1;
isABig.value; // "A is big"

a.value = 3;
isABig.value; // "A is big"
```
