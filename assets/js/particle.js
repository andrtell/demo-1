const SAMPLE_COUNT = 128;

function shuffle(array) {
  const len = array.length;
  for (let i = len - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

const INDEX_TABLE = [].concat(
  shuffle([...Array(SAMPLE_COUNT).keys()]),
  shuffle([...Array(SAMPLE_COUNT).keys()]),
);

const GRADIENT_TABLE = [...Array(SAMPLE_COUNT).keys()].map((_) => {
  const rad = Math.random() * Math.PI * 2;
  return [Math.cos(rad), Math.sin(rad)];
});

function gradient(x, y) {
  return GRADIENT_TABLE[
    INDEX_TABLE[INDEX_TABLE[x % SAMPLE_COUNT] + (y % SAMPLE_COUNT)]
  ];
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function interpolate(a, b, mu) {
  const mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
  return a * (1 - mu2) + b * mu2;
}

function noise(x, y) {
  const x_ = Math.floor(x);
  const y_ = Math.floor(y);
  const x_mu = smooth(x - x_);
  const y_mu = smooth(y - y_);
  const dot00 = dot(gradient(x_, y_), [x_mu, y_mu]);
  const dot10 = dot(gradient(x_ + 1, y_), [1 - x_mu, y_mu]);
  const dot01 = dot(gradient(x_, y_ + 1), [x_mu, 1 - y_mu]);
  const dot11 = dot(gradient(x_ + 1, y_ + 1), [1 - x_mu, 1 - y_mu]);
  const val0 = interpolate(dot00, dot10, x_mu);
  const val1 = interpolate(dot01, dot11, x_mu);
  return interpolate(val0, val1, y_mu);
}

function fractal_noise(x, y) {
  return (
    noise(x / 800, y / 800) +
    noise(x / 400, y / 400) / 2 +
    noise(x / 200, y / 200) / 4
  );
}

const can = document.getElementById("canvas");
const bcr = can.getBoundingClientRect();
can.height = bcr.height;
can.width = bcr.width;
const ctx = can.getContext("2d");
const dat = ctx.createImageData(bcr.width, bcr.height);

for (let x = 0; x < can.width; x++) {
  for (let y = 0; y < can.height; y++) {
    let idx = (x + y * dat.width) * 4;

    const val = fractal_noise(x, y);

    dat.data[idx + 0] = Math.floor(val * 256);
    dat.data[idx + 1] = Math.floor(val * 256);
    dat.data[idx + 2] = Math.floor(val * 256);
    dat.data[idx + 3] = 255;
  }
}

ctx.putImageData(dat, 0, 0);

// class Noise {
//   static dot(a, b) {
//     return a[0] * b[0] + a[1] * b[1];
//   }
//
//   static smooth(t) {
//     return t * t * (3 - 2 * t);
//   }
//
//   static shuffle(arr) {
//     const len = arr.length;
//     for (let i = len - 1; i > 0; i--) {
//       List.swap(arr, i, Math.floor(Math.random() * i));
//     }
//     return arr;
//   }
//
//   static perlin(count) {
//     const vec = [...Array(count).keys()].map((_) => {
//       const rad = Math.random() * Math.PI * 2;
//       return [Math.cos(rad), Math.sin(rad)];
//     });
//
//     const index = [].concat(
//       shuffle([...Array(count).keys()]),
//       shuffle([...Array(count).keys()]),
//     );
//
//     const p = (x, y) => {
//       return index[index[x % count] + (y % count)];
//     };
//
//     const grid = (x, y) => {
//       return vec[p(x, y)];
//     };
//
//     const smooth = (t) => {
//       return t * t * (3 - 2 * t);
//     };
//
//     const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
//
//     return (x, y) => {
//       const x_ = Math.floor(x);
//       const y_ = Math.floor(y);
//       const x_mu = smooth(x - x_);
//       const y_mu = smooth(y - y_);
//       let pol = Interpolate.cosine_2D(
//         dot(grid(x_, y_), [x_mu, y_mu]),
//         dot(grid(x_ + 1, y_), [1 - x_mu, y_mu]),
//         dot(grid(x_, y_ + 1), [x_mu, 1 - y_mu]),
//         dot(grid(x_ + 1, y_ + 1), [1 - x_mu, 1 - y_mu]),
//         x_mu,
//         y_mu,
//       );
//       return pol;
//     };
//   }
//
//   static permutation_2D(count) {
//     let index = Noise.shuffle([...Array(count).keys()]);
//     index = index.concat(index);
//     return (x, y) => {
//       return index[index[x % count] + (y % count)];
//     };
//   }
//
//   static discrete_number_2D(count) {
//     const ns = [...Array(count).keys()].map(() => Math.random());
//     const p2 = Noise.permutation_2D(count);
//     return (x, y) => {
//       return ns[p2(x, y)];
//     };
//   }
//
//   static discrete_vector_2D(count) {
//     const v = [...Array(count).keys()].map((_) => {
//       const r = Math.random() * Math.PI * 2;
//       return [Math.cos(r), Math.sin(r)];
//     });
//     const p = Noise.permutation_2D(count);
//     return (x, y) => {
//       return v[p(x, y)];
//     };
//   }
//
//   static value_noise_2D(count) {
//     const grid = Noise.discrete_number_2D(count);
//     return (x, y) => {
//       const x_ = Math.floor(x);
//       const y_ = Math.floor(y);
//       const x_mu = Interpolate.smooth(x - x_);
//       const y_mu = Interpolate.smooth(y - y_);
//       return Interpolate.lerp2D(
//         grid(x_, y_),
//         grid(x_ + 1, y_),
//         grid(x_, y_ + 1),
//         grid(x_ + 1, y_ + 1),
//         x_mu,
//         y_mu,
//       );
//     };
//   }
//
//   // Range of perlin-noise: -Math.sqrt(N/4) to Math.sqrt(N/4), N = no dims;
//   static perlin_noise_2D(count) {
//     const grid = Noise.discrete_vector_2D(count);
//     return (x, y) => {
//       const x_ = Math.floor(x);
//       const y_ = Math.floor(y);
//       const x_mu = Interpolate.smooth(x - x_);
//       const y_mu = Interpolate.smooth(y - y_);
//       let pol = Interpolate.cosine_2D(
//         Noise.dot(grid(x_, y_), [x_mu, y_mu]),
//         Noise.dot(grid(x_ + 1, y_), [1 - x_mu, y_mu]),
//         Noise.dot(grid(x_, y_ + 1), [x_mu, 1 - y_mu]),
//         Noise.dot(grid(x_ + 1, y_ + 1), [1 - x_mu, 1 - y_mu]),
//         x_mu,
//         y_mu,
//       );
//       return pol;
//     };
//   }
// }
//
// class List {
//   static swap(arr, i, j) {
//     const tmp = arr[i];
//     arr[i] = arr[j];
//     arr[j] = tmp;
//   }
//
//   static enumerate(upper) {
//     const seq = [];
//     for (let i = 0; i < upper; i++) {
//       seq[i] = i;
//     }
//     return seq;
//   }
// }
//
// class Interpolate {
//   static smooth(t) {
//     return t * t * (3 - 2 * t);
//   }
//
//   static lerp(a, b, mu) {
//     return a * (1 - mu) + b * mu;
//   }
//
//   static lerp2D(a, b, c, d, x_mu, y_mu) {
//     const { lerp } = Interpolate;
//     const y0 = lerp(a, b, x_mu);
//     const y1 = lerp(c, d, x_mu);
//     return lerp(y0, y1, y_mu);
//   }
//
//   static cosine_1D(a, b, mu) {
//     const mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
//     return a * (1 - mu2) + b * mu2;
//   }
//
//   static cosine_2D(a, b, c, d, x_mu, y_mu) {
//     const { cosine_1D } = Interpolate;
//     const y0 = cosine_1D(a, b, x_mu);
//     const y1 = cosine_1D(c, d, x_mu);
//     return cosine_1D(y0, y1, y_mu);
//   }
// }

// for (let x = 0; x < 100; x++) {
//   for (let y = 0; y < 100; y++) {
//     let idx = (x + y * dat.width) * 4;
//     console.log(dat.data[idx + 0]);
//     console.log(dat.data[idx + 1]);
//     console.log(dat.data[idx + 2]);
//   }
// }

//
