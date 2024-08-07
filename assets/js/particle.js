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
  static smooth(t) {
    return t * t * (3 - 2 * t);
  }

  static linear_1D(a, b, mu) {
    return a * (1 - mu) + b * mu;
  }

  static linear_2D(a, b, c, d, x_mu, y_mu) {
    const { linear_1D } = Interpolation;
    const y0 = linear_1D(a, b, x_mu);
    const y1 = linear_1D(c, d, x_mu);
    return linear_1D(y0, y1, y_mu);
  }

  static cosine_1D(a, b, mu) {
    const mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
    return a * (1 - mu2) + b * mu2;
  }

  static cosine_2D(a, b, c, d, x_mu, y_mu) {
    const { cosine_1D } = Interpolation;
    const y0 = cosine_1D(a, b, x_mu);
    const y1 = cosine_1D(c, d, x_mu);
    return cosine_1D(y0, y1, y_mu);
  }
}

class Vector {
  static vector(x, y) {
    return [x, y];
  }

  static unit_rad(rad) {
    return [Math.cos(rad), Math.sin(rad)];
  }

  static multiply(v, s) {
    return [v[0] * s, v[1] * s];
  }

  static magnitude(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  }

  static normalize(v) {
    return Vector.multiply(v, 1 / Vector.magnitude(v));
  }

  static dot_product(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }
}

class Random {
  static integer(upper) {
    return Math.floor(Math.random() * upper);
  }

  static number(upper) {
    return Math.random() * upper;
  }

  static samples(count) {
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

  static discrete_number_1D(no_samples) {
    const ns = Random.samples(no_samples);
    const p1 = Random.permutation_1D(no_samples);
    return (x) => {
      return ns[p1(x)];
    };
  }

  static discrete_number_2D(no_samples) {
    const ns = Random.samples(no_samples);
    const p2 = Random.permutation_2D(no_samples);
    return (x, y) => {
      return ns[p2(x, y)];
    };
  }

  static discrete_vector_1D(no_samples) {
    const v = Random.samples(no_samples).map((s) => {
      return Vector.unit_rad((s * Math.PI) / 4);
    });
    const p = Random.permutation_1D(no_samples);
    return (x) => {
      return v[p(x)];
    };
  }

  static discrete_vector_2D(no_samples) {
    const v = Random.samples(no_samples).map((s) =>
      Vector.unit_rad(s * Math.PI * 2),
    );
    const p = Random.permutation_2D(no_samples);
    return (x, y) => {
      return v[p(x, y)];
    };
  }

  static value_noise_1D(no_samples) {
    const grid = Random.discrete_number_1D(no_samples);
    return (x) => {
      const x_ = Math.floor(x);
      const mu = x - x_;
      return Interpolation.linear_1D(grid(x_), grid(x_ + 1), mu);
    };
  }

  static value_noise_2D(no_samples) {
    const grid = Random.discrete_number_2D(no_samples);
    return (x, y) => {
      const x_ = Math.floor(x);
      const y_ = Math.floor(y);
      const x_mu = Interpolation.smooth(x - x_);
      const y_mu = Interpolation.smooth(y - y_);
      return Interpolation.linear_2D(
        grid(x_, y_),
        grid(x_ + 1, y_),
        grid(x_, y_ + 1),
        grid(x_ + 1, y_ + 1),
        x_mu,
        y_mu,
      );
    };
  }

  static perlin_noise_1D(no_samples) {
    const grid = Random.discrete_vector_1D(no_samples);
    return (x) => {
      const x_ = Math.floor(x);
      const mu = Interpolation.smooth(x - x_);
      return Interpolation.cosine_1D(
        Vector.dot_product(grid(x_), [mu, 0]),
        Vector.dot_product(grid(x_ + 1), [1 - mu, 0]),
        mu,
      );
    };
  }

  static perlin_noise_2D(no_samples) {
    const grid = Random.discrete_vector_2D(no_samples);
    return (x, y) => {
      const x_ = Math.floor(x);
      const y_ = Math.floor(y);
      const x_mu = Interpolation.smooth(x - x_);
      const y_mu = Interpolation.smooth(y - y_);
      const { dot_product } = Vector;
      return Interpolation.cosine_2D(
        dot_product(grid(x_, y_), [x_mu, y_mu]),
        dot_product(grid(x_ + 1, y_), [1 - x_mu, y_mu]),
        dot_product(grid(x_, y_ + 1), [x_mu, 1 - y_mu]),
        dot_product(grid(x_ + 1, y_ + 1), [1 - x_mu, 1 - y_mu]),
        x_mu,
        y_mu,
      );
    };
  }
}

const can = document.getElementById("canvas");
const bcr = can.getBoundingClientRect();
can.height = bcr.height;
can.width = bcr.width;
const ctx = can.getContext("2d");
const dat = ctx.createImageData(bcr.width, bcr.height);

const perl1 = Random.perlin_noise_2D(256);
const perl2 = Random.perlin_noise_2D(256);
const perl3 = Random.perlin_noise_2D(256);

// const pix = [];
//
for (let x = 0; x < 1000; x++) {
  for (let y = 0; y < 1000; y++) {
    let idx = (x + y * dat.width) * 4;
    dat.data[idx + 0] = Math.abs(perl1(x * 0.05, y * 0.05) * 255);
    dat.data[idx + 1] = Math.abs(perl2(x * 0.05, y * 0.05) * 255);
    dat.data[idx + 2] = Math.abs(perl3(x * 0.05, y * 0.05) * 255);
    dat.data[idx + 3] = 255;
  }
}
//
ctx.putImageData(dat, 0, 0);
