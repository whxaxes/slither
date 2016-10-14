var structs = {
  snake: ['id', 'angle', 'size', 'x', 'y', 'bodys'],
  food: ['id', 'coords']
};

exports.objToArray = function(obj, type) {
  var struct = structs[type];
  var arr = [];

  if (!struct) {
    return arr;
  }

  struct.forEach(function(key, i) {
    if (i === struct.length - 1) {
      arr = arr.concat(obj[key] || []);
    } else {
      arr.push(obj[key] || 0);
    }
  });

  return arr;
};

exports.arrayToObj = function(arr, type) {
  var struct = structs[type];
  var obj = {};

  if (!struct) {
    return obj;
  }

  struct.forEach(function(key, i) {
    if (i === struct.length - 1) {
      obj[key] = arr.slice(i);
    } else {
      obj[key] = arr[i];
    }
  });

  return obj;
};

// var test = exports.objToArray({
//   id: 1,
//   angle: 100,
//   y: 100,
//   bodys: [1, 2, 3]
// }, 'snake'); 

// console.log(test);

// console.log(exports.arrayToObj(test, 'snake'));