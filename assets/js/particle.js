class List {
  static swap(arr, i, j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }

  static sequence(upper) {
    const seq = [];
    for (let i = 0; i < upper; i++) {
      seq[i] = i;
    }
    return seq;
  }
}

class Interpolation {
  static linear(a, b, mu) {
    return a * (1 - mu) + b * mu;
  }

  static cosine(a, b, mu) {
    const mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
    return a * (1 - mu2) + b * mu2;
  }
}

class Random {
  static integer(upper) {
    return Math.floor(Math.random() * upper);
  }

  static numbers(count) {
    const values = [];
    for (let i = 0; i < count; i++) {
      values[i] = Math.random();
    }
    return values;
  }

  static shuffle_list(a) {
    const s = [...a];
    const len = s.length;
    for (let i = len - 1; i > 0; i--) {
      List.swap(s, i, Random.integer(i));
    }
    return s;
  }

  static permutation_1(upper) {
    let index = Random.shuffle_list(List.sequence(upper));
    return (x) => {
      return index[x % upper];
    };
  }

  static permutation_2(upper) {
    index = Random.shuffle_list(List.sequence(upper));
    index = index.concat(index);
    return (x, y) => {
      return index[index[x % upper] + (y % upper)];
    };
  }

  static periodic_numbers_1(count) {
    const ns = Random.numbers(count);
    const p1 = Random.permutation_1(count);
    return (x) => {
      return ns[p1(x)];
    };
  }

  static periodic_numbers_2(count) {
    const ns = Random.numbers(count);
    const p2 = Random.permutation_2(count);
    return (x, y) => {
      return ns[p2(x, y)];
    };
  }
}

n2 = Random.make_numbers_2(100);
console.log(n2(20, 20));
console.log(n2(21, 20));
console.log(n2(21, 100));

class Normalize {
  static min_max(values) {
    let min = values[0];
    let max = values[0];
    for (let i = 0; i < values.length; i++) {
      min = Math.min(min, values[i]);
      max = Math.max(max, values[i]);
    }
    const range = max - min;
    if (range == 0) {
      return values;
    }
    for (let i = 0; i < values.length; i++) {
      values[i] = (values[i] - min) / range;
    }
    return values;
  }
}

class Scale {
  static up(x, min, max) {
    return x * (max - min) + min;
  }
}

class Noise {
  static make(octaves = 1) {
    if (octaves < 1) {
      octaves = 1;
    }
    const samples = [];
    const freq_inc = 3;
    for (let i = 0; i < octaves; i++) {
      let f = freq_inc * (i + 1);
      samples[i] = [f, Normalize.min_max(Random.numbers(f))];
    }
    return (x) => {
      let y = 0;
      let amp = 0.5;
      for (let i = 0; i < samples.length; i++) {
        let f = samples[i][0];
        const xs = Scale.up(x, 0, f);
        const x_ = Math.floor(xs);
        const mu = xs - x_;
        const s0 = samples[i][1][x_ % f];
        const s1 = samples[i][1][(x_ + 1) % f];
        y += Interpolation.linear(s0, s1, mu) * amp;
        amp /= 2;
      }
      return y;
    };
  }
}

const can = document.getElementById("canvas");
const bcr = can.getBoundingClientRect();
can.height = bcr.height;
can.width = bcr.width;
const ctx = can.getContext("2d");
const dat = ctx.createImageData(bcr.width, bcr.height);

// const x = create_n(10, can.width);
const y = Noise.make(5);

const NO_PIX = can.width;
const pix = [];

for (i = 0; i < NO_PIX; i++) {
  pix[i] = [i, Math.floor(Scale.up(y((1 / NO_PIX) * i), 0, can.width))];
}

for (i = 0; i < NO_PIX; i++) {
  let idx = (pix[i][0] + pix[i][1] * dat.width) * 4;
  dat.data[idx + 0] = 180;
  dat.data[idx + 1] = 180;
  dat.data[idx + 2] = 180;
  dat.data[idx + 3] = 255;
}
//
ctx.putImageData(dat, 0, 0);
