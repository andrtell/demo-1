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

  static normalize_min_max(lst) {
    let min = lst[0];
    let max = lst[0];
    for (let i = 0; i < lst.length; i++) {
      min = Math.min(min, lst[i]);
      max = Math.max(max, lst[i]);
    }
    const range = max - min;
    if (range == 0) {
      return values;
    }
    for (let i = 0; i < lst.length; i++) {
      lst[i] = (lst[i] - min) / range;
    }
    return values;
  }
}

class Interpolation {
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

  static perlin_1D(v0, v1, mu) {
    const mu0 = [mu, 0];
    const mu1 = [1 - mu, 0];
    return Interpolation.cosine_1D(
      Vector.dot_product(v0, mu0),
      Vector.dot_product(v1, mu1),
      mu,
    );
  }

  static perlin_2D(v0, v1, v2, v3, x_mu, y_mu) {
    const mu0 = [x_mu, y_mu];
    const mu1 = [1 - x_mu, y_mu];
    const mu2 = [x_mu, 1 - y_mu];
    const mu3 = [1 - x_mu, 1 - y_mu];
    return Interpolation.cosine_2D(
      Vector.dot_product(v0, mu0),
      Vector.dot_product(v1, mu1),
      Vector.dot_product(v2, mu2),
      Vector.dot_product(v3, mu3),
      x_mu,
      y_mu,
    );
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
    const PI2 = Math.PI * 2;
    const v = Random.samples(no_samples).map((s) => Vector.unit_rad(s * PI2));
    const p = Random.permutation_1D(no_samples);
    return (x) => {
      return v[p(x)];
    };
  }

  static discrete_vector_2D(no_samples) {
    const PI2 = Math.PI * 2;
    const v = Random.samples(no_samples).map((s) => Vector.unit_rad(s * PI2));
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

  static perlin_noise_1D(no_samples) {
    const grid = Random.discrete_vector_1D(no_samples);
    return (x) => {
      const x_ = Math.floor(x);
      const mu = x - x_;
      return Interpolation.perlin_1D(grid(x_), grid(x_ + 1), mu);
    };
  }

  static value_noise_2D(no_samples) {
    const grid = Random.discrete_number_2D(no_samples);
    return (x, y) => {
      const x_ = Math.floor(x);
      const y_ = Math.floor(y);
      const x_mu = x - x_;
      const y_mu = y - y_;
      return Interpolation.cosine_2D(
        grid(x_, y_),
        grid(x_ + 1, y_),
        grid(x_, y_ + 1),
        grid(x_ + 1, y_ + 1),
        x_mu,
        y_mu,
      );
    };
  }

  static perlin_noise_2D(no_samples) {
    const grid = Random.discrete_vector_2D(no_samples);
    return (x, y) => {
      const x_ = Math.floor(x);
      const y_ = Math.floor(y);
      const x_mu = x - x_;
      const y_mu = y - y_;
      return Interpolation.perlin_2D(
        grid(x_, y_),
        grid(x_ + 1, y_),
        grid(x_, y_ + 1),
        grid(x_ + 1, y_ + 1),
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

const z = Random.perlin_noise_2D(256);

// const pix = [];
//
for (let x = 0; x < can.width; x++) {
  for (let y = 0; y < can.height; y++) {
    let idx = (x + y * dat.width) * 4;
    const val = z(x * 0.01, y * 0.01) * 255;
    dat.data[idx + 0] = val;
    dat.data[idx + 1] = val;
    dat.data[idx + 2] = val;
    dat.data[idx + 3] = 255;
  }
}
//
ctx.putImageData(dat, 0, 0);
