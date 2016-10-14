const structs = {
  snake: ['id', 'angle', 'size', 'x', 'y', 'bodys']
};

exports.objToArray = (obj, type) => {
  const struct = structs[type];
  let arr = [];

  if (!struct) {
    return arr;
  }

  struct.forEach((key, i) => {
    if (i === struct.length - 1) {
      arr = arr.concat(obj[key] || []);
    } else {
      arr.push(obj[key] || 0);
    }
  });

  return arr;
};

exports.arrayToObj = (arr, type) => {
  const struct = structs[type];
  let obj = {};

  if (!struct) {
    return obj;
  }

  struct.forEach((key, i) => {
    if (i === struct.length - 1) {
      obj[key] = arr.slice(i);
    } else {
      obj[key] = arr[i];
    }
  });

  return obj;
};

// const test = exports.objToArray({
//   id: 1,
//   angle: 100,
//   y: 100,
//   bodys: [1, 2, 3]
// }, 'snake'); 

// console.log(test);

// console.log(exports.arrayToObj(test, 'snake'));