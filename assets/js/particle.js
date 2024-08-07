class List {
  static swap(arr, i, j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }

  static integer_sequence(upper) {
    const seq = [];
    for (let i = 0; i < upper; i++) {
      seq[i] = i;
    }
    return seq;
  }
}

class Interpolation {
  static linear_1D(a, b, mu) {
    return a * (1 - mu) + b * mu;
  }

  static linear_2D(a, b, c, d, x_mu, y_mu) {
    const { linear_1D } = Interpolation;
    y0 = linear_1D(a, b, x_mu);
    y1 = linear_1D(c, d, x_mu);
    return linear_1D(y0, y1, y_mu);
  }

  static cosine_1D(a, b, mu) {
    const mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
    return a * (1 - mu2) + b * mu2;
  }

  static cosine_2D(a, b, c, d, x_mu, y_mu) {
    const { cosine_1D } = Interpolation;
    y0 = cosine_1D(a, b, x_mu);
    y1 = cosine_1D(c, d, x_mu);
    return cosine_1D(y0, y1, y_mu);
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

  static permutation_1D(count) {
    let index = Random.shuffle_list(List.integer_sequence(count));
    return (x) => {
      return index[x % count];
    };
  }

  static permutation_2D(count) {
    let index = Random.shuffle_list(List.integer_sequence(count));
    index = index.concat(index);
    return (x, y) => {
      return index[index[x % count] + (y % count)];
    };
  }

  static discrete_periodic_1D(count) {
    const ns = Random.numbers(count);
    const p1 = Random.permutation_1D(count);
    return (x) => {
      return ns[p1(x)];
    };
  }

  static discrete_periodic_2D(count) {
    const ns = Random.numbers(count);
    const p2 = Random.permutation_2D(count);
    return (x, y) => {
      return ns[p2(x, y)];
    };
  }

  static continuous_periodic_1D(count) {
    const dis = Random.discrete_periodic_1D(count);
    return (x) => {
      const x_ = Math.floor(x);
      const mu = x - x_;
      return Interpolation.linear_1D(dis(x_), dis(x_ + 1), mu);
    };
  }

  static continuous_periodic_2D(count) {
    const dis = Random.discrete_periodic_2D(count);
    return (x, y) => {
      const x_ = Math.floor(x);
      const y_ = Math.floor(y);
      const x_mu = x - x_;
      const y_mu = y - y_;
      return Interpolation.linear_2D(
        dis(x_, y_),
        dis(x_ + 1, y_),
        dic(x_, y_ + 1),
        dis(x_ + 1, y_ + 1),
        x_mu,
        y_mu,
      );
    };
  }
}

n2 = Random.continuous_periodic_1D(100);
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
        y += Interpolation.linear_1D(s0, s1, mu) * amp;
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
